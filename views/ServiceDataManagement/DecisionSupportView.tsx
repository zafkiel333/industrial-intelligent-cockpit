
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Scatter, ScatterChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey, Cell, Legend
} from 'recharts';
import { 
  BrainCircuit, GitPullRequest, Gavel, TrendingUp, 
  AlertOctagon, CheckCircle2, XCircle, ChevronRight, 
  Lightbulb, Target, Scale, Zap, FileJson
} from 'lucide-react';

export const DecisionSupportView: React.FC = () => {
  const [activeDecisionId, setActiveDecisionId] = useState<string>('dec-001');
  const [simStep, setSimStep] = useState(0);

  // --- Mock Data ---

  // 1. Decision Queue
  const decisions = [
    { id: 'dec-001', title: '主轴承更换策略优化', asset: '提升机 #2', confidence: 94, impact: 'High', status: 'Pending', type: 'MAINTENANCE' },
    { id: 'dec-002', title: '液压系统降载运行建议', asset: '液压支架群', confidence: 88, impact: 'Medium', status: 'Approved', type: 'OPERATION' },
    { id: 'dec-003', title: '备件库存紧急调拨', asset: '破碎机齿板', confidence: 99, impact: 'High', status: 'Auto-Exec', type: 'SUPPLY' },
    { id: 'dec-004', title: '能耗异常根因排查', asset: '主通风机', confidence: 72, impact: 'Low', status: 'Rejected', type: 'DIAGNOSIS' },
  ];

  // 2. Feature Importance (Why the AI made this decision)
  const featureImportance = [
    { feature: '振动趋势 (Vib)', weight: 85, color: '#f59e0b' },
    { feature: '油液铁谱 (Fe)', weight: 65, color: '#f59e0b' },
    { feature: '历史故障 (Hist)', weight: 40, color: '#3b82f6' },
    { feature: '运行工时 (Run)', weight: 30, color: '#3b82f6' },
    { feature: '环境温度 (Env)', weight: 15, color: '#64748b' },
  ];

  // 3. Scenario Simulation (Cost/Risk Projection)
  const scenarioData = Array.from({length: 12}, (_, i) => ({
    month: `M${i+1}`,
    baseline: 100 + i * 10, // Run to failure cost increases
    preventive: 150, // Fixed cost
    predictive: 50 + (i > 6 ? 20 : 0) + (i === 6 ? 80 : 0), // Optimized intervention
  }));

  // 4. Decision Logic Nodes (for Central SVG)
  const logicNodes = [
    { id: 'input', label: '多源数据汇聚', x: 50, y: 150, type: 'start' },
    { id: 'model', label: '故障预测模型', x: 250, y: 150, type: 'process' },
    { id: 'rule', label: '业务规则引擎', x: 450, y: 80, type: 'process' },
    { id: 'resource', label: '资源约束校验', x: 450, y: 220, type: 'process' },
    { id: 'output', label: '最优决策生成', x: 650, y: 150, type: 'end' },
  ];
  
  // Animation loop for SVG flow
  useEffect(() => {
    const timer = setInterval(() => {
      setSimStep(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const activeDec = decisions.find(d => d.id === activeDecisionId) || decisions[0];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020204] p-2 overflow-hidden select-none">
      
      {/* 顶部：决策指挥舱 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-transparent border-b border-amber-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-amber-600/20 border border-amber-500/40 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
              <BrainCircuit className="text-amber-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务数据驱动的运维决策支持中心</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-amber-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Gavel size={12}/> ENGINE: DECISION_FOREST_V9</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Target size={12}/> OPTIMIZATION GOAL: COST_MINIMIZATION</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">AUTO-EXEC RATE: 42%</span>
              </div>
           </div>
        </div>

        <div className="flex gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">今日产生决策</span>
              <span className="text-xl font-mono font-black text-white">128 <span className="text-xs text-slate-500">条</span></span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">决策采纳率</span>
              <span className="text-xl font-mono font-black text-emerald-400">96.5%</span>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-bold">累计节省成本</span>
              <span className="text-xl font-mono font-black text-amber-400">¥ 2.4M</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 左侧：待决策项与依据 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Decision List */}
           <SciFiCard title="智能决策建议队列" subtitle="PENDING ACTIONS" className="flex-1 bg-amber-950/5 border-amber-900/40">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-full max-h-[400px]">
                 {decisions.map((dec, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setActiveDecisionId(dec.id)}
                     className={`relative p-3 rounded-lg border transition-all cursor-pointer group ${
                       activeDecisionId === dec.id 
                       ? 'bg-amber-900/20 border-amber-500/60 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' 
                       : 'bg-slate-900/40 border-slate-800 hover:border-amber-500/30'
                     }`}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] font-mono text-slate-400">{dec.id}</span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            dec.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                            dec.status === 'Auto-Exec' ? 'bg-purple-500/20 text-purple-400' :
                            dec.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                         }`}>{dec.status}</span>
                      </div>
                      <div className="text-xs font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">{dec.title}</div>
                      <div className="flex justify-between items-center text-[10px]">
                         <span className="text-slate-500">{dec.asset}</span>
                         <div className="flex items-center gap-1">
                            <span className="text-slate-500">置信度:</span>
                            <span className={`font-mono font-bold ${dec.confidence > 90 ? 'text-green-400' : 'text-amber-400'}`}>{dec.confidence}%</span>
                         </div>
                      </div>
                      {/* Active Indicator */}
                      {activeDecisionId === dec.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg"></div>
                      )}
                   </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Feature Weights */}
           <SciFiCard title="决策归因分析 (SHAP Values)" subtitle="WHY THIS?" className="h-1/3 border-amber-900/40">
              <div className="space-y-3 pt-2">
                 {featureImportance.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-24 text-[10px] text-slate-400 text-right">{f.feature}</div>
                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full rounded-full transition-all duration-1000" 
                             style={{width: `${f.weight}%`, backgroundColor: f.color}}
                          ></div>
                       </div>
                       <div className="w-8 text-[10px] font-mono text-white">{f.weight}</div>
                    </div>
                 ))}
              </div>
              <div className="mt-4 p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400 italic">
                 <span className="text-amber-500 font-bold">AI 解析:</span> 振动频谱的高频能量集中是本次推荐更换轴承的主导因素。
              </div>
           </SciFiCard>
        </div>

        {/* 中间：决策逻辑可视化引擎 (2D) */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#050508] border border-amber-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_60px_rgba(245,158,11,0.05)]">
              {/* Header */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <GitPullRequest className="text-amber-400" size={18} />
                    <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">Logic Flow Visualization</span>
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">Trace ID: {activeDec.id}-X992</div>
              </div>

              {/* Central SVG Visualization */}
              <div className="w-full h-full flex items-center justify-center p-4">
                 <svg className="w-full h-full" viewBox="0 0 800 400">
                    <defs>
                       <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                       </linearGradient>
                       <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                         <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                       </marker>
                    </defs>

                    {/* Connecting Lines */}
                    {[
                      { from: 'input', to: 'model' },
                      { from: 'model', to: 'rule' },
                      { from: 'model', to: 'resource' },
                      { from: 'rule', to: 'output' },
                      { from: 'resource', to: 'output' }
                    ].map((conn, i) => {
                       const start = logicNodes.find(n => n.id === conn.from)!;
                       const end = logicNodes.find(n => n.id === conn.to)!;
                       
                       // Bezier path
                       const pathD = `M ${start.x+60} ${start.y} C ${start.x+120} ${start.y}, ${end.x-60} ${end.y}, ${end.x-60} ${end.y} L ${end.x} ${end.y}`;
                       
                       return (
                          <g key={i}>
                             <path d={pathD} stroke="#1e293b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                             {/* Animated Data Packet */}
                             <circle r="4" fill="#facc15">
                                <animateMotion 
                                   dur={`${2 + i*0.5}s`} 
                                   repeatCount="indefinite" 
                                   path={pathD}
                                   keyPoints="0;1"
                                   keyTimes="0;1"
                                   calcMode="linear"
                                />
                             </circle>
                          </g>
                       );
                    })}

                    {/* Nodes */}
                    {logicNodes.map(node => (
                       <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                          <rect 
                             x="-60" y="-25" width="120" height="50" rx="8" 
                             fill="#0f172a" 
                             stroke={node.type === 'start' ? '#3b82f6' : node.type === 'end' ? '#10b981' : '#f59e0b'}
                             strokeWidth="2"
                             className="filter drop-shadow-lg"
                          />
                          <text x="0" y="5" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                             {node.label}
                          </text>
                          {/* Pulsing effect for active node */}
                          {node.type === 'process' && (
                             <circle r="4" cx="50" cy="-20" fill={node.id === 'model' ? '#f59e0b' : '#64748b'}>
                                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                             </circle>
                          )}
                       </g>
                    ))}

                    {/* Result Box (Dynamic based on selection) */}
                    <g transform="translate(650, 250)">
                        <text x="0" y="0" textAnchor="middle" fill="#94a3b8" fontSize="10">RECOMMENDATION</text>
                        <text x="0" y="20" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold" letterSpacing="1">
                           {activeDec.title}
                        </text>
                    </g>
                 </svg>
              </div>

              {/* Bottom Legend */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-6">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> <span className="text-[10px] text-slate-400">Data Flow</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> <span className="text-[10px] text-slate-400">AI Inference</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-[10px] text-slate-400">Strategy</span></div>
              </div>
           </div>

           {/* Execution Logs */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    <FileJson size={14} /> Decision Execution Log
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-600">10:42:01</span>
                    <span className="text-blue-400 font-bold">INPUT:</span>
                    <span>Received sensor batch #9921 from Hoist-02.</span>
                 </div>
                 <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-600">10:42:02</span>
                    <span className="text-amber-400 font-bold">MODEL:</span>
                    <span>Predicted Bearing Failure Probability: 89.2%.</span>
                 </div>
                 <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-600">10:42:03</span>
                    <span className="text-purple-400 font-bold">RULE:</span>
                    <span>Validated against 'Critical Asset' maintenance policy.</span>
                 </div>
                 <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
                    <span className="text-slate-600">10:42:04</span>
                    <span className="text-emerald-400 font-bold">OUTPUT:</span>
                    <span>Generated Work Order WO-2024-881. Pushed to ERP.</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：价值评估与执行 */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Scenario Simulation */}
           <SciFiCard title="策略价值模拟 (ROI)" subtitle="3-YEAR PROJECTION" className="flex-1 border-amber-900/50">
              <div className="h-52 w-full mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={scenarioData} margin={{left: -20}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Legend wrapperStyle={{fontSize: '9px'}} />
                       
                       <Line type="monotone" dataKey="baseline" stroke="#ef4444" strokeWidth={2} dot={false} name="Run-to-Failure Cost" />
                       <Line type="step" dataKey="preventive" stroke="#64748b" strokeWidth={1} dot={false} name="Scheduled Maint." />
                       <Area type="monotone" dataKey="predictive" fill="#10b981" stroke="#10b981" fillOpacity={0.2} name="AI Decision (Selected)" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded mt-2">
                 <TrendingUp size={16} className="text-emerald-400" />
                 <div className="flex-1">
                    <div className="text-[10px] text-emerald-200 font-bold">预计节省: ¥ 450,000</div>
                    <div className="text-[8px] text-slate-500">对比传统定期检修模式，避免了 2 次非计划停机。</div>
                 </div>
              </div>
           </SciFiCard>

           {/* Execution Panel */}
           <SciFiCard title="决策执行面板" className="border-amber-900/50">
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] text-slate-300">
                    <span>关联工单:</span>
                    <span className="font-mono text-white underline">WO-2024-881</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] text-slate-300">
                    <span>备件状态:</span>
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={10}/> 有库存</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] text-slate-300">
                    <span>执行班组:</span>
                    <span>机械检修一班 (Rating: 4.8)</span>
                 </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                 <button className="flex-1 py-2 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 rounded text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all">
                    <XCircle size={12} /> 驳回
                 </button>
                 <button className="flex-[2] py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                    <Zap size={12} /> 立即执行 (Approve)
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="知识沉淀" className="bg-blue-900/10 border-blue-800/20">
              <div className="flex gap-4 items-center">
                 <Scale className="text-blue-500" size={24} />
                 <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">规则自学习</div>
                    <div className="text-[9px] text-slate-500 mt-1">本次决策逻辑已反馈至 AI 模型，特征权重自动修正完成。</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
