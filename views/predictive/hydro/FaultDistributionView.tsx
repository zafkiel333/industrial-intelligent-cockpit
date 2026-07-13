
import React, { useState, useEffect } from 'react';
import { FaultDistThreeScene } from '../../../components/predictive/hydro-fault-distribution/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-46]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-46';
import { UnitPredictionNode } from '../../../components/predictive/hydro-fault-distribution/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Eye, AlertOctagon, Target, Binary, 
  ShieldAlert, Activity, Search, Layers,
  Compass, Zap, TrendingUp, History,
  GitBranch, Info, Filter, Cpu, CheckCircle2,
  AlertTriangle, Settings
} from 'lucide-react';

// --- 模拟数据 ---

const MOCK_NODES: UnitPredictionNode[] = Array.from({ length: 120 }, (_, i) => {
    const typeProb = Math.random();
    let type: 'TP' | 'TN' | 'FP' | 'FN' = 'TP';
    if (typeProb > 0.85) type = 'FP';
    else if (typeProb > 0.75) type = 'FN';
    else if (typeProb > 0.5) type = 'TN';

    return {
        id: `U-${i}`,
        type,
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 20,
        value: Math.random() * 100
    };
});

const CONFUSION_DATA = [
    { name: '命中 (TP)', value: 85, color: '#0ea5e9', desc: '成功捕捉的真实故障' },
    { name: '误报 (FP)', value: 12, color: '#f59e0b', desc: '模型虚警，实际正常' },
    { name: '漏报 (FN)', value: 8, color: '#ef4444', desc: '真实故障未被检出' },
    { name: '正确转归 (TN)', value: 145, color: '#334155', desc: '正确识别的正常状态' },
];

const ERROR_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    fn_rate: 2 + Math.sin(i * 0.5) * 1.5,
    fp_rate: 5 - Math.cos(i * 0.3) * 2,
}));

const COMPONENT_ERROR_STATS = [
  { name: '上导轴承', fp: 12, fn: 2 },
  { name: '推力瓦', fp: 5, fn: 8 },
  { name: '定子线圈', fp: 3, fn: 1 },
  { name: '调速器阀组', fp: 18, fn: 5 },
  { name: '主变压器', fp: 2, fn: 1 },
];

