
import React, { useState, useEffect } from 'react';
import { PulsationThreeScene } from '../../../components/predictive/hydro-pulsation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-37]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-37';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart, Legend, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Waves, Activity, Zap, ShieldAlert, 
  TrendingUp, History, Search, Layers,
  Compass, Gauge, Wind, AlertOctagon, 
  Target, Binary, Timer, Flame,
  Wrench, FileText
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 同步压力波形 (蜗壳 vs 尾水管)
const PULSE_WAVE_DATA = Array.from({length: 100}, (_, i) => {
    const t = i * 0.1;
    // 叠加主频(转频)与特征低频(涡带)
    const baseFreq = Math.sin(t * 1.0); // 1X
    const vortexFreq = 0.4 * Math.sin(t * 0.3); // 0.3X 涡带特征
    const noise = (Math.random() - 0.5) * 0.1;
    
    return {
        time: t.toFixed(1),
        scroll: (baseFreq * 0.5 + noise).toFixed(2), // 蜗壳
        draft: (baseFreq * 0.3 + vortexFreq * 0.8 + noise).toFixed(2), // 尾水管(脉动更剧烈)
    };
});

// 2. 功率频谱密度 (PSD)
const SPECTRUM_DATA = [
    { freq: '0.1X', power: 12, label: '涌浪' },
    { freq: '0.3X', power: 85, label: '核心涡带' }, // 显著特征
    { freq: '0.6X', power: 15, label: '次生谐波' },
    { freq: '1.0X', power: 42, label: '转频' },
    { freq: 'BPF', power: 25, label: '叶片通过' },
];

// 3. 脉动载荷与材料疲劳关联预测 (Paris Law Simulation)
const FATIGUE_PREDICTION = Array.from({length: 24}, (_, i) => {
    const month = i + 1;
    // 脉动强度增加会导致裂纹非线性加速
    const damage = 0.2 * Math.exp(0.12 * month);
    return {
        month: `M+${month}`,
        damage: damage.toFixed(2),
        safeLimit: 12
    };
});

// 4. 工况效率与脉动热力图数据
const EFF_PULSE_CORRELATION = Array.from({length: 20}, (_, i) => ({
    load: 40 + i * 3,
    efficiency: 85 + Math.sin(i * 0.5) * 5,
    pulse: 2 + Math.pow(i - 10, 2) * 0.1 // 40-70% 负荷脉动最大
}));

