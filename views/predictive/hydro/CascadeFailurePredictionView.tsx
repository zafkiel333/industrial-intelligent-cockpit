
import React, { useState, useEffect } from 'react';
import { CascadeThreeScene } from '../../../components/predictive/hydro-cascade/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-44]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-44';
import { CascadeNode, CascadeLink } from '../../../components/predictive/hydro-cascade/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  Sankey, BarChart, Bar, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Network, AlertOctagon, Timer, ShieldCheck, 
  Zap, Share2, GitMerge, Activity, 
  Workflow, Info, Binary, TrendingDown,
  Box, ArrowRight, Skull, CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

const MOCK_NODES: CascadeNode[] = [
  { id: 'n1', name: '上游拦污栅', type: 'subsystem', risk: 0.15, status: 'healthy', pos: [-20, 0, -10] },
  { id: 'n2', name: '主轴承系统', type: 'subsystem', risk: 0.85, status: 'warning', pos: [-10, 0, 0] },
  { id: 'n3', name: '水轮机转轮', type: 'system', risk: 0.65, status: 'warning', pos: [0, 0, 0] },
  { id: 'n4', name: '发电机转子', type: 'system', risk: 0.42, status: 'healthy', pos: [10, 5, 0] },
  { id: 'n5', name: '主变压器', type: 'system', risk: 0.28, status: 'healthy', pos: [20, 0, 10] },
  { id: 'n6', name: '500kV 线路', type: 'subsystem', risk: 0.12, status: 'healthy', pos: [35, 10, 15] },
];

const MOCK_LINKS: CascadeLink[] = [
  { source: 'n1', target: 'n3', load: 0.8, transferRisk: 0.2 },
  { source: 'n2', target: 'n3', load: 0.95, transferRisk: 0.85 },
  { source: 'n3', target: 'n4', load: 0.9, transferRisk: 0.6 },
  { source: 'n4', target: 'n5', load: 0.85, transferRisk: 0.4 },
  { source: 'n5', target: 'n6', load: 0.7, transferRisk: 0.15 },
];

// 失效预演时间轴数据
const TIMELINE_DATA = [
  { time: 'T+0h', risk: 15, node: '轴承过热', status: 'current' },
  { time: 'T+2h', risk: 45, node: '密封破损', status: 'upcoming' },
  { time: 'T+5h', risk: 78, node: '转轮不平衡', status: 'upcoming' },
  { time: 'T+12h', risk: 92, node: '系统连锁跳闸', status: 'critical' },
];

