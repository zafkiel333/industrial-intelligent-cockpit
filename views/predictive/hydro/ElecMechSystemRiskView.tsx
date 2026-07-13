
import React, { useState, useEffect } from 'react';
import { ElecMechThreeScene } from '../../../components/predictive/elec-mech-risk/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-43]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-43';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, ZAxis, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Zap, Activity, ShieldAlert, Binary, 
  Settings, Database, GitFork, TrendingUp,
  Cpu, Thermometer, Radio, ArrowRight,
  Flame, LayoutGrid, Info
} from 'lucide-react';

// --- 模拟数据生成 ---

// 1. 系统稳定性相图 (Vibration vs Magnetic Flux)
const STABILITY_PHASE_DATA = Array.from({length: 60}, (_, i) => {
  const t = i * 0.15;
  const noise = (Math.random() - 0.5) * 5;
  return {
    x: 40 + Math.cos(t) * 30 + noise, // 磁通波动
    y: 30 + Math.sin(t * 1.2) * 20 + noise, // 机械振动响应
    z: i
  };
});

// 2. 机电关联指标 (Cross-domain Correlation)
const CORRELATION_METRICS = [
  { subject: '电磁激振力', A: 85, fullMark: 100 },
  { subject: '轴系扭振', A: 70, fullMark: 100 },
  { subject: '气隙非均匀度', A: 92, fullMark: 100 },
  { subject: '定子机械刚度', A: 65, fullMark: 100 },
  { subject: '三相电流平衡度', A: 88, fullMark: 100 },
];

// 3. 风险级联扩散路径
const CASCADING_PATH = [
    { step: '励磁波动', risk: 15, impact: '磁拉力偏移', status: 'normal' },
    { step: '磁拉力偏移', risk: 45, impact: '气隙偏心加剧', status: 'warning' },
    { step: '气隙偏心', risk: 78, impact: '转子径向剧烈振动', status: 'critical' },
    { step: '机械振动', risk: 92, impact: '绝缘机械性磨损', status: 'critical' },
];

