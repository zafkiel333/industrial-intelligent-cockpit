
import React, { useState, useEffect } from 'react';
import { PropagationThreeScene } from '../../../components/predictive/hydro-system-propagation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-41]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-41';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, Sankey, BarChart, Bar, Cell, Legend, ComposedChart
} from 'recharts';
import { 
  GitMerge, ShieldAlert, Activity, Zap, 
  ArrowRightCircle, Network, Timer, Gauge,
  AlertOctagon, CheckCircle2, Info, Share2,
  TrendingDown, Box, Binary, Workflow
} from 'lucide-react';
import { SystemNode } from '../../../components/predictive/hydro-system-propagation/three-types';

// --- 模拟数据 ---

const MOCK_NODES: SystemNode[] = [
    { id: 'n1', name: '水力引水系统', type: 'source', health: 95, risk: 0.05, pos: [-20, 0, 0] },
    { id: 'n2', name: '水轮机组', type: 'machine', health: 82, risk: 0.18, pos: [-5, 0, 0] },
    { id: 'n3', name: '励磁/发电机', type: 'machine', health: 88, risk: 0.12, pos: [10, 0, 0] },
    { id: 'n4', name: '主变压器', type: 'elec', health: 91, risk: 0.09, pos: [25, 0, 0] },
    { id: 'n5', name: '500kV 升压站', type: 'output', health: 98, risk: 0.02, pos: [40, 0, 0] },
];

// 失效传播波前 (时序数据)
const PROPAGATION_WAVEFRONT = Array.from({length: 40}, (_, i) => {
    const t = i;
    // 模拟风险从 n2(水轮机) 向后传播的脉冲
    const p1 = Math.exp(-Math.pow(t - 5, 2) / 10) * 80;  // 机械源
    const p2 = Math.exp(-Math.pow(t - 15, 2) / 15) * 60; // 电气影响
    const p3 = Math.exp(-Math.pow(t - 25, 2) / 20) * 40; // 变压影响
    return {
        time: `T+${t}s`,
        mechanical: p1.toFixed(1),
        electrical: p2.toFixed(1),
        grid: p3.toFixed(1)
    };
});

// 系统级联影响矩阵 (Sankey 逻辑映射)
const CASCADING_IMPACT_DATA = [
    { name: '水轮机轴承过热', weight: 85, target: '发电机振动超标', impact: 'High' },
    { name: '发电机振动超标', weight: 60, target: '主变套管局放', impact: 'Med' },
    { name: '主变套管局放', weight: 45, target: '出口断路器跳闸', impact: 'Critical' },
];

