import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/propulsion-shaft-misalignment/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-36]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-36';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, ShieldCheck, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  Compass, Workflow, Microscope, Box, Ruler, Move,
  /* Fix: Added missing icons Eye and AlertTriangle to imports */
  Eye, AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 2X谐波分量趋势 (Misalignment Signature)
const HARMONIC_DATA = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    h1x: 1.2 + Math.random() * 0.1,
    h2x: 0.4 + (i > 15 ? (i-15)*0.15 : 0) + Math.random() * 0.1,
    limit: 1.5
}));

// 2. 联轴器对中参数矩阵 (Sag & Gap)
const ALIGNMENT_MATRIX = [
    { point: '主机-推力轴承', sag: 0.05, gap: 0.02, status: 'normal' },
    { point: '推力轴承-中间轴', sag: 0.12, gap: 0.08, status: 'warning' },
    { point: '中间轴-艉轴', sag: 0.28, gap: 0.15, status: 'critical' },
];

// 3. 轴承支反力分布 (Bearing Reaction)
const REACTION_FORCES = [
    { name: 'Brg-1', value: 450, design: 420 },
    { name: 'Brg-2', value: 380, design: 400 },
    { name: 'Brg-3', value: 850, design: 450 }, // 严重超载
    { name: 'Brg-4', value: 210, design: 410 }, // 载荷过轻
];

export const PropulsionShaftMisalignmentPmView: React.FC = () => {
    const [misalignmentIndex] = useState(74.5);
    const [viewMode, setViewMode] = useState<'standard' | 'xray'>('standard');

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部：高精对中监控中心 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-indigo-500/30 p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,#1e293b_1px,transparent_1px),linear-gradient(#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-indigo-600/20 rounded border border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                        <Ruler className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            推进轴系不对中劣化预测指挥台
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>监测规程: ISO 10816-3</span>
                            <span>对中精度: 0.001 MM | 轴线跨度: 24.5 M</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6 relative z-10">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">对中完整性指数</div>
                        <div className="text-4xl font-mono font-bold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                            {100 - misalignmentIndex}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">最大垂直偏差</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 tracking-tighter">0.28 <span className="text-sm">MM</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互区：横向长轴跨度 --- */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                
                {/* 核心 3D 全景透视 */}
                <div className="h-[450px] relative bg-[#01050a] border border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)] group">
                    <div className="absolute top-8 left-8 z-10 space-y-4">
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-indigo-500/30">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                            <span className="text-[12px] text-indigo-400 font-black tracking-widest uppercase">轴系理想基准线同步扫描</span>
                        </div>
                        
                        <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase">最大挠度 (SAG)</span>
                                <span className="text-rose-500 font-mono font-bold">0.42 mm</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase">曲折度系数</span>
                                <span className="text-white font-mono font-bold">1.24 Δ</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 uppercase">预测失效周期</span>
                                <span className="text-orange-400 font-mono font-bold">142 天</span>
                            </div>
                        </div>
                    </div>

                    <ThreeScene misalignmentFactor={misalignmentIndex / 100} viewMode={viewMode} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                    {/* 右侧快速状态栏 */}
                    <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
                         <button 
                            onClick={() => setViewMode(viewMode === 'standard' ? 'xray' : 'standard')}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded border border-indigo-400 transition-all flex items-center gap-2 shadow-lg"
                         >
                            <Eye size={14} /> {viewMode === 'standard' ? '进入透视模式' : '返回实景视图'}
                         </button>
                    </div>

                    {/* 底部交互区 */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                        <button className="px-12 py-3 bg-slate-900/90 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-black rounded border border-indigo-900/50 transition-all flex items-center gap-3">
                            <Binary size={16} /> 法兰偏移计算书
                        </button>
                        <button className="px-12 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-3">
                            <Workflow size={16} /> 仿真工况迁移
                        </button>
                    </div>
                </div>

                {/* 底部数据矩阵：三栏式不对中解剖 */}
                <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 pb-2">
                    
                    {/* 左侧：谐波特征 (诊断核心) */}
                    <SciFiCard title="2X 谐波分量演化趋势" subtitle="HARMONIC SIGNATURE" className="col-span-4 bg-[#0c1221]">
                        <div className="h-full w-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={HARMONIC_DATA}>
                                    <defs>
                                        <linearGradient id="h2xGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Area type="monotone" dataKey="h2x" name="2X 谐波(不对中特征)" stroke="#818cf8" fill="url(#h2xGrad)" strokeWidth={3} />
                                    <Line type="monotone" dataKey="h1x" name="1X 转频" stroke="#334155" dot={false} strokeDasharray="5 5" />
                                    <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="10 5" label={{ value: '异常门限', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 中间：支反力评估 */}
                    <SciFiCard title="轴承支反力分配图 (Reaction)" subtitle="LOAD DISTRIBUTION" className="col-span-4">
                        <div className="h-full w-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={REACTION_FORCES} margin={{top:20, right:20, bottom:0, left:-20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Bar dataKey="value" name="实测载荷" radius={[2, 2, 0, 0]}>
                                        {REACTION_FORCES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={Math.abs(entry.value - entry.design) > 100 ? '#ef4444' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="design" name="设计理想载荷" fill="#1e293b" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>

                    {/* 右侧：对中矩阵细节 */}
                    <SciFiCard title="法兰对中偏差详情" subtitle="SAG & GAP MATRIX" className="col-span-4 bg-[#080d19]">
                        <div className="flex flex-col gap-4 py-2">
                             {ALIGNMENT_MATRIX.map((item, i) => (
                                <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded relative group overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-bold text-white">{item.point}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase
                                            ${item.status === 'critical' ? 'bg-red-900 text-red-400 animate-pulse' : item.status === 'warning' ? 'bg-orange-900 text-orange-400' : 'bg-green-900 text-green-400'}
                                        `}>{item.status}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase">Sag (位移)</div>
                                            <div className="text-xl font-mono font-bold text-indigo-400">{item.sag} <span className="text-xs font-normal">mm</span></div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase">Gap (张口)</div>
                                            <div className="text-xl font-mono font-bold text-cyan-400">{item.gap} <span className="text-xs font-normal">mm</span></div>
                                        </div>
                                    </div>
                                    {/* 背景装饰线 */}
                                    <div className="absolute bottom-0 right-0 p-2 opacity-5">
                                        <Move size={48} className="text-indigo-500" />
                                    </div>
                                </div>
                             ))}
                             <div className="mt-auto p-3 bg-indigo-900/10 border border-indigo-500/20 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain size={16} className="text-indigo-400" />
                                    <span className="text-xs font-bold text-indigo-200">故障机理预测</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                    当前不对中趋势主导因素为 <span className="text-white font-bold">“艉部船体弹性下沉”</span>。预测在满载压载工况下，#3 轴承载荷将突破 900kN。
                                </p>
                             </div>
                        </div>
                    </SciFiCard>

                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">激光测距网: 联机</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">模型偏移修正延迟: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Kinetic-Alignment Engine v6.2.0 - Structural Guardian Active
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
