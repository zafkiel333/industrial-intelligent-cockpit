
import React, { useState, useEffect } from 'react';
import { SwingBearingThreeScene } from '../../../components/predictive/mining-swing-bearing/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-8]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-8';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart
} from 'recharts';
import { 
  CircleDot, Target, Activity, Clock, 
  TrendingDown, AlertOctagon, RotateCw, 
  Microscope, Droplets, Binary, ShieldAlert,
  ChevronRight, ArrowUpRight, Scale, Gauge,
  FileText, LayoutGrid, Box, Layers, Scan, CheckCircle2, AlertTriangle
} from 'lucide-react';

// --- 模拟数据 ---

// 寿命预测曲线 (S-Curve Degradation)
const RUL_PROJECTION = Array.from({length: 40}, (_, i) => {
    const t = i; // Months
    // 典型的轴承退化曲线：平稳期 -> 线性磨损期 -> 剧烈失效期
    const degradation = t < 20 ? t * 0.5 : t < 30 ? 10 + (t-20)*2 : 30 + Math.pow(t-30, 2);
    const health = Math.max(0, 100 - degradation);
    return {
        month: `M+${t}`,
        health: health.toFixed(1),
        prediction: i > 15 ? health - (i-15)*0.5 : null, // 预测偏差
        threshold: 40
    };
});

// 润滑脂铁谱分析 (Fe ppm trend)
const GREASE_ANALYSIS = [
    { sample: 'S-1', fe: 120, limit: 500, status: 'Normal' },
    { sample: 'S-2', fe: 150, limit: 500, status: 'Normal' },
    { sample: 'S-3', fe: 280, limit: 500, status: 'Warning' },
    { sample: 'S-4', fe: 450, limit: 500, status: 'Critical' },
    { sample: 'S-5', fe: 620, limit: 500, status: 'Severe' },
];

// 载荷谱 (Load Distribution Polar)
// 0-360度上的载荷集中情况
const LOAD_POLAR = Array.from({length: 36}, (_, i) => ({
    angle: i * 10,
    load: 50 + Math.random() * 20 + (i > 10 && i < 20 ? 40 : 0) // 前端挖掘时载荷大
}));

// 健康指纹雷达
const HEALTH_RADAR = [
    { subject: '轴向游隙', A: 65, fullMark: 100 }, // 游隙变大
    { subject: '润滑状态', A: 40, fullMark: 100 }, // 润滑差
    { subject: '滚道疲劳', A: 75, fullMark: 100 },
    { subject: '密封完整性', A: 85, fullMark: 100 },
    { subject: '螺栓预紧力', A: 90, fullMark: 100 },
];

