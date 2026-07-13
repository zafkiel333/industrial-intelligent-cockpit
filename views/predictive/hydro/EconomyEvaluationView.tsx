
import React, { useState, useEffect } from 'react';
import { EconomyEvaluationScene } from '../../../components/predictive/hydro-economy/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-48]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-48';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, Coins, DollarSign, Wallet, 
  BarChart3, PieChart as PieChartIcon, Target,
  ArrowUpRight, ArrowDownRight, Zap, ShieldCheck,
  Briefcase, Activity, Clock, FileText,
  AlertCircle, Scale, Gem, CheckCircle2
} from 'lucide-react';

// --- 模拟数据 ---

// 1. 成本结余瀑布数据
const WATERFALL_DATA = [
  { name: '原始预算', value: 1200, fill: '#334155' },
  { name: '意外停机减少', value: -320, fill: '#10b981' },
  { name: '备件库存优化', value: -150, fill: '#10b981' },
  { name: '人力成本结余', value: -80, fill: '#10b981' },
  { name: 'AI系统投入', value: 120, fill: '#f59e0b' },
  { name: '最终优化成本', value: 770, fill: '#0ea5e9' },
];

// 2. 投资回收期趋势 (Payback)
const PAYBACK_TREND = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    investment: Math.max(0, 100 - i * 10),
    savings: i * 15,
    cumulative: -100 + i * 25
}));

// 3. 效益构成 (Benefit Breakdown)
const BENEFIT_DIST = [
  { name: '减少非计划停机', value: 45 },
  { name: '延长大修周期', value: 25 },
  { name: '备件精确库存', value: 20 },
  { name: '二级风险规避', value: 10 },
];

// 4. 不同策略ROI对比
const STRATEGY_COMPARE = [
  { name: '事后维修', roi: 0, cost: 450 },
  { name: '定期维保', roi: 12, cost: 300 },
  { name: '预测性维护', roi: 38, cost: 180 },
];

