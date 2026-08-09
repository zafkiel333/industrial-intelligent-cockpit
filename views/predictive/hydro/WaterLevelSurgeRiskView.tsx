
import React, { useState, useEffect } from 'react';
import { WaterSurgeThreeScene } from '../../../components/predictive/hydro-water-surge/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-38]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-38';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ComposedChart, Line, Bar, Cell, Legend
} from 'recharts';
import { 
  Waves, AlertTriangle, Activity, Gauge, 
  Droplets, TrendingUp, Zap, ShieldAlert,
  ArrowDownToLine, Timer, Wind, Binary,
  AlertOctagon, CheckCircle2, Info, Hexagon, FileText
} from 'lucide-react';

// --- 模拟数据 ---

// 水位瞬态波形 (24s 采样)
const TRANSIENT_WATER_DATA = Array.from({length: 100}, (_, i) => {
    const t = i * 0.24;
    // 模拟骤降后的涌浪波动
    const base = 85; 
    const surge = t > 5 ? -15 * Math.exp(-(t-5)/4) * Math.cos((t-5)*1.5) : 0;
    return {
        time: t.toFixed(1),
        level: (base + surge).toFixed(2),
        rate: surge.toFixed(2),
        limit_low: 70,
        limit_high: 95
    };
});

// 部件受损风险矩阵
const COMPONENT_RISK_MATRIX = [
    { name: '拦污栅 (Trash Rack)', risk: 85, impact: '压差过载', status: 'critical' },
    { name: '进水球阀 (Ball Valve)', risk: 42, impact: '空蚀气穴', status: 'warning' },
    { name: '机组转轮 (Runner)', risk: 65, impact: '升载冲击', status: 'warning' },
    { name: '压力钢管 (Penstock)', risk: 28, impact: '疲劳损伤', status: 'normal' },
    { name: '尾水管 (Draft Tube)', risk: 55, impact: '反向压力波', status: 'warning' },
];

