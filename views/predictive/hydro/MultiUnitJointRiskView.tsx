
import React, { useState, useEffect } from 'react';
import { MultiUnitThreeScene } from '../../../components/predictive/hydro-multi-unit/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-40]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-40';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ComposedChart, Line, ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Network, ShieldAlert, Activity, Zap, 
  GitPullRequest, Share2, AlertOctagon, 
  Cpu, Binary, GitFork, BarChart3, TrendingUp,
  Flame, Wind, Box, ArrowRight
} from 'lucide-react';
import { UnitRiskState } from '../../../components/predictive/hydro-multi-unit/three-types';

// --- 模拟数据 ---

const MOCK_UNITS: UnitRiskState[] = [
    { id: 'UNIT-01', health: 95, power: 300, riskLevel: 0.12, isPulsing: false },
    { id: 'UNIT-02', health: 88, power: 305, riskLevel: 0.35, isPulsing: false },
    { id: 'UNIT-03', health: 72, power: 280, riskLevel: 0.78, isPulsing: true },
    { id: 'UNIT-04', health: 91, power: 300, riskLevel: 0.22, isPulsing: false },
];

const RISK_MATRIX = [
    { source: '1号机组', target: '2号机组', correlation: 0.45, type: 'Mechanical' },
    { source: '2号机组', target: '3号机组', correlation: 0.72, type: 'Hydraulic' },
    { source: '3号机组', target: '4号机组', correlation: 0.25, type: 'Electrical' },
    { source: '1号机组', target: '3号机组', correlation: 0.55, type: 'Common-Aux' },
];

const JOINT_PROBABILITY_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    prob: 1.5 + Math.sin(i * 0.3) * 0.5 + (i > 15 ? i * 0.2 : 0),
    threshold: 5.0
}));

const SYSTEM_ENTROPY_DATA = Array.from({length: 12}, (_, i) => ({
    node: `Node ${i+1}`,
    entropy: 20 + Math.random() * 60,
    impact: Math.random() * 100
}));

