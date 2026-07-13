
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/screen-structure/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-6]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-6';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend, ComposedChart
} from 'recharts';
import { 
  ShieldAlert, Activity, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, Layers, Waves,
  Maximize2, Binary, Search, Share2, Hammer,
  Zap, Info, ScanText,
  // Fix: Added History to the import list to resolve "Cannot find name 'History'" error on line 124
  History
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 结构健康指数演变 (Structural Health Evolution)
const HEALTH_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    stability: 95 - Math.pow(i/12, 1.2) * 5 + Math.random() * 2,
    noise: 10 + Math.pow(i/10, 2) + Math.random() * 5
}));

// 2. 螺栓张力分布矩阵 (Bolt Tension Distribution)
const BOLT_TENSION_DATA = [
    { pos: '前左组', tension: 98, status: 'normal' },
    { pos: '前右组', tension: 95, status: 'normal' },
    { pos: '中左组', tension: 72, status: 'warning' },
    { pos: '中右组', tension: 88, status: 'normal' },
    { pos: '后左组', tension: 92, status: 'normal' },
    { pos: '后右组', tension: 65, status: 'critical' },
];

// 3. 模态频率偏移 (Modal Frequency Drift)
const MODAL_DATA = [
    { mode: '一阶弯曲', design: 12.5, actual: 12.3 },
    { mode: '一阶扭转', design: 18.4, actual: 17.2 },
    { mode: '二阶弯曲', design: 25.6, actual: 24.8 },
    { mode: '侧板呼吸', design: 32.1, actual: 29.5 },
];

