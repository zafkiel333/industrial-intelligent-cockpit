
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/predictive/thickener-drive/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-pmOther-23]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-pmOther-23';
import { DriveViewMode } from '../../components/predictive/thickener-drive/three-types';
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
  Tractor, Scale, Box, Wind, Radio, Play,
  HardDrive, MonitorPlay
} from 'lucide-react';

// --- MOCK DATA ---

// 1. 扭矩载荷分布 (Torque Load Distribution)
const TORQUE_TREND = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    torque: 45 + Math.sin(i / 2) * 15 + (i > 16 ? (i-16)*10 : 0), // 模拟末端过载
    pressure: 12 + Math.sin(i / 2) * 2,
    limit: 85
}));

// 2. 扭矩-浓度关联散射 (Torque vs Underflow Density)
const CORRELATION_DATA = Array.from({ length: 40 }, (_, i) => ({
    density: 1.4 + Math.random() * 0.4,
    torque: 40 + (i * 1.5) + (Math.random() - 0.5) * 10
}));

// 3. 齿面失效特征频谱 (Gear Failure Spectrum)
const GEAR_SPECTRUM = [
    { name: '1X 转频', val: 15, status: 'normal' },
    { name: '啮合频率', val: 42, status: 'normal' },
    { name: '边频带能量', val: 78, status: 'critical' }, // 齿面点蚀特征
    { name: '冲击脉冲', val: 32, status: 'warning' },
    { name: '背景噪声', val: 10, status: 'normal' },
];