export const SystemFailurePropagationView: React.FC = () => {
  // --- 状态控制 ---
  const [activePath, setActivePath] = useState<string[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [metrics, setMetrics] = useState({
      cascadingRisk: 24.5,
      resilienceIndex: 0.88,
      timeToBlackout: 450, // seconds
      redundancyLevel: 'N-1 Stable'
  });

  // 模拟失效扩散动画逻辑
  useEffect(() => {
    const sequence = [['n2'], ['n2', 'n3'], ['n2', 'n3', 'n4'], ['n2', 'n3', 'n4', 'n5']];
    let step = 0;
    const interval = setInterval(() => {
        setActivePath(sequence[step % sequence.length]);
        setIsEmergency(step % sequence.length >= 2);
        setMetrics(prev => ({
            ...prev,
            cascadingRisk: 24.5 + (step % sequence.length) * 15,
            resilienceIndex: 0.88 - (step % sequence.length) * 0.1
        }));
        step++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* 顶部：系统拓扑风险 HUD */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-600/20 rounded-full border border-blue-500/50">
                <Network size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldAlert size={14} /> System-Level Failure Cascade Modeling
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    发电系统级 <span className="text-blue-400">失效传播预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">级联风险概率 (Cascade P)</div>
                <div className={`text-4xl font-mono font-bold ${metrics.cascadingRisk > 50 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {metrics.cascadingRisk.toFixed(1)}%
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">系统韧性指数 (Resilience)</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.resilienceIndex.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-green-400">运行稳定性状态</div>
                <div className="text-2xl font-bold text-white">{metrics.redundancyLevel}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：传播链条与路径 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 失效扩散链条 */}
           <SciFiCard title="风险扩散时序路径" subtitle="PROPAGATION PATH" className="flex-1 border-blue-900/50 bg-[#081224]/80">
               <div className="flex flex-col h-full space-y-6 py-4">
                   {MOCK_NODES.map((node, i) => (
                       <div key={node.id} className="relative pl-8 group">
                           {/* 连线 */}
                           {i < MOCK_NODES.length - 1 && (
                               <div className={`absolute left-[11px] top-6 bottom-[-24px] w-[2px] 
                                  ${activePath.includes(node.id) && activePath.includes(MOCK_NODES[i+1].id) ? 'bg-red-500 shadow-[0_0_8px_red] animate-pulse' : 'bg-slate-800'}
                               `}></div>
                           )}
                           
                           {/* 节点图标 */}
                           <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all
                              ${activePath.includes(node.id) ? 'bg-red-950 border-red-500 scale-125' : 'bg-slate-900 border-slate-700'}
                           `}>
                               {activePath.includes(node.id) ? <Zap size={12} className="text-red-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>}
                           </div>

                           <div className={`p-3 rounded border transition-colors ${activePath.includes(node.id) ? 'bg-red-900/10 border-red-900/40' : 'bg-slate-900/30 border-slate-800 hover:border-blue-500/30'}`}>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-slate-100">{node.name}</span>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${node.health > 90 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                       {node.health}%
                                   </span>
                               </div>
                               <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                   <span>Prop. Time: {i * 10}s</span>
                                   <span>Risk: {node.risk}</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 系统级联影响矩阵 */}
           <SciFiCard title="级联影响矩阵" subtitle="IMPACT MATRIX" className="h-[250px] border-blue-900/50">
               <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                   {CASCADING_IMPACT_DATA.map((item, i) => (
                       <div key={i} className="p-2.5 bg-slate-900/50 rounded border border-slate-800 flex flex-col gap-2">
                           <div className="flex justify-between items-center">
                               <span className="text-[10px] text-slate-400 truncate w-32">{item.name}</span>
                               <ArrowRightCircle size={12} className="text-blue-500" />
                               <span className="text-[10px] text-white truncate w-32 text-right">{item.target}</span>
                           </div>
                           <div className="flex justify-between items-end">
                               <div className="text-[9px] font-bold text-red-400 uppercase">Impact: {item.impact}</div>
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{width: `${item.weight}%`}}></div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 全站能流数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-4 py-3 rounded flex flex-col gap-2">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Stochastic Simulation Engine
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500">模型覆盖度</div>
                               <div className="text-xl font-mono font-bold text-white">99.2 <span className="text-xs">%</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500">异常熵值指数</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">1.45 <span className="text-xs">bit</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右下角状态图例 */}
               <div className="absolute bottom-6 right-6 z-10 bg-black/60 p-3 rounded border border-slate-700 text-[10px] space-y-2 pointer-events-auto">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div> 能量流动 (Energy Flow)</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]"></div> 失效波前 (Failure Wavefront)</div>
                   <div className="mt-2 pt-2 border-t border-slate-800">
                       <div className="text-slate-500 uppercase mb-1">系统仿真环境</div>
                       <div className="text-white font-bold">MODE: REAL-TIME SYNC</div>
                   </div>
               </div>

               <PropagationThreeScene 
                   nodes={MOCK_NODES}
                   activePropagationPath={activePath}
                   flowIntensity={1.2}
                   isEmergency={isEmergency}
                   propagationSpeed={1.5}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 失效波前时序分析 */}
           <SciFiCard title="失效波前时序响应分析 (Temporal Response)" subtitle="LATENCY" className="h-[220px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PROPAGATION_WAVEFRONT}>
                           <defs>
                               <linearGradient id="colMech" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colElec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colGrid" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Risk Intensity', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#3b82f6'}} />
                           <Legend iconType="circle" wrapperStyle={{fontSize:'10px'}} />
                           <Area type="monotone" dataKey="mechanical" stroke="#3b82f6" fill="url(#colMech)" name="机械源风险" />
                           <Area type="monotone" dataKey="electrical" stroke="#8b5cf6" fill="url(#colElec)" name="电气传播" />
                           <Area type="monotone" dataKey="grid" stroke="#ef4444" fill="url(#colGrid)" name="并网冲击" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：N-1 影响评估与决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* N-1  Contingency Analysis */}
           <SciFiCard title="N-1 稳定性冲击预测" subtitle="CONTINGENCY" className="flex-1 border-blue-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800">
                       模拟若<span className="text-white font-bold"> #2机组 </span>发生级联跳闸，系统并网功率将瞬时下降 <span className="text-orange-400 font-mono font-bold">320MW</span>。
                   </div>
                   
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-500">电网频率冲击 (Δf)</span>
                               <span className="text-red-400 font-mono">-0.12 Hz</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-red-500" style={{width: '65%'}}></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-500">电压波动响应 (ΔU)</span>
                               <span className="text-yellow-400 font-mono">1.25%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-yellow-500" style={{width: '35%'}}></div>
                           </div>
                       </div>
                   </div>

                   <div className="mt-auto p-3 bg-blue-900/10 border border-blue-500/20 rounded text-[10px] text-slate-400">
                       <Workflow size={12} className="inline mr-2 text-blue-400" />
                       仿真推演建议：启动 #1、#4机组 深度调峰备用，对冲级联掉力风险。
                   </div>
               </div>
           </SciFiCard>

           {/* 预防性调度建议 */}
           <SciFiCard title="全站级协同控制方案" className="h-[280px] border-blue-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3">
                       <AlertOctagon className="text-orange-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">自动联锁预警 (Auto-Interlock)</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               检测到失效波前已抵达发电机侧。建议锁定 #2机组 负荷变化率，并强制开启辅机 B 模式。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">Next Actions</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500" /> 调度优先级调整 (并网侧)
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <CheckCircle2 size={12} className="text-green-500" /> 分发级联失效隔离工单
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-blue-700/30 hover:bg-blue-600/50 border border-blue-500/50 rounded text-xs text-blue-100 transition-colors flex items-center justify-center gap-2">
                       <Share2 size={12} /> 同步至区域集控中心
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