export const EconomyEvaluationView: React.FC = () => {
  const [metrics, setMetrics] = useState({
      roi: 38.4,
      npv: 450.2,
      paybackMonths: 8.5,
      totalSavings: 552.4
  });

  const [activeMetric, setActiveMetric] = useState<'roi' | 'npv' | 'payback'>('roi');

  // 动态数据模拟
  useEffect(() => {
    const timer = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            roi: 38.4 + (Math.random()-0.5)*0.5,
            totalSavings: prev.totalSavings + Math.random()*2
        }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      
      {/* 头部：经济效能 HUD */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#1a1302] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Gem size={28} className="text-amber-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-widest font-bold">
                    <DollarSign size={14} /> Industrial Asset Economy & ROI Audit
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    预测性维护 <span className="text-amber-500 font-extrabold">经济性评估</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-8 items-center pointer-events-auto">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">预测年化回报率 (ROI)</div>
                <div className="text-3xl font-mono font-bold text-green-400">+{metrics.roi.toFixed(1)}%</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">累计直接节约成本</div>
                <div className="text-3xl font-mono font-bold text-white">￥{metrics.totalSavings.toFixed(1)} <span className="text-sm text-slate-500">W</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-amber-400">资产价值状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <ShieldCheck size={20} className="text-green-500" /> APPRECIATING
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：成本结构与构成 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 成本瀑布分析 */}
           <SciFiCard title="运维预算优化路径" subtitle="WATERFALL ANALYSIS" className="flex-1 border-amber-900/50 bg-[#0c0800]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={WATERFALL_DATA} margin={{left: -20}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#2d2a1a" vertical={false} />
                               <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 9}} />
                               <YAxis hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                               <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                   {WATERFALL_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">效益核心驱动</div>
                       <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-400">意外停机风险降低</span>
                               <span className="text-green-400 font-bold">-26.5%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500" style={{width: '26.5%'}}></div>
                           </div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 效益来源构成 */}
           <SciFiCard title="经济效益构成" subtitle="BENEFIT SOURCES" className="h-[250px] border-amber-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={BENEFIT_DIST}
                               cx="50%" cy="50%"
                               innerRadius={50}
                               outerRadius={70}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               {BENEFIT_DIST.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={['#f59e0b', '#0ea5e9', '#10b981', '#6366f1'][index]} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 价值核心视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：资产价值流 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0802] to-[#020100] border border-amber-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(245,158,11,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-amber-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl">
                       <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Briefcase size={14} /> Financial Performance Digital Twin
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">净现值 (NPV)</div>
                               <div className="text-2xl font-mono font-bold text-white">￥{metrics.npv.toFixed(1)} <span className="text-xs">W</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">投资回收期</div>
                               <div className="text-2xl font-mono font-bold text-amber-400">{metrics.paybackMonths} <span className="text-xs">Months</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：经济指标快速切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-slate-900/80 p-1 rounded border border-slate-700 flex flex-col gap-1 shadow-2xl">
                        {[
                            { id: 'roi', label: '投资回报', icon: <TrendingUp size={12}/> },
                            { id: 'npv', label: '资产净值', icon: <Wallet size={12}/> },
                            { id: 'payback', label: '回收进度', icon: <Clock size={12}/> },
                        ].map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setActiveMetric(m.id as any)}
                                className={`px-4 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-widest flex items-center gap-2
                                    ${activeMetric === m.id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                                `}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
               </div>

               {/* 底部 HUD：实时节约流 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none justify-center">
                    <div className="bg-black/60 backdrop-blur border border-slate-700 px-6 py-2 rounded-full flex gap-8 text-[10px] text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div> Avoided Downtime Loss: ￥45k/h</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Inventory Savings: ￥120k/yr</span>
                    </div>
               </div>

               <EconomyEvaluationScene 
                   roiLevel={metrics.roi / 50}
                   savingsSpeed={activeMetric === 'roi' ? 2 : 1}
                   investmentFactor={0.3}
                   showValueStream={true}
                   activeMetric={activeMetric}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 累积净收益趋势 */}
           <SciFiCard title="累计经济收益与投资回收趋势" subtitle="CUMULATIVE CASH FLOW" className="h-[240px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PAYBACK_TREND}>
                           <defs>
                               <linearGradient id="colFlow" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2d2a1a" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0800', borderColor: '#f59e0b'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                           <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="url(#colFlow)" name="累积现金流" />
                           <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" label={{value: '盈亏平衡点', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft'}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：策略对比与投资建议 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* 不同维护策略效能对比 */}
           <SciFiCard title="维保策略效能对比" subtitle="STRATEGY BENCHMARK" className="flex-1 border-amber-900/50">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={STRATEGY_COMPARE}>
                                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
                                <YAxis hide />
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                                <Bar dataKey="cost" fill="#334155" name="单位成本" />
                                <Line type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={3} name="回报率" />
                            </ComposedChart>
                        </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-200">
                        <div className="font-bold flex items-center gap-1 mb-1"><Scale size={12}/> 最优解建议</div>
                        当前预测性维护策略在降低 60% 运维成本的同时，提升了 38% 的资产净收益。
                   </div>
               </div>
           </SciFiCard>

           {/* 投资优化建议 */}
           <SciFiCard title="智能投资优化决策" className="h-[320px] border-amber-900/50 bg-[#1a1200]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded flex items-start gap-3 shadow-inner">
                       <Zap className="text-yellow-400 shrink-0 mt-1" size={20} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase tracking-widest">预算重分配建议</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               预测 3号机组 备件需求在 Q3 将有 40% 的确定性下降。建议将 ￥12.5W 备件预算转移至边缘计算节点扩容。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">下一步增益方案</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 压缩“不必要”日常巡检频次
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 实施 5% 备件库存即时清理
                       </div>
                       <div className="flex items-center gap-2 text-xs text-amber-400 font-bold py-1">
                           <Activity size={14} className="animate-pulse" /> 预计 Q4 ROI 增长 4.2%
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2.5 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded-lg text-xs text-amber-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <FileText size={14} className="group-hover:translate-x-1 transition-transform" /> 
                       下发季度成本优化审计单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
