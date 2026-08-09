
import React, { useState } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/ship-engine-rul/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-31]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-31';
import { ComponentLifeState } from '../../../components/predictive/ship-engine-rul/three-types';
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
  Hourglass, Calendar, Flame, Microscope, Clock,
  Ship, Anchor, HardDrive, MonitorPlay
} from 'lucide-react';

// --- MOCK DATA ---

const COMPONENT_LIVES: ComponentLifeState[] = [
    { id: 'piston-1', name: '1# 活塞组件', remainingLife: 0.82, isHot: false },
    { id: 'liner-1', name: '1# 气缸套', remainingLife: 0.54, isHot: true },
    { id: 'crank', name: '主曲轴系', remainingLife: 0.91, isHot: false },
    { id: 'turbo', name: '高压增压器', remainingLife: 0.32, isHot: true },
    { id: 'bearing-main', name: '主轴承组', remainingLife: 0.65, isHot: false },
];

// 寿命衰减轨迹
const LIFE_DECAY_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: `T+${i}`,
    val: 85 - Math.pow(i/5, 1.8) * 3 + Math.random() * 2,
    linear: 85 - i * 1.5,
    threshold: 40
}));

// 劣化因子贡献度
const FACTOR_IMPACT = [
    { name: '燃油硫含量', val: 85, fill: '#ef4444' },
    { name: '平均负荷率', val: 72, fill: '#f59e0b' },
    { name: '润滑油BN值', val: 45, fill: '#0ea5e9' },
    { name: '气缸爆压偏差', val: 64, fill: '#8b5cf6' },
];

export const ShipEngineRulPmView: React.FC = () => {
    const [simMode, setSimMode] = useState<'economic' | 'normal' | 'power'>('normal');

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板：系统可靠性总览 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <Hourglass className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            主机关键部件剩余寿命(RUL)推演中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/30 rounded">
                                寿命算法: Particle-Filter + LSTM v5.0
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                船舶: MV OCEAN-GUARDIAN | IMO: 9876543
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">系统整体健康度</div>
                        <div className="text-4xl font-mono font-bold text-emerald-400 drop-shadow-[0_0:10px_rgba(16,185,129,0.5)]">
                            88.4 <span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">关键失效倒计时</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">452 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：部件寿命堆栈 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    <SciFiCard title="部件寿命倒计时堆栈" subtitle="COMPONENT STACK" highlight className="bg-[#0c1221]">
                        <div className="space-y-5 py-2">
                            {COMPONENT_LIVES.map((comp, i) => (
                                <div key={i} className="group relative p-3 bg-slate-900/50 rounded border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${comp.remainingLife < 0.4 ? 'bg-rose-500 animate-ping' : 'bg-cyan-500'}`}></div>
                                            <span className="text-xs font-bold text-white">{comp.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-mono ${comp.remainingLife < 0.4 ? 'text-rose-500' : 'text-slate-400'}`}>
                                            RUL: {(comp.remainingLife * 5000).toFixed(0)}h
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${comp.remainingLife < 0.4 ? 'bg-rose-600' : comp.remainingLife < 0.7 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${comp.remainingLife * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="absolute right-2 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={14} className="text-cyan-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 寿命损耗敏感度雷达 */}
                    <SciFiCard title="寿命损耗特征敏感度" subtitle="SENSITIVITY ANALYSIS">
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '热疲劳', A: 85, fullMark: 100 },
                                    { subject: '磨粒磨损', A: 42, fullMark: 100 },
                                    { subject: '化学腐蚀', A: 65, fullMark: 100 },
                                    { subject: '交变应力', A: 92, fullMark: 100 },
                                    { subject: '润滑失效', A: 38, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Impact" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D寿命场全息视角 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 寿命热力视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,1)] group">
                        {/* HUD 交互层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-cyan-500/30">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
                                <span className="text-[12px] text-cyan-400 font-black tracking-widest uppercase">全系统剩余寿命场实时映射扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大劣化源</span>
                                    <span className="text-rose-500 font-mono font-bold">增压器端轴承</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">模型置信度</span>
                                    <span className="text-white font-mono font-bold">96.8 %</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">数据采集节点</span>
                                    <span className="text-emerald-400 font-mono font-bold">142/145</span>
                                </div>
                            </div>
                        </div>

                        <ThreeScene components={COMPONENT_LIVES} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部功能栏 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded border border-cyan-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 寿命下钻深度检索
                            </button>
                            <button className="px-10 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-3">
                                <MonitorPlay size={16} /> 启动蒙特卡洛生存仿真
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 寿命衰减轨迹预测图表 */}
                    <SciFiCard title="寿命衰减轨迹预测 (Degradation Path)" subtitle="TEMPORAL FORECAST" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={LIFE_DECAY_DATA}>
                                    <defs>
                                        <linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Area type="monotone" dataKey="val" name="AI 预测轨迹" stroke="#0ea5e9" fill="url(#lifeGrad)" strokeWidth={3} />
                                    <Line type="monotone" dataKey="linear" name="理想线性衰减" stroke="#334155" strokeDasharray="5 5" dot={false} />
                                    <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '强制报废门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：劣化因子与仿真设置 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 劣化贡献因子分析 */}
                    <SciFiCard title="当前劣化因子贡献权重" subtitle="IMPACT FACTORS">
                        <div className="h-48 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={FACTOR_IMPACT} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#020617' }} />
                                    <Bar dataKey="val" radius={[0, 2, 2, 0]} barSize={12}>
                                        {FACTOR_IMPACT.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 寿命博弈仿真器 */}
                    <SciFiCard title="寿命博弈仿真设置" subtitle="SIMULATION" className="flex-1">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">运行工况模拟 (Operation Mode)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {['economic', 'normal', 'power'].map(mode => (
                                        <button 
                                            key={mode}
                                            onClick={() => setSimMode(mode as any)}
                                            className={`py-2 rounded text-[10px] font-bold border transition-all uppercase
                                                ${simMode === mode ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}
                                            `}
                                        >
                                            {mode === 'economic' ? '节能' : mode === 'normal' ? '常规' : '满负荷'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-indigo-300 font-bold uppercase">预期寿命影响</span>
                                    <span className={`text-xs font-bold ${simMode === 'power' ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        {simMode === 'power' ? '-12.5%' : simMode === 'economic' ? '+8.2%' : '±0%'}
                                    </span>
                                </div>
                                <div className="text-[9px] text-slate-500 leading-relaxed italic">
                                    * 基于当前的燃油硫含量 (0.5%) 与环境海况 (4级) 推算。
                                </div>
                            </div>

                            <div className="mt-auto space-y-2 pt-4 border-t border-slate-800">
                                <button className="w-full py-2.5 bg-slate-800 hover:bg-cyan-700 text-white text-[11px] font-bold rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                                    <HardDrive size={14} /> 生成寿命分析预测周报
                                </button>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 维护履历对照 */}
                    <SciFiCard title="同型号寿命指纹匹配" subtitle="HISTORY CLUSTER">
                        <div className="space-y-2">
                            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-300 font-bold">集群匹配度: 91.4%</div>
                                    <div className="text-[9px] text-slate-500">匹配库: MAN-Fleet-Cloud</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统状态页脚 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">中央数据同步: 活跃</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Predictor-Core v5.0.4 - Structural Shield Active
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
