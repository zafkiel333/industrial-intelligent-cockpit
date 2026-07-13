import React, { useState, useEffect } from 'react';
import { HoistGearboxThreeScene } from '../../../components/predictive/mining-hoist-gearbox/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-3]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-3';
import { GearState } from '../../../components/predictive/mining-hoist-gearbox/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, ComposedChart, Bar, BarChart, Cell, Legend, ScatterChart, Scatter
} from 'recharts';
import { 
  Activity, Zap, TrendingUp, AlertTriangle, 
  Settings, Binary, History, Disc,
  CheckCircle2, FileText, Scan, Layers,
  Thermometer, ShieldCheck, Gauge, Workflow,
  BellRing, Info, Database, Crosshair
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 振动趋势与AI预测 (RMSE 优化后的预测曲线)
const VIBRATION_TREND = Array.from({length: 48}, (_, i) => {
    const isPred = i > 30;
    const base = 2.5 + Math.sin(i * 0.15) * 0.5;
    const noise = (Math.random() - 0.5) * 0.4;
    return {
        time: `${i}:00`,
        actual: isPred ? null : base + noise,
        predict: isPred ? base + noise + (i - 30) * 0.15 : null,
        limit: 5.5
    };
});

// 2. 齿轮啮合频率 (GMF) 频谱分析
const GMF_SPECTRUM = [
    { freq: '1X', amp: 1.2, type: '转频' },
    { freq: 'GMF1', amp: 4.8, type: '一级啮合' },
    { freq: 'GMF2', amp: 3.2, type: '二级啮合' },
    { freq: '2GMF', amp: 1.5, type: '二倍频' },
    { freq: 'SB', amp: 2.4, type: '异常边频' },
];

// 3. 冲击脉冲 (SPM) 轴承状态图
const SHOCK_PULSE_DATA = Array.from({length: 20}, (_, i) => ({
    pos: `B${i+1}`,
    dbm: 15 + Math.random() * 10 + (i === 7 ? 25 : 0),
    dbc: 10 + Math.random() * 5
}));

const GEAR_COMPONENTS: GearState[] = [
    { id: 'input', name: '输入高速轴', vibrationX: 1.2, vibrationY: 1.1, temperature: 52, status: 'normal' },
    { id: 'intermediate', name: '二级中间轮', vibrationX: 3.8, vibrationY: 4.2, temperature: 75, status: 'pitting' },
    { id: 'output', name: '输出低速轴', vibrationX: 0.8, vibrationY: 0.9, temperature: 48, status: 'normal' },
];

export const HoistGearboxHealthView: React.FC = () => {
  const [activePart, setActivePart] = useState<string | null>('intermediate');
  const [viewMode, setViewMode] = useState<'mechanical' | 'xray'>('mechanical');
  const [metrics, setMetrics] = useState({
      rms: 3.42,
      peak: 5.12,
      kurtosis: 3.8,
      crestFactor: 4.5,
      healthIndex: 72.5
  });

  useEffect(() => {
    const timer = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            rms: 3.4 + Math.random() * 0.1,
            peak: 5.1 + Math.random() * 0.2,
            healthIndex: 72.5 + (Math.random() - 0.5) * 0.5
        }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：减速箱诊断 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <Workflow size={28} className="text-cyan-400 animate-spin-slow" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <Activity size={14} /> Hoist Drivetrain Diagnostics & Prognostics
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    提升减速箱 <span className="text-cyan-400 font-extrabold text-shadow-glow">振动趋势预测中心</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-8 items-center pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合健康指数 (GHI)</div>
                <div className={`text-4xl font-mono font-bold ${metrics.healthIndex < 75 ? 'text-orange-500' : 'text-green-400'}`}>
                    {metrics.healthIndex.toFixed(1)}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">预测故障时间 (TTF)</div>
                <div className="text-3xl font-mono font-bold text-white">142 <span className="text-sm text-slate-500">h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400">预警状态级别</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    <AlertTriangle size={20} className="text-orange-500 animate-pulse" /> LEVEL 2
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：时域指标与轴承脉冲 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 振动时域核心指标 */}
           <SciFiCard title="时域特征统计" subtitle="TIME DOMAIN METRICS" className="border-cyan-900/50 bg-[#081224]/80">
               <div className="grid grid-cols-2 gap-4 py-2">
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">有效值 (RMS)</div>
                       <div className="text-xl font-mono font-bold text-white">{metrics.rms.toFixed(2)} <span className="text-xs font-normal">mm/s</span></div>
                   </div>
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">峰值 (Peak)</div>
                       <div className="text-xl font-mono font-bold text-white">{metrics.peak.toFixed(2)} <span className="text-xs font-normal">mm/s</span></div>
                   </div>
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">峭度 (Kurtosis)</div>
                       <div className={`text-xl font-mono font-bold ${metrics.kurtosis > 3.5 ? 'text-red-400' : 'text-white'}`}>{metrics.kurtosis}</div>
                   </div>
                   <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">波形因子 (Crest)</div>
                       <div className="text-xl font-mono font-bold text-white">{metrics.crestFactor}</div>
                   </div>
               </div>
           </SciFiCard>

           {/* 轴承冲击脉冲 SPM */}
           <SciFiCard title="轴承冲击脉冲监测 (SPM)" subtitle="BEARING PULSE" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SHOCK_PULSE_DATA} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="pos" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 40]} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#3b82f6'}} />
                           <Bar dataKey="dbm" name="冲击强度 (dBm)" fill="#0ea5e9" radius={[1, 1, 0, 0]} />
                           <Bar dataKey="dbc" name="润滑指数 (dBc)" fill="#10b981" radius={[1, 1, 0, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
               <div className="mt-2 text-[9px] text-slate-500 text-center uppercase tracking-widest">
                   Bearing Node #8 Warning: Lubrication Degrading
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与频域分析 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：减速箱透视 */}
           <div className="flex-1 min-h-[450px] bg-[#020205] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Gearbox Dynamic Analytics
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">当前输入转速</div>
                               <div className="text-xl font-mono font-bold text-white">1,450 <span className="text-xs">RPM</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">传动链效率</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">92.4 <span className="text-xs">%</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧控制栏 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-1 rounded border border-slate-700 flex flex-col gap-1 shadow-2xl">
                       <button 
                         onClick={() => setViewMode('mechanical')}
                         className={`p-2 rounded transition-all ${viewMode === 'mechanical' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Layers size={18} />
                       </button>
                       <button 
                         onClick={() => setViewMode('xray')}
                         className={`p-2 rounded transition-all ${viewMode === 'xray' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-white'}`}
                       >
                           <Scan size={18} />
                       </button>
                   </div>
               </div>

               <HoistGearboxThreeScene 
                   inputRpm={1450}
                   gears={GEAR_COMPONENTS}
                   isVibrating={true}
                   viewMode={viewMode === 'xray' ? 'xray' : 'mechanical'}
                   activeComponentId={activePart}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* 底部 HUD：异常啮合点锁定 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
                    <div className="flex-1 bg-black/60 backdrop-blur border border-red-500/30 p-3 rounded flex justify-between items-center animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3">
                            <Crosshair size={24} className="text-red-500 animate-pulse" />
                            <div>
                                <div className="text-xs font-bold text-white uppercase tracking-widest">啮合点异常诊断 (Intermediate)</div>
                                <div className="text-[10px] text-red-400">检测到二级中间轮齿面点蚀，边频带异常增益</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="text-right">
                                 <div className="text-[9px] text-slate-500 uppercase">啮合应力系数</div>
                                 <div className="text-lg font-mono font-bold text-white">1.82 KHz</div>
                             </div>
                        </div>
                    </div>
               </div>
           </div>

           {/* 啮合频率全谱分析 */}
           <SciFiCard title="啮合频率频谱分析 (GMF Spectrum)" subtitle="FREQUENCY DOMAIN" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={GMF_SPECTRUM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444'}} />
                           <Bar dataKey="amp" barSize={30}>
                               {GMF_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.amp > 4 ? '#ef4444' : '#0ea5e9'} fillOpacity={0.6} />
                               ))}
                           </Bar>
                           <Line type="monotone" dataKey="amp" stroke="#22d3ee" strokeWidth={1} dot={{r: 3}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* 右侧：预测维护与寿命决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 振动趋势预测 */}
           <SciFiCard title="振动劣化预测 (72H Forecast)" subtitle="PREDICTIVE TREND" className="h-[280px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={VIBRATION_TREND}>
                           <defs>
                               <linearGradient id="colAct" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colPre" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={10} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#colAct)" name="当前实测" />
                           <Area type="monotone" dataKey="predict" stroke="#f59e0b" strokeDasharray="5 5" fill="url(#colPre)" name="AI 预测趋势" />
                           <ReferenceLine y={5.5} stroke="#ef4444" strokeDasharray="3 3" label={{value: '报废阈值', fill: 'red', fontSize: 10}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* 诊断结论与决策建议 */}
           <SciFiCard title="智能辅助维护决策" className="flex-1 border-cyan-900/50 bg-[#1a0f05]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase tracking-wider">劣化预警：二级行星轮系</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               特征能量重心向 GMF2 偏移，预测剩余寿命将在 142 小时后触及安全边际。建议立刻下调提升电机 10% 动态响应。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-cyan-500 pl-2">下一步计划建议 (Priority)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <Thermometer size={14} className="text-orange-400" /> T+12h: 强制机舱油温循环冷却
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1.5 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> T+48h: 减速箱润滑油样铁谱分析
                       </div>
                       <div className="flex items-center gap-2 text-xs text-red-400 font-bold py-1.5">
                           <BellRing size={14} className="animate-pulse" /> 预计下次检修：T+7d 更换二级齿轮
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded-lg text-xs text-cyan-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <FileText size={16} className="group-hover:translate-x-1 transition-transform" /> 
                       下发预测维护派工单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> GEAR_ID: H_RED_004</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> SAMPLE_RATE: 20kHz</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500"></div> AI_CONFIDENCE: 91.8%</div>
          <div className="flex-1 text-right">MODEL_VER: ARIMA_GB_X20 | LAST_AUDIT: 2024-Q3-AUG</div>
      </div>
    </div>
  );
};