export const MultiUnitJointRiskView: React.FC = () => {
  // --- 状态 ---
  const [activeLink, setActiveLink] = useState<number | null>(1);
  const [globalRisk, setGlobalRisk] = useState(24.5);
  const [unitData, setUnitData] = useState<UnitRiskState[]>(MOCK_UNITS);

  // 动态模拟
  useEffect(() => {
    const timer = setInterval(() => {
        setGlobalRisk(prev => prev + (Math.random() - 0.5) * 0.5);
        setUnitData(prev => prev.map(u => ({
            ...u,
            riskLevel: Math.max(0, Math.min(1, u.riskLevel + (Math.random()-0.5)*0.02))
        })));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：全站级风险 HUD */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-widest font-bold">
             <Network size={14} className="animate-pulse" />
             Power Station Fleet Health & Risk Topology
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             多机组联合 <span className="text-blue-400">故障风险预测与协同</span>
          </h1>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">全站联合失效概率 (Joint P)</div>
                <div className={`text-4xl font-mono font-bold ${globalRisk > 30 ? 'text-orange-500 animate-pulse' : 'text-cyan-400'}`}>
                    {globalRisk.toFixed(2)}%
                </div>
            </div>
            <div className="h-10 w-[1px] bg-blue-900/40"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">系统耦合熵指数 (Entropy)</div>
                <div className="text-3xl font-mono font-bold text-white">4.82 <span className="text-sm">bits</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">协同诊断引擎</div>
                <div className="flex items-center gap-2 text-green-400 font-bold">
                    <ShieldAlert size={16} /> CLUSTER-AI ACTIVE
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：风险传播与耦合矩阵 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 风险传播矩阵 */}
           <SciFiCard title="机组风险关联矩阵" subtitle="PROPAGATION MATRIX" className="flex-1 border-blue-900/50 bg-[#081224]/80">
               <div className="flex flex-col gap-3 h-full">
                   {RISK_MATRIX.map((link, idx) => (
                       <div 
                         key={idx}
                         onMouseEnter={() => setActiveLink(idx)}
                         className={`p-3 rounded border transition-all cursor-pointer group
                            ${activeLink === idx ? 'bg-blue-950/40 border-blue-500 shadow-lg' : 'bg-slate-900/40 border-slate-800'}
                         `}
                       >
                           <div className="flex justify-between items-center mb-2">
                               <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                   {link.source} <ArrowRight size={10} className="text-blue-500" /> {link.target}
                               </div>
                               <span className="text-[10px] text-blue-400 font-mono">{(link.correlation * 100).toFixed(0)}%</span>
                           </div>
                           <div className="flex justify-between items-end">
                               <div className="text-[9px] text-slate-500 uppercase">{link.type} Link</div>
                               <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{width: `${link.correlation * 100}%`}}></div>
                               </div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-auto p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                       <div className="flex items-center gap-2 text-blue-300 text-xs mb-1 font-bold">
                           <Zap size={14} /> 联合风险提示
                       </div>
                       <p className="text-[10px] text-slate-400 leading-relaxed">
                           监测到 3号机组 振动超标，通过尾水管共用廊道对 2号机组 的影响概率已上升至 72%。
                       </p>
                   </div>
               </div>
           </SciFiCard>

           {/* 共因失效分布 */}
           <SciFiCard title="共因失效 (CCF) 分析" subtitle="SYSTEMIC RISK" className="h-[280px] border-blue-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                           { subject: '公用水系统', A: 85, fullMark: 100 },
                           { subject: '控制网络', A: 60, fullMark: 100 },
                           { subject: '润滑油总管', A: 90, fullMark: 100 },
                           { subject: '主变母线', A: 75, fullMark: 100 },
                           { subject: '站用电系统', A: 45, fullMark: 100 },
                       ]}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Common Risk" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：全站 3D 数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#02040a] to-[#000105] border border-blue-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.1)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-blue-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Binary size={14} /> Fleet Probability Model
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">协同冗余度</div>
                               <div className="text-xl font-mono font-bold text-white">N+2 <span className="text-xs">Active</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">最大受累节点</div>
                               <div className="text-xl font-mono font-bold text-orange-400">UNIT-03</div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右下角状态图例 */}
               <div className="absolute bottom-6 right-6 z-10 bg-black/60 p-3 rounded border border-slate-700 text-[10px] space-y-2 pointer-events-auto">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div> 稳定运行 (Healthy)</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_orange]"></div> 风险预警 (Warning)</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]"></div> 严重不平衡 (Critical)</div>
               </div>

               <MultiUnitThreeScene 
                   units={unitData}
                   globalRisk={globalRisk}
                   connectionStrength={0.65}
                   activeLinkIndex={activeLink}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 全站联合失效概率趋势 */}
           <SciFiCard title="联合失效概率演化趋势" subtitle="365-DAY FORECAST" className="h-[220px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={JOINT_PROBABILITY_TREND}>
                           <defs>
                               <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Prob (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#22d3ee'}} />
                           <ReferenceLine y={5.0} stroke="red" strokeDasharray="3 3" label={{value: '禁运线', fill: 'red', fontSize: 10}} />
                           <Area type="monotone" dataKey="prob" stroke="#0ea5e9" fill="url(#colorProb)" strokeWidth={2} name="联合风险" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：失效传播推演与应对 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 系统熵与拓扑重要性 */}
           <SciFiCard title="系统节点拓扑权重" subtitle="TOPOLOGY IMPORTANCE" className="flex-1 border-blue-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: -20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="entropy" stroke="#64748b" tick={{fontSize: 10}} hide />
                           <YAxis type="number" dataKey="impact" stroke="#64748b" tick={{fontSize: 10}} hide />
                           <ZAxis type="number" dataKey="impact" range={[50, 400]} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                           <Scatter name="Nodes" data={SYSTEM_ENTROPY_DATA}>
                               {SYSTEM_ENTROPY_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : '#0ea5e9'} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                       <span>高敏感节点: 主变母线</span>
                       <span>低敏感节点: #4供水泵</span>
                   </div>
               </div>
           </SciFiCard>

           {/* 预防性协同建议 */}
           <SciFiCard title="全站协同应对策略" className="h-[320px] border-blue-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded flex items-start gap-3">
                       <AlertOctagon className="text-orange-500 shrink-0" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white mb-1">风险平抑策略 (Risk Dampening)</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               由于3号机组风险上升，建议通过AGC系统将150MW负荷转移至1号及4号机组，以降低公共尾水管的水力激振耦合。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-blue-500 pl-2">下一步行动方案</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <GitFork size={14} className="text-blue-400" /> 开启辅机系统 B模式冗余备份
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <Activity size={14} className="text-blue-400" /> 启动 2-3号机组 联合振动指纹扫描
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <TrendingUp size={14} className="text-blue-400" /> 预测 4h 后 耦合风险达阈值
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-blue-700/30 hover:bg-blue-600/50 border border-blue-500/50 rounded text-xs text-blue-100 transition-colors flex items-center justify-center gap-2">
                       <Share2 size={12} /> 分发协同诊断工单
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
