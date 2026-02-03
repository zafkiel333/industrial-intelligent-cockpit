
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/predictive/marine-crane/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, Cell, ReferenceLine, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  Activity, Zap, ShieldAlert, Cpu, AlertCircle, 
  TrendingUp, Gauge, Wrench, Thermometer, Brain,
  ChevronRight, Timer, History, Layers, Waves,
  Settings, Droplets, Target, Binary, BarChart3,
  Search, ScanLine, Magnet, Disc, RefreshCw,
  RotateCw, Play, Info, ShieldCheck, Microscope,
  ArrowRightLeft, AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 振动包络特征 (Vibration Envelope - 识别轴承点蚀)
const VIB_ENVELOPE_DATA = Array.from({ length: 40 }, (_, i) => ({
    freq: i * 2.5,
    val: i === 12 ? 85 : i === 24 ? 40 : Math.random() * 15 + 5,
    threshold: 55
}));

// 2. 回转转矩脉动 (Torque Ripple - 识别齿面磨损)
const TORQUE_RIPPLE = Array.from({ length: 36 }, (_, i) => ({
    angle: i * 10,
    actual: 120 + Math.sin(i / 2) * 15 + (i > 25 ? (i-25)*8 : 0), // 模拟末端啮合不畅
    design: 120 + Math.sin(i / 2) * 12
}));

// 3. 螺栓预紧力分布 (Bolt Tension - 4个象限)
const BOLT_TENSION = [
    { zone: 'Q1 (前部)', val: 98, status: 'normal' },
    { zone: 'Q2 (右部)', val: 95, status: 'normal' },
    { zone: 'Q3 (后部)', val: 74, status: 'warning' }, // 模拟后部松动
    { zone: 'Q4 (左部)', val: 92, status: 'normal' },
];