export const ScreenStructurePmView: React.FC = () => {
    const [healthScore, setHealthScore] = useState(84.2);
    const [scanActive, setScanActive] = useState(true);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部数字看板 --- */}
            <div className="flex justify-between items-center bg-slate-900/40 border-b border-indigo-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-indigo-600/20 rounded border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] relative">
                        <Maximize2 className="text-indigo-400" size={32} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            筛箱结构松动与裂纹风险监测
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-950/50 border border-indigo-800 rounded">
                                实时模态分析: 启用中
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                传感器节点: 48/48 在线
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">结构完整性指数</div>
                        <div className="text-4xl font-mono font-bold text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                            84.2%
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">疲劳损伤积累</div>
                        <div className="text-3xl font-mono font-bold text-orange-400">0.124 <span className="text-sm">D</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互矩阵布局 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：模态与特征提取 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 固有频率偏移分析 */}
                    <SciFiCard title="模态频率漂移监测" subtitle="MODAL DRIFT" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MODAL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="mode" stroke="#64748b" tick={{fontSize: 9}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '9px'}} />
                                    <Bar dataKey="design" name="设计值 (Hz)" fill="#334155" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="actual" name="实时值 (Hz)" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 p-2 bg-indigo-900/10 rounded border border-indigo-900/30 text-[10px] text-indigo-300">
                           <Info className="inline mr-2" size={10}/>
                           频率下降 &gt; 5% 通常指示结构刚度由于松动或裂纹而削弱。
                        </div>
                    </SciFiCard>

                    {/* 结构响应指纹 */}
                    <SciFiCard title="非线性响应特征" subtitle="STRUCTURAL SIGNATURE">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={HEALTH_TREND}>
                                    <defs>
                                        <linearGradient id="stbGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="stability" stroke="#8b5cf6" fill="url(#stbGrad)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="noise" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>低噪环境</span>
                            <span className="text-purple-500">动态稳定性</span>
                            <span className="text-red-500">松动杂波信号</span>
                        </div>
                    </SciFiCard>

                    {/* AI 诊断深度学习模型 */}
                    <SciFiCard title="智能识别决策" subtitle="AI INFERENCE" className="flex-1">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-1 p-2 bg-slate-950 rounded border border-slate-800">
                                {Array.from({length: 40}).map((_, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.8 ? 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                            <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded text-xs text-red-200">
                                <AlertCircle className="inline mr-2" size={14} />
                                模式匹配：检测到 82% 概率属于“横梁联接点非线性松动”。
                            </div>
                            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
                                <ScanText size={14} /> 生成结构加固建议
                            </button>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D 扫描与实时透视 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-2xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-6 left-6 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-sm border border-indigo-500/30">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-[11px] text-indigo-400 font-black tracking-widest uppercase">全结构数字孪生实时扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">最大等效应力</span>
                                    <span className="text-white font-mono font-bold">142.5 MPa</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">工作转速</span>
                                    <span className="text-indigo-400 font-mono font-bold">980 RPM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">结构阻尼比</span>
                                    <span className="text-green-400 font-mono font-bold">0.024</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: '78%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 扫描状态图例 */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
                            <div className="bg-black/60 px-3 py-1 rounded-full border border-slate-800 text-[10px] text-slate-500">
                                扫描频率: <span className="text-indigo-400 font-bold">50.0 Hz</span>
                            </div>
                        </div>

                        <ThreeScene looseningSeverity={0.4} showCracks={true} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 交互工具条 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-black rounded-sm border border-indigo-900/50 transition-all flex items-center gap-3">
                                <Binary size={16} /> 特征信号回溯
                            </button>
                            <button className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-sm border border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-3">
                                <Zap size={16} /> 启动应力仿真
                            </button>
                        </div>
                        
                        {/* 扫描线动画效果 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(99,102,241,0.05)_50%)] bg-[length:100%_8px] animate-[scan_12s_linear_infinite]"></div>
                    </div>

                    {/* 应力场分布图表 */}
                    <SciFiCard title="关键节点应力强度分布" subtitle="STRESS MAPPING" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                    { subject: '左侧板-前', A: 45, fullMark: 100 },
                                    { subject: '右侧板-前', A: 42, fullMark: 100 },
                                    { subject: '主横梁', A: 85, fullMark: 100 },
                                    { subject: '激振器座', A: 78, fullMark: 100 },
                                    { subject: '左侧板-后', A: 35, fullMark: 100 },
                                    { subject: '右侧板-后', A: 38, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#1e293b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Stress" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：紧固件与细节参数 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 螺栓组健康热力矩阵 */}
                    <SciFiCard title="螺栓紧固力热力图" subtitle="BOLT TENSION">
                        <div className="space-y-3 py-2">
                            {BOLT_TENSION_DATA.map((bolt, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{bolt.pos}</span>
                                        <span className={bolt.status === 'critical' ? 'text-red-500 animate-pulse' : 'text-slate-100'}>{bolt.tension}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${bolt.status === 'critical' ? 'bg-red-500' : bolt.status === 'warning' ? 'bg-yellow-500' : 'bg-indigo-500'}`} 
                                          style={{ width: `${bolt.tension}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase">异常节点</div>
                                <div className="text-sm font-bold text-red-500">03</div>
                            </div>
                            <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-800 text-center">
                                <div className="text-[9px] text-slate-500 uppercase">监测频率</div>
                                <div className="text-sm font-bold text-white">100Hz</div>
                            </div>
                        </div>
                    </SciFiCard>

                    {/* 传感器实时流阵列 */}
                    <SciFiCard title="结构多维健康指标" subtitle="LIVE DATA" className="flex-1">
                        <div className="space-y-2">
                            {[
                                { label: '动应变峰值', val: '245', unit: 'με', status: 'normal' },
                                { label: '加速度均方根', val: '12.4', unit: 'g', status: 'warning' },
                                { label: '横梁轴向位移', val: '0.04', unit: 'mm', status: 'normal' },
                                { label: '局部温升 (焊缝)', val: '42.8', unit: '°C', status: 'normal' },
                                { label: '连接件刚度系数', val: '0.88', unit: 'Index', status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-indigo-500/30 transition-all">
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

                    {/* 历史失效案例比对 */}
                    <SciFiCard title="相似裂纹特征库" subtitle="HISTORY">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">#H-STRUCT-024 (2021)</div>
                                    <div className="text-[9px] text-slate-500">焊缝疲劳匹配度: 74%</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 状态页脚 --- */}
            <div className="h-10 bg-indigo-950/20 border-t border-indigo-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘计算核心: 通信正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">特征解耦延迟: 14ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Brain size={12} /> Structural Integrity Guard (SIG) Engine Active v4.2.1
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