// 系统韧性演化数据
const RESILIENCE_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}h`,
    resilience: (100 - i * 3.5 + Math.random() * 5).toFixed(1),
    entropy: (1.2 + i * 0.15).toFixed(2)
}));

export const CascadeFailurePredictionView: React.FC = () => {
  const [activeSource, setActiveSource] = useState<string | null>('n2');
  const [globalEntropy, setGlobalEntropy] = useState(1.42);
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
        setGlobalEntropy(prev => prev + (Math.random() - 0.48) * 0.05);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：系统级联预警 HUD */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0a0f1e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Network size={28} className="text-blue-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-widest font-bold">
                    <Binary size={14} /> System-Level Cascade Diagnostics
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    关键设备 <span className="text-blue-400 font-extrabold">级联失效预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">全域不确定性 (Entropy)</div>
                <div className="text-4xl font-mono font-bold text-cyan-400">{globalEntropy.toFixed(3)}</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">最大级联深度 (Hop)</div>
                <div className="text-3xl font-mono font-bold text-white">4 <span className="text-sm">Layers</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-green-400">系统稳态评估</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <ShieldCheck size={20} className="text-green-500" /> RESILIENT
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左侧：失效诱因与传播逻辑 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 风险源识别 */}
           <SciFiCard title="级联启动源识别" subtitle="PROPAGATION ORIGIN" className="border-blue-900/50 bg-[#081224]/80">
               <div className="space-y-3 py-2">
                   {MOCK_NODES.slice(1, 4).map(node => (
                       <div 
                         key={node.id}
                         onClick={() => setActiveSource(node.id)}
                         className={`p-3 rounded border transition-all cursor-pointer group relative overflow-hidden
                            ${activeSource === node.id ? 'bg-blue-950 border-blue-500' : 'bg-slate-900/40 border-slate-800 hover:border-blue-500/30'}
                         `}
                       >
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs font-bold text-slate-100 group-hover:text-blue-300">{node.name}</span>
                               <span className={`text-[10px] font-mono ${node.risk > 0.7 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                                   {(node.risk * 100).toFixed(0)}% Risk
                               </span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${node.risk > 0.7 ? 'bg-red-500' : 'bg-orange-500'}`} style={{width: `${node.risk * 100}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 脆弱路径排序 */}
           <SciFiCard title="系统脆弱路径分析" subtitle="VULNERABILITY RANK" className="flex-1 border-blue-900/50">
               <div className="flex flex-col h-full space-y-4 py-2">
                   {[
                       { path: '轴承 → 转轮 → 导叶', weight: 92, id: 'PATH-01' },
                       { path: '励磁 → 发电机 → 变压器', weight: 65, id: 'PATH-02' },
                       { path: '进水口 → 拦污栅 → 转轮', weight: 48, id: 'PATH-03' },
                   ].map((p, i) => (
                       <div key={i} className="bg-slate-900/60 p-3 rounded border border-slate-800 hover:bg-blue-900/10 transition-colors cursor-help">
                           <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-500">
                               <span>{p.id}</span>
                               <span className="text-blue-400">Prob: {p.weight}%</span>
                           </div>
                           <div className="text-xs text-slate-200 font-bold flex items-center gap-2">
                               <GitMerge size={12} className="text-blue-500" /> {p.path}
                           </div>
                       </div>
                   ))}
                   <div className="mt-auto p-3 bg-blue-900/20 border border-blue-500/30 rounded flex items-center gap-3">
                       <Zap className="text-blue-400" size={16} />
                       <div className="text-[10px] text-blue-200 uppercase font-bold tracking-tighter">
                           预测模型: 图神经网络 (GNN) 实时演化
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 全局拓扑与韧性趋势 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Workflow size={14} /> Multi-Physics Interdependency
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">最大受累节点</div>
                               <div className="text-xl font-mono font-bold text-white">UNIT-03 <span className="text-xs text-orange-400">CRITICAL</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">传播阻尼系数</div>
                               <div className="text-xl font-mono font-bold text-cyan-400">0.85</div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 图层图例 */}
               <div className="absolute bottom-6 right-6 z-10 bg-black/60 p-3 rounded border border-slate-700 text-[10px] space-y-2 pointer-events-auto">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> 正常交互 (Healthy)</div>
                   <div className={`flex items-center gap-2 ${activeSource ? 'animate-pulse' : ''}`}><div className="w-2 h-2 rounded-full bg-orange-500"></div> 风险扩散 (Propagation)</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> 功能失效 (Failed)</div>
               </div>

               <CascadeThreeScene 
                   nodes={MOCK_NODES}
                   links={MOCK_LINKS}
                   activePropagationId={activeSource}
                   showFlow={true}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 系统韧性趋势 */}
           <SciFiCard title="全系统韧性指数演化 (Resilience Index)" subtitle="DYNAMIC STABILITY" className="h-[220px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={RESILIENCE_TREND}>
                           <defs>
                               <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                           <Area type="monotone" dataKey="resilience" stroke="#10b981" fill="url(#resGrad)" strokeWidth={2} name="系统韧性" />
                           <Line type="monotone" dataKey="entropy" stroke="#8b5cf6" strokeWidth={1} dot={false} name="异常熵值" />
                           <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{value: '崩溃阈值', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft'}} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：失效预演时间轴与决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 失效预演时间轴 */}
           <SciFiCard title="级联失效演化预演" subtitle="TIME HORIZON" className="flex-1 border-blue-900/50">
               <div className="flex flex-col h-full space-y-4 py-2 relative">
                   <div className="absolute left-[19px] top-6 bottom-6 w-[1px] bg-slate-800 border-l border-dashed border-blue-900/30"></div>
                   {TIMELINE_DATA.map((item, i) => (
                       <div key={i} className="relative pl-10 group">
                           <div className={`absolute left-0 top-1 w-10 h-6 flex items-center justify-center rounded border transition-all
                              ${item.status === 'current' ? 'bg-orange-600 border-orange-400 text-white' : 
                                item.status === 'critical' ? 'bg-red-900 border-red-500 text-red-100 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}
                           `}>
                               <span className="text-[9px] font-bold">{item.time}</span>
                           </div>
                           <div className={`p-2.5 rounded border ${item.status === 'critical' ? 'bg-red-900/10 border-red-900/40' : 'bg-slate-900/30 border-slate-800'}`}>
                               <div className="flex justify-between items-center">
                                   <span className="text-xs font-bold text-slate-100">{item.node}</span>
                                   <span className="text-[10px] font-mono text-blue-400">{item.risk}% Prob</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 预防性对冲建议 */}
           <SciFiCard title="级联对冲策略方案" className="h-[280px] border-blue-900/50 bg-[#1a0505]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertOctagon className="text-orange-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1 uppercase tracking-widest">预防性负载重分布</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               检测到主轴承系统风险等级达到 85%，建议立刻将 UNIT-03 的 40% 负荷平移至 UNIT-01，以阻断机械激振引发的级联效应。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">下一步行动方案</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 隔离故障节点逻辑链路
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 启动辅机系统 B模式冗余
                       </div>
                       <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                           <TrendingDown size={14} className="animate-pulse" /> 预计可降低级联风险 35%
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-blue-700/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-lg text-xs text-blue-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <Share2 size={14} /> 分发至区域电网调度中心
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