export const WaterLevelSurgeRiskView: React.FC = () => {
  // --- 状态 ---
  const [waterLevel, setWaterLevel] = useState(85);
  const [surgeRate, setSurgeRate] = useState(0);
  const [pressureWavePos, setPressureWavePos] = useState(0);
  const [vortexLevel, setVortexLevel] = useState(0.12);
  const [metrics, setMetrics] = useState({
      kp: 1.12, // 压升系数
      airEntrainment: 5, // 进气概率 %
      structuralStress: 145, // MPa
      timeToSafe: 124 // s
  });

  // 模拟水位变率动画
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        const mockSurge = Math.sin(t * 1.5) * 0.5; // 模拟水位快速波动
        setSurgeRate(mockSurge);
        setWaterLevel(prev => prev + mockSurge * 0.1);
        setPressureWavePos(p => (p + 0.05) % 1);
        
        setMetrics(prev => ({
            ...prev,
            kp: 1.12 + Math.abs(mockSurge) * 0.2,
            airEntrainment: waterLevel < 75 ? (75 - waterLevel) * 2 : 0,
            structuralStress: 145 + Math.abs(mockSurge) * 50
        }));

        setVortexLevel(waterLevel < 80 ? (80 - waterLevel) / 20 : 0.05);

    }, 100);
    return () => clearInterval(interval);
  }, [waterLevel]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：瞬态预警看板 */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} className="animate-pulse" />
             Transient Hydraulic Risk Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水位突变 <span className="text-blue-400">设备风险预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                    瞬时水位变率 (ΔH/Δt)
                </div>
                <div className={`text-3xl font-mono font-bold ${Math.abs(surgeRate) > 0.4 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {surgeRate.toFixed(3)} <span className="text-sm">m/s</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                    瞬态压升系数 (Kp)
                </div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.kp.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">稳定预计耗时</div>
                <div className="text-2xl font-bold text-yellow-400">{metrics.timeToSafe} <span className="text-sm uppercase font-normal">Seconds</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：动力学参数面板 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 水位实时波形 */}
           <SciFiCard title="水位瞬态响应" subtitle="WATER LEVEL (EL.)" className="flex-1 border-blue-900/50 bg-[#081224]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={TRANSIENT_WATER_DATA}>
                               <defs>
                                   <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[60, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9', color: '#fff'}} />
                               <ReferenceLine y={95} stroke="red" strokeDasharray="3 3" />
                               <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
                               <Area type="monotone" dataKey="level" stroke="#0ea5e9" strokeWidth={2} fill="url(#levelGrad)" isAnimationActive={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex items-center gap-2 text-blue-400 mb-1">
                           <Activity size={14} />
                           <span className="text-xs font-bold uppercase">涌浪频谱特征</span>
                       </div>
                       <div className="text-[10px] text-slate-500 font-mono">
                           主频: 0.18 Hz | 阻尼比: 0.042
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 进气与旋涡风险 */}
           <SciFiCard title="进气与吸气旋涡" subtitle="AIR ENTRAINMENT" className="h-[280px] border-blue-900/50">
               <div className="flex flex-col justify-between h-full py-2">
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-400">进气概率 (Probability)</span>
                               <span className={metrics.airEntrainment > 15 ? 'text-red-500' : 'text-green-400'}>{metrics.airEntrainment.toFixed(1)}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 transition-all" style={{width: `${metrics.airEntrainment}%`}}></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-400">旋涡强度 (Vortex Index)</span>
                               <span className="text-white">F{ (vortexLevel * 5).toFixed(1) }</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-cyan-400 transition-all" style={{width: `${vortexLevel * 100}%`}}></div>
                           </div>
                       </div>
                   </div>
                   <div className="bg-orange-950/20 border border-orange-900/40 p-3 rounded flex items-start gap-3">
                       <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                       <p className="text-[10px] text-orange-200 leading-tight">
                           当前库水位接近临界进气高度，建议限制机组负荷突变率，避免空气进入引水钢管。
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生与瞬态推演 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：水位突变数字孪生 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-4 py-3 rounded flex flex-col gap-2">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Transient CFD Engine
                       </div>
                       <div className="flex items-center gap-6">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">当前特征水位</div>
                               <div className="text-xl font-mono font-bold text-white">EL. {waterLevel.toFixed(2)} <span className="text-xs">m</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">管内压力梯度</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">14.5 <span className="text-xs">kPa/m</span></div>
                           </div>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1.5 rounded border border-blue-500/30">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-[10px] font-bold text-white uppercase font-mono">Live Data Sync: Active</span>
                   </div>
               </div>

               {/* 右下角：物理图层切换 */}
               <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                   <button className="bg-slate-900/80 hover:bg-blue-600 text-white p-2 rounded border border-slate-700 transition-colors shadow-lg group">
                       <Waves size={18} />
                       <span className="absolute right-full mr-2 hidden group-hover:block whitespace-nowrap bg-black text-xs p-1 rounded">波动图层</span>
                   </button>
                   <button className="bg-slate-900/80 hover:bg-blue-600 text-white p-2 rounded border border-slate-700 transition-colors shadow-lg group">
                       <Wind size={18} />
                       <span className="absolute right-full mr-2 hidden group-hover:block whitespace-nowrap bg-black text-xs p-1 rounded">旋涡流线</span>
                   </button>
               </div>

               {/* 中心风险定位叠加 */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                   {/* Added missing Hexagon import */}
                   <Hexagon size={300} className="text-blue-900 animate-pulse" />
               </div>

               <WaterSurgeThreeScene 
                   waterLevel={waterLevel}
                   surgeRate={surgeRate}
                   pressureWavePos={pressureWavePos}
                   vortexIntensity={vortexLevel}
                   isWarning={Math.abs(surgeRate) > 0.4}
                   viewMode="physics"
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 结构载荷实时趋势 */}
           <SciFiCard title="结构动态载荷趋势" subtitle="STRUCTURAL STRESS" className="h-[200px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TRANSIENT_WATER_DATA}>
                           <defs>
                               <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'MPa', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#ef4444', color: '#fff'}} />
                           <Area type="step" dataKey="rate" stroke="#ef4444" strokeWidth={1} fill="url(#stressGrad)" name="Transient Load" />
                           <Line type="monotone" dataKey="level" stroke="#64748b" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：受影响设备矩阵与预测建议 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 设备受损风险矩阵 */}
           <SciFiCard title="设备风险映射矩阵" subtitle="IMPACT MATRIX" className="flex-1 border-blue-900/50">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {COMPONENT_RISK_MATRIX.map((item, idx) => (
                       <div key={idx} className="p-3 rounded bg-slate-900/40 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-white">{item.name}</span>
                               <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase 
                                   ${item.status === 'critical' ? 'bg-red-900 text-red-100' : 'bg-yellow-900 text-yellow-100'}`}>
                                   {item.status}
                               </span>
                           </div>
                           <div className="flex justify-between items-baseline mb-2">
                               <span className="text-[10px] text-slate-500">{item.impact}</span>
                               <span className="text-sm font-mono text-cyan-400">{item.risk}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${item.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                 style={{width: `${item.risk}%`}}
                               ></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 智能控制决策建议 */}
           <SciFiCard title="应急预测决策" className="h-[280px] border-blue-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertOctagon className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">拦截机组加载 (Interlock)</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               检测到水位变率超过 0.45m/s。已自动锁定调速器加载斜率，防止压力波叠加破坏钢管衬砌。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Actions</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500" />
                           启动拦污栅压差实时监控
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500" />
                           开启尾水管补气阀
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 opacity-50">
                           <Info size={12} className="text-blue-500" />
                           建议执行工况：低负荷平稳运行
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-blue-700/30 hover:bg-blue-600/50 border border-blue-500/50 rounded text-xs text-blue-100 transition-colors flex items-center justify-center gap-2">
                       {/* Added missing FileText import */}
                       <FileText size={12} /> 下载瞬态模拟报告
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