export const ElecMechSystemRiskView: React.FC = () => {
  // --- 状态控制 ---
  const [globalRisk, setGlobalRisk] = useState(42.5);
  const [eccentricity, setEccentricity] = useState(0.35);
  const [fluxDensity, setFluxDensity] = useState(0.85);
  const [viewMode, setViewMode] = useState<'hologram' | 'thermal' | 'field'>('hologram');

  // 动态模拟
  useEffect(() => {
    const timer = setInterval(() => {
        setGlobalRisk(prev => {
            const next = prev + (Math.random() - 0.48) * 1.2;
            return Math.min(99, Math.max(10, next));
        });
        setEccentricity(prev => Math.min(1, Math.max(0, prev + (Math.random()-0.5)*0.05)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：系统健康仪表盘 */}
      <div className="flex justify-between items-end border-b border-purple-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <ShieldAlert size={28} className="text-purple-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-widest font-bold">
                    <Binary size={14} /> Integrated Electro-Mechanical Intelligence
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    电气—机械 <span className="text-purple-400 font-extrabold">系统级风险评估</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合失稳指数 (CUI)</div>
                <div className={`text-4xl font-mono font-bold ${globalRisk > 65 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {globalRisk.toFixed(1)}<span className="text-sm">%</span>
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">电磁刚度残余</div>
                <div className="text-3xl font-mono font-bold text-white">88.5 <span className="text-sm">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-green-400">耦合稳定状态</div>
                <div className="text-2xl font-bold text-white uppercase flex items-center gap-2">
                    <Activity size={20} className="text-green-500"/> NOMINAL
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：多场耦合参数看板 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 电气域核心指标 */}
           <SciFiCard title="电气场实时特征" subtitle="ELECTRICAL DOMAIN" className="border-purple-900/50 bg-[#081224]/80">
               <div className="space-y-4 py-2">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-purple-500/50 transition-colors">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                               <Zap size={14} className="text-purple-400"/> 平均气隙磁密
                           </span>
                           <span className="font-mono text-white">{(fluxDensity).toFixed(2)} T</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-500" style={{width: `${fluxDensity * 80}%`}}></div>
                       </div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                               <Activity size={14} className="text-cyan-400"/> 励磁谐波含量
                           </span>
                           <span className="font-mono text-white">1.2%</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 机械域核心指标 */}
           <SciFiCard title="机械场实时特征" subtitle="MECHANICAL DOMAIN" className="border-cyan-900/50 bg-[#081224]/80">
                <div className="space-y-4 py-2">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-cyan-500/50 transition-colors">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                               <Radio size={14} className="text-cyan-400"/> 气隙动态偏心率
                           </span>
                           <span className="font-mono text-white">{(eccentricity * 100).toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500" style={{width: `${eccentricity * 100}%`}}></div>
                       </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500 uppercase mb-1">上导轴摆度</div>
                           <div className="text-sm font-bold text-white font-mono">145 μm</div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500 uppercase mb-1">机架垂直振动</div>
                           <div className="text-sm font-bold text-white font-mono">0.8 mm/s</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 关联熵分析 */}
           <SciFiCard title="机电关联多维评估" subtitle="CROSS-CORRELATION" className="flex-1 border-purple-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CORRELATION_METRICS}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Correlation" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#a855f7'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生视口与相轨迹图 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-purple-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(168,85,247,0.1)] group">
               
               {/* 视口浮层 HUD */}
               <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-purple-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl">
                       <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Multi-Physics Interaction Logic
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">最大磁拉力矢量</div>
                               <div className="text-xl font-mono font-bold text-white">45.2 <span className="text-xs">kN @ 12°</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">耦合阻尼系数</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">0.42 <span className="text-xs">Ns/m</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 图层选择 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <div className="bg-slate-900/80 p-1 rounded border border-slate-700 flex flex-col gap-1 shadow-2xl">
                        {['hologram', 'thermal', 'field'].map(mode => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all uppercase tracking-widest
                                    ${viewMode === mode ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
               </div>

               <ElecMechThreeScene 
                   magneticFluxDensity={fluxDensity}
                   airGapEccentricity={eccentricity}
                   vibrationIntensity={globalRisk / 100}
                   rotationSpeed={1.0}
                   isExcited={true}
                   showFluxLines={viewMode === 'field' || viewMode === 'hologram'}
                   faultActive={globalRisk > 70}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 稳定性相图 */}
           <SciFiCard title="稳定性相轨迹预测 (Stability Phase Space)" subtitle="NON-LINEAR DYNAMICS" className="h-[220px] border-purple-900/50" noPadding>
               <div className="w-full h-full p-4 relative flex">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" dataKey="x" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '磁通波动 (ΔΦ)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                <YAxis type="number" dataKey="y" stroke="#64748b" tick={{fontSize: 10}} label={{ value: '振动响应 (ΔS)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                                <Scatter name="Trajectory" data={STABILITY_PHASE_DATA} fill="#8b5cf6" fillOpacity={0.6} line={{stroke: '#8b5cf6', strokeWidth: 1}} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-48 border-l border-slate-800 pl-4 flex flex-col justify-center gap-3">
                        <div className="bg-slate-900/50 p-2 rounded">
                            <div className="text-[9px] text-slate-500 uppercase">李雅普诺夫指数</div>
                            <div className="text-sm font-bold text-green-400">-0.042 (收敛)</div>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-relaxed italic">
                            相轨迹聚焦于稳定不动点，未发现明显的极限环震荡先兆。
                        </div>
                    </div>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：失效传播推演与建议 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 失效级联推演 */}
           <SciFiCard title="风险级联传导链" subtitle="FAILURE PROPAGATION" className="flex-1 border-purple-900/50">
               <div className="flex flex-col h-full space-y-4 py-2">
                   {CASCADING_PATH.map((node, i) => (
                       <div key={i} className="relative pl-8 group">
                           {/* 连线 */}
                           {i < CASCADING_PATH.length - 1 && (
                               <div className={`absolute left-[11px] top-6 bottom-[-16px] w-[2px] 
                                  ${node.status === 'critical' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-slate-800'}
                               `}></div>
                           )}
                           
                           {/* 节点图标 */}
                           <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all
                              ${node.status === 'critical' ? 'bg-red-950 border-red-500 scale-110' : 
                                node.status === 'warning' ? 'bg-orange-950 border-orange-500' : 'bg-slate-900 border-slate-700'}
                           `}>
                               {node.status === 'critical' ? <Zap size={12} className="text-red-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>}
                           </div>

                           <div className={`p-3 rounded border transition-colors ${node.status === 'critical' ? 'bg-red-900/10 border-red-900/40' : 'bg-slate-900/30 border-slate-800'}`}>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-slate-100">{node.step}</span>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${node.status === 'critical' ? 'text-red-400 bg-red-950' : 'text-slate-500'}`}>
                                       {node.risk}% Prob
                                   </span>
                               </div>
                               <div className="text-[9px] text-slate-500 flex items-center gap-1 uppercase tracking-tighter">
                                   <ArrowRight size={8} /> Impact: {node.impact}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 预防性策略 */}
           <SciFiCard title="智能风险对冲策略" className="h-[250px] border-purple-900/50 bg-[#1a0a2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded flex items-start gap-3 shadow-inner">
                       <TrendingUp className="text-blue-400 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">电磁阻尼优化建议</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               检测到气隙偏心与机械摆度相位接近共振区间。建议通过励磁系统引入 1.2Hz 阻尼分量，对冲机械激励。
                           </p>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-3 bg-purple-700/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-lg text-xs text-purple-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg">
                       <Settings size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                       执行多物理场协同解耦控制
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