export const HydraulicPulsationView: React.FC = () => {
  // --- 状态管理 ---
  const [load, setLoad] = useState(65); // 实时负荷 %
  const [viewMode, setViewMode] = useState<'fluid' | 'structure'>('fluid');
  const [metrics, setMetrics] = useState({
      mainFreq: 0.28, // Hz (涡带特征频)
      p2pAmplitude: 145, // kPa (峰峰值)
      efficiencyDrop: 1.4, // %
      riskLevel: 'Moderate'
  });

  // 动态模拟
  useEffect(() => {
    const timer = setInterval(() => {
        const t = Date.now() / 2000;
        setMetrics(prev => ({
            ...prev,
            p2pAmplitude: 145 + Math.sin(t) * 10 + (load < 70 && load > 45 ? 40 : 0),
            mainFreq: 0.28 + (Math.random()-0.5) * 0.01
        }));
    }, 1000);
    return () => clearInterval(timer);
  }, [load]);

  // 计算涡带可视化参数
  // 45%-70%负荷通常是不稳定区，涡带最强
  const isUnstable = load > 45 && load < 75;
  const vortexIntensity = isUnstable ? 0.8 : 0.2;

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：瞬态预警看板 */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <AlertOctagon size={14} className="animate-pulse text-orange-500" />
             Hydro-Mechanical Resonance & Vibration Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水力脉动 <span className="text-cyan-400">机组劣化影响评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">特征低频成分 (f/fn)</div>
                <div className="text-3xl font-mono font-bold text-cyan-400">{metrics.mainFreq.toFixed(2)}</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">压力峰峰值 (ΔP p-p)</div>
                <div className={`text-3xl font-mono font-bold ${metrics.p2pAmplitude > 160 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {metrics.p2pAmplitude.toFixed(0)} <span className="text-sm text-slate-500">kPa</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">风险状态评估</div>
                <div className={`text-2xl font-bold ${isUnstable ? 'text-orange-500' : 'text-green-400'}`}>
                    {isUnstable ? '不稳定区运行' : '运行区稳定'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：频域分析与工况映射 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* FFT 能量频谱 */}
           <SciFiCard title="压力脉动频率特征 (FFT)" subtitle="ENERGY SPECTRUM" className="flex-1 border-cyan-900/50 bg-[#081224]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={SPECTRUM_DATA} margin={{left: -20}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="freq" stroke="#94a3b8" tick={{fontSize: 10}} />
                               <YAxis stroke="#94a3b8" tick={{fontSize: 10}} hide />
                               <Tooltip 
                                 cursor={{fill: '#1e293b'}} 
                                 contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6', color: '#fff'}}
                                 formatter={(v, n, p) => [v, p.payload.label]}
                               />
                               <Bar dataKey="power" radius={[2, 2, 0, 0]}>
                                   {SPECTRUM_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.freq === '0.3X' ? '#f59e0b' : '#0ea5e9'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex items-center gap-2 text-orange-400 mb-1">
                           <Zap size={14} />
                           <span className="text-xs font-bold uppercase">涡带频率识别</span>
                       </div>
                       <p className="text-[10px] text-slate-500 leading-relaxed">
                           识别到 0.28fn 特征分量，能量占比 45%，确认为尾水管偏心旋流引起的同步脉动。
                       </p>
                   </div>
               </div>
           </SciFiCard>

           {/* 负荷-脉动相关性 */}
           <SciFiCard title="负荷-脉动特性图" subtitle="OPERATING ZONE" className="h-[280px] border-cyan-900/50">
               <div className="w-full h-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={EFF_PULSE_CORRELATION}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis dataKey="load" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '负荷 (%)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis yAxisId="left" stroke="#10b981" tick={{fontSize: 10}} domain={[80, 95]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 10}} domain={[0, 15]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                           <Area yAxisId="left" type="monotone" dataKey="efficiency" fill="#065f46" stroke="#10b981" fillOpacity={0.2} name="效率" />
                           <Line yAxisId="right" type="monotone" dataKey="pulse" stroke="#ef4444" strokeWidth={2} dot={false} name="脉动强度" />
                           <ReferenceLine x={load} stroke="#fff" strokeDasharray="5 5" label={{value: '当前', fill:'#fff', fontSize: 10}} />
                       </ComposedChart>
                   </ResponsiveContainer>
                   <div className="absolute top-2 left-10 text-[9px] text-slate-600 uppercase font-mono">
                       Efficiency vs Pulsation Heatmap
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：尾水管涡带数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：尾水管动态 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Fluid Dynamics Engine
                       </div>
                       <div className="flex items-center gap-6">
                           <div>
                               <div className="text-[9px] text-slate-500">涡带角速度</div>
                               <div className="text-xl font-mono font-bold text-white">4.2 <span className="text-xs">rad/s</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500">空化体体积</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">1.25 <span className="text-xs">m³</span></div>
                           </div>
                       </div>
                   </div>
                   
                   {isUnstable && (
                       <div className="flex items-center gap-3 bg-red-900/40 border border-red-500 px-4 py-2 rounded animate-pulse">
                           <Flame className="text-red-500" size={20} />
                           <div>
                               <div className="text-xs font-bold text-white uppercase">共振风险提示</div>
                               <div className="text-[10px] text-red-200">脉动主频与引水系统水体惯性接近</div>
                           </div>
                       </div>
                   )}
               </div>

               {/* 右上角控制台 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
                   <div className="bg-slate-900/80 p-3 rounded border border-slate-700 w-48">
                        <div className="flex justify-between text-[10px] text-cyan-300 font-bold mb-2">
                            <span>工况调节 (负荷)</span>
                            <span>{load.toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" step="1" 
                            value={load} onChange={(e) => setLoad(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                   </div>
                   <button 
                     onClick={() => setViewMode(v => v === 'fluid' ? 'structure' : 'fluid')}
                     className="w-full flex items-center justify-center gap-2 bg-blue-900/60 hover:bg-blue-700 text-white px-4 py-2 rounded border border-blue-500/50 font-bold text-xs transition-all shadow-lg"
                   >
                       {viewMode === 'fluid' ? <Layers size={16} /> : <Wind size={16} />}
                       {viewMode === 'fluid' ? '结构应力视图' : '流体流场视图'}
                   </button>
               </div>

               {/* 底部 HUD：压力同步 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
                    <div className="flex-1 bg-black/60 backdrop-blur border border-slate-700 p-3 rounded">
                        <div className="text-[9px] text-slate-500 uppercase mb-1">同步压力波形 (同步采样)</div>
                        <div className="h-16 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={PULSE_WAVE_DATA.slice(0, 40)}>
                                    <Line type="monotone" dataKey="scroll" stroke="#0ea5e9" strokeWidth={1} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="draft" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                </LineChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="w-48 bg-black/60 backdrop-blur border border-slate-700 p-3 rounded flex flex-col justify-center text-center">
                        <div className="text-[9px] text-slate-500 uppercase mb-1">相位滞后 (Phase Lag)</div>
                        <div className="text-3xl font-mono font-bold text-white">45.2°</div>
                        <div className="text-[9px] text-green-400">稳定响应</div>
                    </div>
               </div>

               {/* 3D 渲染 */}
               <PulsationThreeScene 
                   vortexIntensity={vortexIntensity}
                   swirlSpeed={load / 50}
                   pressurePulse={metrics.p2pAmplitude / 250}
                   isUnstableZone={isUnstable}
                   viewMode={viewMode}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

        </div>

        {/* 右侧：劣化影响与疲劳预测 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 材料疲劳损伤 */}
           <SciFiCard title="材料疲劳演化 (Fatigue)" subtitle="PARIS LAW" className="flex-1 border-cyan-900/50 bg-[#081224]/80" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                       <div className="text-xs text-slate-400">转轮叶片根部累积损伤</div>
                       <div className="text-xl font-mono font-bold text-orange-400">D = 0.425</div>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={FATIGUE_PREDICTION}>
                               <defs>
                                   <linearGradient id="damageGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 9}} hide />
                               <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#f59e0b'}} />
                               <ReferenceLine y={12} stroke="red" strokeDasharray="3 3" label={{value:'裂纹启动', fill:'red', fontSize:9}} />
                               <Area type="monotone" dataKey="damage" stroke="#f59e0b" fill="url(#damageGrad)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 flex flex-col gap-2">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-l-2 border-cyan-500 pl-2">劣化归因 Contributing Factors</div>
                       <div className="space-y-1">
                           <div className="flex justify-between text-[9px]"><span>水力脉动 (Pulsation)</span><span className="text-white">65%</span></div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-orange-500" style={{width: '65%'}}></div></div>
                           <div className="flex justify-between text-[9px] mt-1"><span>空蚀磨损 (Erosion)</span><span className="text-white">25%</span></div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{width: '25%'}}></div></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 预测建议与工单 */}
           <SciFiCard title="智能检修决策" className="h-[250px] border-cyan-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded flex items-start gap-3">
                       <Target className="text-cyan-400 shrink-0" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">优化运行建议</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               检测到 55% 负荷下脉动剧烈。建议通过 AGC 自动调度避开 52% - 58% 负荷区间，可延长叶片寿命 25%。
                           </p>
                       </div>
                   </div>

                   <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-3">
                       <Wrench className="text-red-400 shrink-0" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">检修窗口预测</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               预测裂纹扩展风险将在 124 天后超过安全阈值。建议在下个春检期间进行无损探伤。
                           </p>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded text-xs text-cyan-100 transition-colors flex items-center justify-center gap-2">
                       <FileText size={12} /> 下载详细劣化报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