export const ThickenerDrivePmView: React.FC = () => {
    const [viewMode, setViewMode] = useState<DriveViewMode>('solid');
    const [healthScore] = useState(76.5);
    const [instantTorque] = useState(68.2);

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617]">
            
            {/* --- 顶部 HUD：驱动生命体征 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-orange-500/30 p-4">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-orange-600/20 rounded-sm border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <Settings className="text-orange-400 animate-spin-slow" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            浓缩机驱动装置失效预测中心
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-orange-950/50 border border-orange-800/30 rounded">
                                监测模态: 多级减速机构动力学
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded">
                                型号: NGL-400/120 | 额定扭矩: 400 kNm
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">装置健康得分</div>
                        <div className="text-4xl font-mono font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                            {healthScore} <span className="text-sm">/ 100</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计失效窗口</div>
                        <div className="text-3xl font-mono font-bold text-rose-500 animate-pulse">248 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互分析矩阵 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2">
                
                {/* 左侧：载荷动力学与相关性 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    
                    {/* 实时扭矩趋势图 */}
                    <SciFiCard title="扭矩载荷实时监测" subtitle="TORQUE DYNAMICS" highlight className="bg-[#0c1221]">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TORQUE_TREND} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="torque" stroke="#f97316" fill="url(#torqueGrad)" strokeWidth={2} name="扭矩(kNm)" />
                                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{value: '极限跳闸点', fill: '#ef4444', fontSize: 10}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <div className="text-[10px] text-slate-500 uppercase">当前瞬时扭矩</div>
                            <span className="text-sm font-mono font-bold text-orange-400">{instantTorque} kNm</span>
                        </div>
                    </SciFiCard>

                    {/* 扭矩-浓度关联散射图 */}
                    <SciFiCard title="扭矩-底流浓度关联分析" subtitle="CORRELATION">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="density" name="浓度" unit="sg" stroke="#64748b" tick={{fontSize: 9}} domain={['auto', 'auto']} />
                                    <YAxis type="number" dataKey="torque" name="扭矩" unit="kNm" stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#020617'}} />
                                    <Scatter name="Operating" data={CORRELATION_DATA} fill="#0ea5e9" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 italic text-center">
                            模型推演：底流浓度每提升 0.1sg，扭矩负载增加 12.5%。
                        </div>
                    </SciFiCard>

                    {/* AI 诊断推演报告 */}
                    <SciFiCard title="AI 专家诊断结论" subtitle="AI DIAGNOSIS" className="flex-1">
                        <div className="space-y-4">
                            <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded text-[11px] text-red-100 leading-relaxed">
                                <Brain className="inline mr-2 text-red-400" size={14} />
                                <span className="font-bold">深度解析：</span> 监测到行星架二级输出端出现非周期性高频脉冲，匹配 <span className="text-white font-bold underline">齿轮点蚀早期特征</span>。且当前油液金属磨屑（Fe）增长率超标 15%。
                            </div>
                            <div className="space-y-2">
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <Wrench size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">执行液压站泄压与主驱动复位</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="group flex items-center gap-3 p-2.5 bg-slate-800/50 hover:bg-orange-900/40 rounded border border-slate-700 cursor-pointer transition-all">
                                    <MonitorPlay size={16} className="text-orange-400" />
                                    <span className="text-[11px] text-slate-300">调取同型号失效全寿命图谱</span>
                                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 中间：3D数字孪生与诊断视角 */}
                <div className="col-span-6 flex flex-col gap-4 min-h-0">
                    
                    {/* 3D 驱动核心视窗 */}
                    <div className="flex-1 relative bg-[#02040a] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)] group">
                        {/* HUD 覆盖层 */}
                        <div className="absolute top-8 left-8 z-10 space-y-4">
                            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-sm border border-orange-500/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shadow-[0_0_10px_orange]"></div>
                                <span className="text-[12px] text-orange-400 font-black tracking-widest uppercase">驱动总成结构完整性同步扫描</span>
                            </div>
                            
                            <div className="bg-black/40 p-4 rounded-sm border border-slate-800 backdrop-blur-sm space-y-3 w-52">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">主减速比</span>
                                    <span className="text-white font-mono font-bold">1:1250</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">齿轮啮合能级</span>
                                    <span className="text-orange-400 font-mono font-bold">4.82 gE</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">油液清洁度</span>
                                    <span className="text-emerald-400 font-mono font-bold">NAS 7</span>
                                </div>
                            </div>
                        </div>

                        {/* 视图切换 */}
                        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                            {(['solid', 'xray', 'stress'] as DriveViewMode[]).map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded text-[10px] font-bold border transition-all uppercase tracking-widest
                                        ${viewMode === mode ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'}
                                    `}
                                >
                                    {mode === 'solid' ? '实景' : mode === 'xray' ? '解构' : '应力'}
                                </button>
                            ))}
                        </div>

                        <ThreeScene torqueLevel={instantTorque / 100} healthStatus={healthScore / 100} viewMode={viewMode} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

                        {/* 底部功能按钮 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                            <button className="px-10 py-2.5 bg-slate-900/90 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-black rounded border border-orange-900/50 transition-all flex items-center gap-3">
                                <Search size={16} /> 微米级点蚀扫描
                            </button>
                            <button className="px-10 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center gap-3">
                                <RefreshCw size={16} /> 仿真模型参数校准
                            </button>
                        </div>
                        
                        {/* 装饰性扫描线 */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(249,115,22,0.02)_50%)] bg-[length:100%_12px] animate-[scan_20s_linear_infinite]"></div>
                    </div>

                    {/* 温升与振动相关性图表 */}
                    <SciFiCard title="主轴轴承温升与有效振幅关联分析" subtitle="THERMAL-VIBRATION CORRELATION" className="h-[250px] bg-[#050b16]">
                        <div className="w-full h-full p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={TORQUE_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                                    <YAxis yAxisId="left" stroke="#f43f5e" tick={{fontSize: 10}} label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: '振动 (mm/s)', angle: 90, position: 'insideRight', fill: '#0ea5e9', fontSize: 10 }} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#f43f5e" strokeWidth={2} name="轴承座温度" dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#0ea5e9" strokeWidth={2} name="振动有效值" dot={{r: 3}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧：理化指标与资产详情 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar">
                    
                    {/* 齿轮啮合特征频谱 */}
                    <SciFiCard title="齿面缺陷频域指纹" subtitle="VIB SPECTRUM">
                        <div className="space-y-4 py-2">
                            {GEAR_SPECTRUM.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.name}</span>
                                        <span className={item.status === 'critical' ? 'text-red-500' : 'text-slate-100'}>{item.val} dB</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 油液健康多指标矩阵 */}
                    <SciFiCard title="驱动润滑油质全检" subtitle="LUBE HEALTH" className="flex-1">
                        <div className="space-y-3">
                            {[
                                { label: '粘度稳定性', val: '92%', status: 'normal' },
                                { label: 'Fe金属磨屑', val: '45 ppm', status: 'warning' },
                                { label: '水分含量', val: '0.02%', status: 'normal' },
                                { label: '润滑泵母管压力', val: '0.35 MPa', status: 'normal' },
                                { label: '磁性栓吸附量', val: 'Med', status: 'warning' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-orange-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'normal' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-lg font-mono font-bold text-white">{item.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SciFiCard>

                    {/* 近期风险预测日志 */}
                    <SciFiCard title="风险推演历史记录" subtitle="O&M HISTORY">
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-950/60 rounded border border-slate-800 flex items-center gap-3">
                                <History size={16} className="text-slate-500" />
                                <div>
                                    <div className="text-[10px] text-slate-200">2024-05-18: 完成二级减速检查</div>
                                    <div className="text-[9px] text-slate-500">结果: 齿面无肉眼可见剥落</div>
                                </div>
                            </div>
                        </div>
                    </SciFiCard>
                </div>

            </div>

            {/* --- 系统页脚状态栏 --- */}
            <div className="h-10 bg-orange-950/20 border-t border-orange-500/20 px-6 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">力矩传感器阵列: 在线正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">边缘网关时延: 12ms</span>
                    </div>
                </div>
                <div className="text-[10px] text-orange-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Torque-Neuro Inference Core v3.8 - Predictive Guard
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
