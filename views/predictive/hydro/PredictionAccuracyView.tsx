
import React, { useState, useEffect } from 'react';
import { AccuracyThreeScene } from '../../../components/predictive/hydro-accuracy/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-45]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-45';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis, ComposedChart, Line, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Binary, Target, Sigma, Activity, ShieldCheck, 
  Search, Sliders, TrendingUp, AlertTriangle,
  History, Fingerprint, Cpu, Gauge, Layers,
  CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 残差分布 (Residual Distribution - 应该服从正态分布)
const RESIDUAL_DIST = Array.from({length: 40}, (_, i) => {
    const x = (i - 20) * 0.1;
    // 正态分布公式
    const y = Math.exp(-Math.pow(x, 2) / 0.5) * 100;
    return { error: x.toFixed(1), count: y + Math.random() * 5 };
});

// 2. 预测值 vs 实测值回归线
const REGRESSION_DATA = Array.from({length: 50}, (_, i) => {
    const actual = 100 + i * 2 + (Math.random() - 0.5) * 10;
    const predict = actual + (Math.random() - 0.5) * 5; // 模拟较小的随机误差
    return { actual, predict };
});

// 3. 误差成分贡献 (Error Attribution)
const ERROR_CONTRIBUTION = [
    { subject: '传感器噪声', A: 12, fullMark: 100 },
    { subject: '模型过拟合', A: 8, fullMark: 100 },
    { subject: '工况波动', A: 45, fullMark: 100 },
    { subject: '采样率损失', A: 20, fullMark: 100 },
    { subject: '时滞偏差', A: 15, fullMark: 100 },
];

// 4. 时序精度趋势 (精度随时间推移的变化，用于识别模型漂移)
const PRECISION_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    accuracy: 98 - Math.sin(i * 0.2) * 2 - (i * 0.05), // 模拟轻微衰减
    uncertainty: 1 + (i * 0.1)
}));