export const FaultDistributionView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'FP' | 'FN'>('all');
  const [auditStatus, setAuditStatus] = useState('Standby');
  const [metrics, setMetrics] = useState({
      precision: 87.6,
      recall: 91.4,
      f1: 89.4,
      missRate: 8.6
  });

  // 模拟审计过程
  useEffect(() => {
    const timer = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            precision: 87.6 + (Math.random()-0.5),
            recall: 91.4 + (Math.random()-0.5)
        }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-blue-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* 头部：算法审计 HUD */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50">
                <Target size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldAlert size={14} /> Predictive Maintenance / Model Audit
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    预测漏报与误报 <span className="text-cyan-400 font-extrabold">设备分布分析</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合召回率 (Recall)</div>
                <div className="text-3xl font-mono font-bold text-green-400">{metrics.recall.toFixed(1)}%</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">未检出风险 (Leakage)</div>
                <div className="text-3xl font-mono font-bold text-red-500">{metrics.missRate.toFixed(1)}%</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">AI 审计状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    <CheckCircle2 size={20} className="text-green-500" /> ONLINE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：混淆矩阵与核心指标 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 混淆矩阵交互面板 */}
           <SciFiCard title="预测混淆矩阵 (Confusion Matrix)" subtitle="ALGORITHM STATS" className="border-cyan-900/50 bg-[#081224]/80">
               <div className="grid grid-cols-2 gap-2 h-full">
                   {CONFUSION_DATA.map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all cursor-pointer">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                               <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                           </div>
                           <div className="text-2xl font-mono font-bold text-white">{item.value}</div>
                           <div className="text-[9px] text-slate-600 mt-1 leading-tight">{item.desc}</div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 分领域误差统计 */}
           <SciFiCard title="设备领域误差分布" subtitle="BY COMPONENT" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={COMPONENT_ERROR_STATS} layout="vertical" margin={{left: -10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize: 10}} width={60} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                           <Bar dataKey="fp" name="误报 (FP)" fill="#f59e0b" stackId="a" />
                           <Bar dataKey="fn" name="漏报 (FN)" fill="#ef4444" stackId="a" />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 数据分布视口 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口：多维预测分布场 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD 层 */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-cyan-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Cpu size={14} /> Multi-Dimensional Error Space
                       </div>
                       <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-[10px] text-slate-400">命中 (Correct)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-[10px] text-slate-400">误报 (FP)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                                <span className="text-[10px] text-slate-400">漏报 (FN)</span>
                            </div>
                       </div>
                   </div>
               </div>

               {/* 右侧过滤器控制 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-slate-900/80 p-1 rounded border border-slate-700 flex flex-col gap-1 shadow-2xl">
                        {[
                            { id: 'all', label: '全部样本', icon: <Layers size={12}/> },
                            { id: 'FP', label: '仅看误报', icon: <AlertTriangle size={12} className="text-orange-400"/> },
                            { id: 'FN', label: '仅看漏报', icon: <AlertOctagon size={12} className="text-red-500"/> },
                        ].map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setFilter(m.id as any)}
                                className={`px-4 py-2 text-[10px] font-bold rounded transition-all uppercase tracking-widest flex items-center gap-2
                                    ${filter === m.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                                `}
                            >
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>
               </div>

               {/* 底部坐标说明 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none justify-center">
                    <div className="bg-black/60 backdrop-blur border border-slate-700 px-4 py-1.5 rounded-full flex gap-6 text-[10px] text-slate-500 uppercase tracking-widest">
                        <span>X-Axis: 设备载荷</span>
                        <div className="w-[1px] h-3 bg-slate-800 my-auto"></div>
                        <span>Y-Axis: 振动幅值</span>
                        <div className="w-[1px] h-3 bg-slate-800 my-auto"></div>
                        <span>Z-Axis: 累计时长</span>
                    </div>
               </div>

               <FaultDistThreeScene 
                   nodes={MOCK_NODES}
                   activeFilter={filter}
                   scanProgress={0.5}
                   showGrid={true}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 误报/漏报时序变动趋势 */}
           <SciFiCard title="误差率动态演化 (Temporal Drift)" subtitle="ERROR RATE TREND" className="h-[240px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ERROR_TREND}>
                           <defs>
                               <linearGradient id="colFP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                               <linearGradient id="colFN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#3b82f6'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                           <Area type="monotone" dataKey="fp_rate" stroke="#f59e0b" fill="url(#colFP)" name="误报率 (FP %)" />
                           <Area type="monotone" dataKey="fn_rate" stroke="#ef4444" fill="url(#colFN)" name="漏报率 (FN %)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：失效根因分析与优化决策 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 误差根因分析 */}
           <SciFiCard title="误差诱因根因分析" subtitle="ROOT CAUSE" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col h-full space-y-4 py-2">
                   {[
                       { label: '工况大幅波动', val: 45, color: 'bg-orange-500' },
                       { label: '传感器零漂', val: 28, color: 'bg-red-500' },
                       { label: '训练数据偏差', val: 15, color: 'bg-blue-500' },
                       { label: '环境突发干扰', val: 12, color: 'bg-purple-500' },
                   ].map((item, i) => (
                       <div key={i} className="space-y-1">
                           <div className="flex justify-between text-[10px]">
                               <span className="text-slate-400 font-bold uppercase">{item.label}</span>
                               <span className="text-white font-mono">{item.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${item.color}`} style={{width: `${item.val}%`}}></div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-auto p-3 bg-red-900/20 border border-red-900/40 rounded flex items-start gap-3">
                       <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                       <p className="text-[10px] text-red-200 leading-relaxed">
                           <span className="font-bold">高危风险点：</span> 调速器系统在 45% 负荷处出现漏报聚类。怀疑由于该工况下流体动力学特征与正常工况重叠度过高。
                       </p>
                   </div>
               </div>
           </SciFiCard>

           {/* AI 优化策略建议 */}
           <SciFiCard title="算法优化决策建议" className="h-[300px] border-cyan-900/50 bg-[#1a0a2e]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded flex items-start gap-3 shadow-inner">
                       <TrendingUp className="text-blue-400 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">模型超参数优化建议</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               当前误报率较高（12%）。建议提高异常判定的马氏距离阈值（MD &gt; 14.5），并引入环境温湿度作为补偿因子。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">下一步行动清单 (Pre-Actions)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <GitBranch size={14} className="text-blue-400" /> 开启模型“低负荷段”增量学习任务
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <Activity size={14} className="text-blue-400" /> 增加 7、15号导叶传感器 采样密度
                       </div>
                       <div className="flex items-center gap-2 text-xs text-orange-400 font-bold py-1">
                           <AlertOctagon size={14} className="animate-pulse" /> 重训练数据集 准备进度 (85%)
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2.5 bg-cyan-700/30 hover:bg-cyan-700/50 border border-cyan-500/50 rounded-lg text-xs text-cyan-100 font-bold transition-all flex items-center justify-center gap-2 group">
                       <Settings size={14} className="group-hover:rotate-180 transition-transform duration-700" /> 
                       执行模型版本灰度发布 (V2.6.0)
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