export const MarineCraneSlewingPmView: React.FC = () => {
    const [isRotating, setIsRotating] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [healthScore] = useState(82.4);

    const handleTestRotation = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 5000);
    };

    return (
        <div className="flex flex-col h-full gap-4 text-slate-100 font-[Rajdhani] select-none bg-[#020617] overflow-hidden">
            
            {/* --- 顶部战略看板 --- */}
            <div className="flex justify-between items-center bg-[#0a1121]/90 border-b border-cyan-500/30 p-4 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-cyan-600/20 rounded border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <RotateCw className={`text-cyan-400 ${isRotating ? 'animate-spin' : ''}`} size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                            船用起重机回转机构健康评估
                        </h1>
                        <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>计算模态: Kinetic-Stress-Coupling v5.2</span>
                            <span>资产编号: MCRANE-A14-SLEW</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 items-center pr-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">支承完整性得分</div>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            {healthScore}<span className="text-sm">%</span>
                        </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">预计健康服役期 (RUL)</div>
                        <div className="text-3xl font-mono font-bold text-amber-500">1,248 <span className="text-sm">HRS</span></div>
                    </div>
                </div>
            </div>

            {/* --- 主交互区域 --- */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-4 pb-4 relative">
                
                {/* 3D 数字孪生全景 (背景层) */}
                <div className="absolute inset-0 z-0">
                    <ThreeScene healthScore={healthScore} isOperating={isRotating} />
                </div>

                {/* 左侧诊断侧翼 */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar z-10">
                    
                    {/* 振动包络谱 */}
                    <SciFiCard title="回转支承包络谱分析" subtitle="ENVELOPE FFT" highlight className="bg-[#0c1221]/90 backdrop-blur-xl">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={VIB_ENVELOPE_DATA} margin={{top:10, right:5, left:-20, bottom:0}}>
                                    <defs>
                                        <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="freq" hide />
                                    <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617', border: 'none'}} />
                                    <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#vibGrad)" strokeWidth={2} name="能量谱 (gE)" />
                                    <ReferenceLine y={55} stroke="#ef4444" strokeDasharray="5 5" label={{value:'疲劳限', fill:'#ef4444', fontSize:8}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">特征匹配：<span className="text-white">典型轴向受力不均</span></span>
                            <span className="text-cyan-400 font-mono">Matched 89%</span>
                        </div>
                    </SciFiCard>

                    {/* 转矩脉动图表 */}
                    <SciFiCard title="回转转矩脉动与平稳度" subtitle="TORQUE RIPPLE" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={TORQUE_RIPPLE}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="angle" stroke="#64748b" tick={{fontSize: 9}} interval={6} />
                                    <YAxis hide domain={[80, 160]} />
                                    <Tooltip contentStyle={{backgroundColor: '#020617'}} />
                                    <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} name="实测转矩" />
                                    <Line type="monotone" dataKey="design" stroke="#475569" strokeDasharray="5 5" dot={false} name="基准值" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-1 text-[9px] text-center text-rose-400 font-bold uppercase italic animate-pulse">
                            检测到 250° - 300° 区间啮合阻力异常激增
                        </div>
                    </SciFiCard>

                    {/* AI 推演简报 */}
                    <SciFiCard title="AI 专家劣变推演" subtitle="AI INFERENCE" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded text-[11px] text-indigo-100 leading-relaxed italic">
                                <Brain className="inline mr-2 text-indigo-400" size={14} />
                                <span className="font-bold uppercase">诊断简报:</span> 监测到回转角度在 270° 象限处伴随有高频声发射（AE）撞击指纹。判定为该位置 <span className="text-white font-bold underline">齿圈局部点蚀与油脂膜破裂</span>。预测在持续重载作业 D+15 后，啮合间隙将扩大 0.05mm。
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 右侧诊断侧翼 */}
                <div className="col-span-3 col-start-10 flex flex-col gap-4 overflow-y-auto pl-1 custom-scrollbar z-10">
                    
                    {/* 螺栓紧固力矩阵 */}
                    <SciFiCard title="连接螺栓紧固态势" subtitle="BOLT TENSION" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-4 py-2">
                             {BOLT_TENSION.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">{item.zone}</span>
                                        <span className={item.status === 'warning' ? 'text-orange-400' : 'text-slate-100'}>{item.val}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                        <div 
                                          className={`h-full transition-all duration-1000 ${item.status === 'warning' ? 'bg-orange-500' : 'bg-cyan-500'}`} 
                                          style={{ width: `${item.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </SciFiCard>

                    {/* 感知阵列实时流 */}
                    <SciFiCard title="传感器实时数据阵列" subtitle="STREAM" className="flex-1 bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-3">
                            {[
                                { label: '回转马达电流', val: '142', unit: 'A', status: 'normal' },
                                { label: '轴承径向偏摆', val: '0.12', unit: 'mm', status: 'warning' },
                                { label: '自动润滑压力', val: '0.45', unit: 'MPa', status: 'normal' },
                                { label: '齿顶间隙(Est)', val: '1.24', unit: 'mm', status: 'normal' },
                                { label: '倾覆力矩系数', val: '0.82', unit: 'Idx', status: 'normal' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-2.5 bg-slate-800/40 rounded border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">{item.label}</span>
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

                    {/* 维护建议项 */}
                    <SciFiCard title="预测驱动维护包" subtitle="ACTIONS" className="bg-[#0c1221]/80 backdrop-blur-md">
                        <div className="space-y-2">
                            <div className="p-3 bg-rose-950/20 rounded border border-rose-900/50 flex items-center gap-3">
                                <Wrench size={20} className="text-rose-400" />
                                <div>
                                    <div className="text-[10px] text-rose-100 font-bold uppercase">执行后部螺栓组复紧</div>
                                    <div className="text-[9px] text-rose-600 font-bold italic">建议在 D+2 航行窗口执行</div>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-rose-600" />
                            </div>
                        </div>
                    </SciFiCard>
                </div>

                {/* 底部悬浮战术托盘 (防止遮挡模型) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[60%] bg-black/70 backdrop-blur-2xl border border-slate-700 p-5 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-8">
                     <div className="flex flex-col gap-1 flex-1 px-4 border-r border-slate-800">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                            <div className="flex items-center gap-2 text-cyan-400"><TrendingUp size={14} /> 回转啮合力场实时扫描 (Meshing Scan)</div>
                            <span>Active: {isRotating ? 'SCANNING' : 'IDLE'}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div className={`h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_#06b6d4] ${isRotating ? 'animate-pulse' : ''}`} style={{width: isRotating ? '100%' : '15%'}}></div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4 pr-4">
                        <button 
                            onClick={handleTestRotation}
                            disabled={isRotating}
                            className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                ${isRotating ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 active:scale-95'}
                            `}
                        >
                            {isRotating ? <RefreshCw className="animate-spin" size={14}/> : <Play size={14} />} 启动回转模拟测试
                        </button>
                        
                        <button 
                            onMouseDown={() => setIsScanning(true)}
                            onMouseUp={() => setIsScanning(false)}
                            className={`p-3 rounded-full border transition-all
                                ${isScanning ? 'bg-orange-600 border-orange-400 text-white scale-110 shadow-[0_0_20px_orange]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}
                            `}
                        >
                            <ScanLine size={20} />
                        </button>
                     </div>
                </div>
                
                {/* 装饰性全局扫描线 */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[length:100%_12px] animate-[scan_25s_linear_infinite]"></div>
            </div>

            {/* --- 系统状态脚部 --- */}
            <div className="h-10 bg-cyan-950/20 border-t border-cyan-500/20 px-6 flex items-center justify-between z-20">
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_lime]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">终端感知阵列: 联机正常</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">预测模型同步: 25ms 前</span>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-600 font-mono tracking-tighter uppercase italic flex items-center gap-2">
                    <Binary size={12} /> Marine-Slewing-Inference Engine v5.4 - Integrity Shield Active
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