export const ExcavatorSwingBearingRulView: React.FC = () => {
  // --- 状态管理 ---
  const [rotation, setRotation] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [tiltZ, setTiltZ] = useState(0);
  const [viewMode, setViewMode] = useState<'solid' | 'stress' | 'transparent'>('stress');
  const [rulDays, setRulDays] = useState(385);
  
  // 核心指标
  const [metrics, setMetrics] = useState({
      axialClearance: 1.85, // mm (Limit 2.5)
      radialClearance: 0.92, // mm
      ironContent: 450, // ppm
      vibrationRMS: 2.4, // mm/s
      riskIndex: 72.5 // 0-100
  });

  // 动态仿真
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 2000;
        
        // 模拟挖掘动作导致的倾覆力矩变化
        setTiltX(Math.sin(t) * 2);
        setTiltZ(Math.cos(t * 0.8) * 2);
        setRotation(prev => (prev + 0.5) % 360);

        setMetrics(prev => ({
            ...prev,
            vibrationRMS: 2.4 + Math.abs(Math.sin(t*10))*0.2,
            riskIndex: Math.min(99, prev.riskIndex + 0.005)
        }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-slate-200 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* 顶部：战略预警看板 */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#1c0a00] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-orange-600/20 rounded-xl border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <CircleDot size={32} className="text-orange-400 animate-spin-slow" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    <Activity size={14} /> Slew Bearing Tribology & Fatigue Lab
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    回转支承 <span className="text-orange-500 italic text-shadow-glow">剩余寿命预测 (RUL)</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">预测剩余工时</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                    {rulDays} <span className="text-sm text-slate-500 font-normal">Hours</span>
                </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">轴向游隙 (Clearance)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.axialClearance > 1.5 ? 'text-orange-400' : 'text-green-400'}`}>
                    {metrics.axialClearance.toFixed(2)} <span className="text-sm text-slate-500">mm</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-red-400 mb-1">铁谱磨损预警</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-white uppercase font-mono bg-red-900/20 px-3 py-1 rounded border border-red-500/30">
                    <AlertOctagon size={24} className="text-red-500 animate-pulse" /> SEVERE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：物理监测指标 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 润滑脂铁谱分析 */}
           <SciFiCard title="润滑脂铁谱分析 (Ferrography)" subtitle="WEAR DEBRIS" className="h-[300px] border-orange-900/50 bg-[#0c0502]/80">
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Microscope size={16} className="text-orange-500" />
                           <span>Fe Content Trend</span>
                       </div>
                       <span className="text-xs font-bold text-red-400">{metrics.ironContent} ppm</span>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={GREASE_ANALYSIS} layout="vertical" barSize={12}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" horizontal={false} />
                               <XAxis type="number" stroke="#7c2d12" tick={{fontSize: 9}} />
                               <YAxis dataKey="sample" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                               <Bar dataKey="fe" radius={[0, 4, 4, 0]}>
                                   {GREASE_ANALYSIS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fe > 400 ? '#ef4444' : entry.fe > 200 ? '#f59e0b' : '#334155'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-800">
                       <div className="flex gap-2 items-center mb-1">
                           <Droplets size={10} className="text-blue-400"/>
                           <span>磨粒形态：片状剥落 (Spalling)</span>
                       </div>
                       <div>建议：缩短润滑周期至 4h，并取样复检。</div>
                   </div>
               </div>
           </SciFiCard>

           {/* 游隙与振动关联 */}
           <SciFiCard title="游隙-振动 耦合特征" subtitle="CORRELATION" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center items-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">Axial Tilt</div>
                           <div className="text-xl font-bold text-white">{Math.abs(tiltX).toFixed(2)}°</div>
                           <div className="w-full h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                               <div className="h-full bg-orange-500" style={{width: `${Math.abs(tiltX)*20}%`}}></div>
                           </div>
                       </div>
                       <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center items-center">
                           <div className="text-[10px] text-slate-500 uppercase mb-1">Shock Pulse</div>
                           <div className="text-xl font-bold text-red-400">42 dB</div>
                           <div className="w-full h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                               <div className="h-full bg-red-500" style={{width: '85%'}}></div>
                           </div>
                       </div>
                   </div>
                   
                   <div className="flex-1 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={LOAD_POLAR.slice(0, 18)}> 
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                               <XAxis dataKey="angle" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                               <Area type="monotone" dataKey="load" stroke="#f97316" fill="#f9731633" />
                           </ComposedChart>
                       </ResponsiveContainer>
                       <div className="absolute top-2 right-2 text-[9px] text-orange-300 bg-black/60 px-2 rounded">
                           Sector 120°-180° Overload
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与应力场 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#050201] to-[#020100] border border-orange-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(249,115,22,0.15)] group">
               
               {/* HUD 层 */}
               <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-4">
                   <div className="bg-black/70 backdrop-blur border border-orange-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Finite Element Stress Twin
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">最大接触应力</div>
                               <div className="text-2xl font-mono font-bold text-white">1,250 <span className="text-xs">MPa</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">滚道疲劳累积</div>
                               <div className="text-2xl font-mono font-bold text-red-400">85.4 <span className="text-xs">%</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：视图控制 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-2xl backdrop-blur">
                       <button 
                            onClick={() => setViewMode('solid')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'solid' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Box size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('stress')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'stress' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layers size={20} />
                       </button>
                       <button 
                            onClick={() => setViewMode('transparent')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'transparent' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Scan size={20} />
                       </button>
                   </div>
               </div>

               <SwingBearingThreeScene 
                   rotationAngle={rotation}
                   tiltAngleX={tiltX}
                   tiltAngleZ={tiltZ}
                   wearLevel={0.8} // High wear
                   stressHotspots={[135, 150]} // Degrees
                   lubricationStatus={0.3} // Poor lube
                   viewMode={viewMode}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* 底部 HUD：动态载荷矢量 */}
               <div className="absolute bottom-8 left-6 right-6 z-10 flex gap-4 pointer-events-none animate-in slide-in-from-bottom-6">
                    <div className="flex-1 bg-black/60 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-950/40 rounded flex items-center justify-center border border-red-500/30">
                                <Scale size={28} className="text-red-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">倾覆力矩异常 (Overturning)</div>
                                <div className="text-[11px] text-red-400 leading-tight">
                                    挖掘工况下前倾力矩过大，导致前侧滚道接触应力超过屈服极限 15%。
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase mb-1">偏载系数</div>
                                 <div className="text-2xl font-mono font-bold text-white">1.45</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* RUL 寿命衰减曲线 */}
           <SciFiCard title="剩余寿命衰减预测 (Weibull Model)" subtitle="PROJECTION" className="h-[250px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={RUL_PROJECTION}>
                           <defs>
                               <linearGradient id="rulGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <Area type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} fill="none" name="健康度曲线" />
                           <Line type="monotone" dataKey="prediction" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="预测轨迹" />
                           <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{value: '失效阈值', fill: 'red', fontSize: 10}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：多维诊断与维护 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 健康指纹雷达 */}
           <SciFiCard title="健康状态多维指纹" subtitle="DIAGNOSTIC RADAR" className="h-[300px] border-orange-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                           <PolarGrid stroke="#331c0a" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Status" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0804', borderColor: '#f97316'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       低分项: <span className="text-red-400 font-bold">润滑状态 (40)</span>
                   </div>
               </div>
           </SciFiCard>

           {/* 维护决策建议 */}
           <SciFiCard title="智能维护决策" className="flex-1 border-orange-900/50 bg-[#160b02]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <Target className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">紧急干预建议</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               润滑不良导致滚道微剥落扩展。建议立即停机进行人工脂润滑，并紧固 120°-180° 扇区螺栓。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-orange-500 pl-2">优先级任务 (Priority)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 采集 4 点位润滑脂样本
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 测量轴向/径向游隙
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1.5">
                           <AlertTriangle size={14} className="animate-pulse" /> 预计更换周期: 385h 后
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-orange-700/30 hover:bg-orange-700/50 border border-orange-500/50 rounded-lg text-xs text-orange-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <FileText size={16} className="group-hover:translate-x-1 transition-transform" /> 
                       生成大修计划书
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> GREASE_SENSOR: ACTIVE</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> VIB_ANALYSIS: FFT_ON</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> MODEL_ACCURACY: 91.2%</div>
          <div className="flex-1 text-right text-orange-900 font-bold uppercase tracking-widest italic">Heavy Industry Prognostics V3.0</div>
      </div>
    </div>
  );
};