export const PredictionAccuracyView: React.FC = () => {
  // --- 状态控制 ---
  const [metrics, setMetrics] = useState({
      accuracy: 98.42,
      mae: 0.015,
      rmse: 0.022,
      confidence: 96.5,
      dataQuality: 0.92
  });

  const [isScanning, setIsScanning] = useState(false);
  const [uncertaintyZones, setUncertaintyZones] = useState([
      { x: 5, z: -3, r: 2.5 },
      { x: -4, z: 6, r: 3.0 }
  ]);

  // 模拟动态扫描与数据质量波动
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            accuracy: 98.42 + (Math.random()-0.5)*0.1,
            mae: 0.015 + (Math.random()-0.5)*0.002,
            confidence: 96.5 + (Math.random()-0.5)*0.5
        }));
        
        // 随机触发扫描动画
        if (Math.random() > 0.95) {
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 3000);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-cyan-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* 顶部：模型性能 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50">
                <Target size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <Binary size={14} /> Predictive Algorithm Audit & Error Analytics
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    设备预测精度 <span className="text-cyan-400 font-extrabold">与误差统计分析</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">全局准确度 (Accuracy)</div>
                <div className="text-4xl font-mono font-bold text-cyan-400">
                    {metrics.accuracy.toFixed(2)}%
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">平均绝对误差 (MAE)</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.mae.toFixed(3)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-green-400">模型可信度等级</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <ShieldCheck size={20} className="text-green-500" /> GRADE A+
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：误差统计特征 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 残差分布直方图 */}
           <SciFiCard title="残差正态性分布 (Residuals)" subtitle="ERROR HISTOGRAM" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={RESIDUAL_DIST} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="error" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis hide />
                               <Tooltip 
                                 cursor={{fill: '#1e293b'}} 
                                 contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6', color: '#fff'}}
                               />
                               <Bar dataKey="count" fill="#0ea5e9" radius={[1, 1, 0, 0]}>
                                   {RESIDUAL_DIST.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={Math.abs(parseFloat(entry.error)) > 1.0 ? '#ef4444' : '#0ea5e9'} fillOpacity={0.6} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex items-center gap-2 text-cyan-400 mb-1">
                           <Sigma size={14} />
                           <span className="text-xs font-bold uppercase">统计特征值</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                           <div className="flex justify-between border-b border-slate-700 pb-1"><span>Skewness</span><span className="text-white">0.12</span></div>
                           <div className="flex justify-between border-b border-slate-700 pb-1"><span>Kurtosis</span><span className="text-white">3.05</span></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 误差贡献雷达图 */}
           <SciFiCard title="误差成分贡献分析" subtitle="ROOT CAUSE" className="h-[280px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ERROR_CONTRIBUTION}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Error" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 概率场视口与回归分析 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：模型概率流形 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Latent Space Probability Field
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">数据采样率</div>
                               <div className="text-xl font-mono font-bold text-white">4096 <span className="text-xs font-normal opacity-50">Hz</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">模型迭代周期</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">#42,500</div>
                           </div>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1.5 rounded border border-blue-500/30 shadow-lg">
                       <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-cyan-400 animate-ping' : 'bg-green-500'}`}></div>
                       <span className="text-[10px] font-bold text-white uppercase font-mono">
                           {isScanning ? 'Analyzing Manifold...' : 'Inference Mode: Optimized'}
                       </span>
                   </div>
               </div>

               {/* 右侧：置信度量表 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <div className="bg-black/60 p-4 rounded border border-slate-800 backdrop-blur-md">
                        <div className="text-[9px] text-slate-500 uppercase mb-3 font-bold">Confidence Gauge</div>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="none" />
                                <circle cx="48" cy="48" r="40" stroke="#0ea5e9" strokeWidth="6" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * metrics.confidence / 100)} className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-white">{metrics.confidence.toFixed(0)}%</span>
                                <span className="text-[8px] text-slate-500 uppercase">Rel.</span>
                            </div>
                        </div>
                    </div>
               </div>

               <AccuracyThreeScene 
                   globalAccuracy={metrics.accuracy}
                   errorIntensity={metrics.rmse * 10}
                   isAnalyzing={isScanning}
                   dataDensity={metrics.dataQuality}
                   uncertaintyZones={uncertaintyZones}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

               {/* 底部 HUD：模型拓扑热度 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
                    <div className="flex-1 bg-black/60 backdrop-blur border border-slate-700 p-3 rounded">
                        <div className="text-[9px] text-slate-500 uppercase mb-1">模型回归残余流线 (Residual Flow)</div>
                        <div className="h-12 w-full flex items-end gap-1">
                            {Array.from({length: 30}).map((_, i) => (
                                <div key={i} className="flex-1 bg-cyan-900/30 rounded-t overflow-hidden relative" style={{height: `${40 + Math.random()*60}%`}}>
                                    <div className="absolute bottom-0 w-full bg-cyan-500/50" style={{height: `${Math.random()*100}%`}}></div>
                                </div>
                            ))}
                        </div>
                    </div>
               </div>
           </div>

           {/* 预测值 vs 真实值回归散点图 */}
           <SciFiCard title="预测-实测回归一致性 (P-A Consistency)" subtitle="REGRESSION ANALYSIS" className="h-[240px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 relative flex">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{top: 10, right: 20, bottom: 10, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" dataKey="actual" name="实测值" stroke="#64748b" tick={{fontSize: 10}} domain={['dataMin - 10', 'dataMax + 10']} label={{ value: '实测值 (Actual)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                <YAxis type="number" dataKey="predict" name="预测值" stroke="#64748b" tick={{fontSize: 10}} domain={['dataMin - 10', 'dataMax + 10']} label={{ value: '预测值 (Pred)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                                <Scatter name="Data Points" data={REGRESSION_DATA} fill="#22d3ee" fillOpacity={0.6} />
                                {/* 回归基准线 y = x */}
                                <ReferenceLine segment={[{ x: 100, y: 100 }, { x: 200, y: 200 }]} stroke="#f59e0b" strokeDasharray="5 5" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-48 border-l border-slate-800 pl-4 flex flex-col justify-center gap-3">
                        <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                            <div className="text-[9px] text-slate-500 uppercase">决定系数 R²</div>
                            <div className="text-sm font-bold text-green-400">0.985 (极高)</div>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-relaxed italic">
                            模型在 95.4% 的工况下表现稳定，但在极低负荷区（P &lt; 20%）存在 R² 下降趋势。
                        </div>
                    </div>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：精度趋势与模型建议 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 精度时间衰减预测 */}
           <SciFiCard title="算法精度衰减趋势" subtitle="MODEL DRIFT" className="flex-1 border-cyan-900/50 bg-[#081224]/80" noPadding>
               <div className="h-full flex flex-col p-4">
                   <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={PRECISION_TREND}>
                                <defs>
                                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                                <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[90, 100]} />
                                <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                                <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#accGrad)" name="精度趋势" />
                                <Line type="monotone" dataKey="uncertainty" stroke="#f59e0b" strokeWidth={1} dot={false} name="不确定性指数" />
                            </ComposedChart>
                        </ResponsiveContainer>
                   </div>
                   <div className="mt-4 flex flex-col gap-2">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-l-2 border-cyan-500 pl-2">环境鲁棒性测试 (Stability)</div>
                       <div className="grid grid-cols-2 gap-2">
                           <div className="bg-slate-900/60 p-2 rounded text-center">
                               <div className="text-[8px] text-slate-500">抗噪能力</div>
                               <div className="text-xs font-bold text-green-400">High</div>
                           </div>
                           <div className="bg-slate-900/60 p-2 rounded text-center">
                               <div className="text-[8px] text-slate-500">过拟合风险</div>
                               <div className="text-xs font-bold text-yellow-400">Med-Low</div>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 算法审计与优化建议 */}
           <SciFiCard title="模型优化决策" className="h-[320px] border-cyan-900/50 bg-[#1a1c2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded flex items-start gap-3 shadow-inner">
                       <Cpu className="text-cyan-400 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">重训练触发预警</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               检测到环境温湿度变化引起的数据漂移，模型当前的 RMSE 为 0.022，已接近重训练阈值 (0.025)。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <Layers size={12} /> Optimization Plan
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 引入外部工况作为辅助特征
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 调整 Kalman 滤波参数 (R=1.2)
                       </div>
                       <div className="flex items-center gap-2 text-xs text-orange-400 font-bold py-1">
                           <AlertTriangle size={14} className="animate-pulse" /> 启动增量学习任务 (T+4h)
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2.5 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded-lg text-xs text-cyan-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <TrendingUp size={14} className="group-hover:translate-y-[-2px] transition-transform" /> 
                       执行模型版本校准 (V2.5.4)
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
