
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { RepeatThreeScene } from '../../components/maintenance_repeat/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[am-repeat-fault]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/am-repeat-fault';
import { FaultNode } from '../../components/maintenance_repeat/three-types';
// Added missing Microscope and ShieldCheck imports from lucide-react
import { 
  Dna, 
  Search, 
  Filter, 
  GitMerge, 
  Zap, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Fingerprint, 
  History, 
  TrendingUp,
  Target,
  Layers,
  ChevronRight,
  Database,
  Cpu,
  BarChart3,
  Network,
  Microscope,
  ShieldCheck
} from 'lucide-react';
// Added missing ComposedChart and Line imports from recharts
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
  ComposedChart,
  Line
} from 'recharts';

// --- 模拟数据 ---

const FAULT_NODES: FaultNode[] = [
  { id: 'F-201', label: '轴承A振动超限', position: [-4, 2, -3], clusterId: 0, similarity: 0.98 },
  { id: 'F-202', label: '轴承A过热', position: [-3.5, 1.5, -2.5], clusterId: 0, similarity: 0.95 },
  { id: 'F-203', label: 'A端密封磨损', position: [-4.5, 2.5, -3.5], clusterId: 0, similarity: 0.92 },
  { id: 'F-301', label: '变频器电容突降', position: [5, -2, 4], clusterId: 1, similarity: 0.88 },
  { id: 'F-302', label: '主回路谐波异常', position: [4.5, -1.5, 3.5], clusterId: 1, similarity: 0.85 },
  { id: 'F-401', label: '润滑泵流量偏低', position: [0, 5, -6], clusterId: 2, similarity: 0.75 },
];

const CURRENT_FINGERPRINT = [
  { subject: '振动幅值', A: 95, B: 88, fullMark: 100 },
  { subject: '温升速率', A: 82, B: 85, fullMark: 100 },
  { subject: '声纹能量', A: 70, B: 65, fullMark: 100 },
  { subject: '功耗偏移', A: 45, B: 40, fullMark: 100 },
  { subject: '响应延时', A: 92, B: 90, fullMark: 100 },
];

const RECURRENCE_AXIS = [
  { date: '03-15', count: 2, impact: 40 },
  { date: '03-22', count: 5, impact: 85 },
  { date: '03-29', count: 3, impact: 50 },
  { date: '04-05', count: 8, impact: 92 }, // 峰值
  { date: '04-12', count: 4, impact: 60 },
];

const MATCHING_HISTORY = [
  { id: 'HIST-9022', title: '#2 提升机相似振动', confidence: 98, date: '2023-11-12', solution: '更换弹性联轴器' },
  { id: 'HIST-8842', title: '#1 泵组同步异常', confidence: 85, date: '2023-08-05', solution: '重做动平衡标定' },
  { id: 'HIST-7761', title: '外部管廊共振', confidence: 72, date: '2023-05-20', solution: '加装减振支撑' },
];

export const RepeatFaultView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeNode = useMemo(() => FAULT_NODES.find(n => n.id === selectedNodeId), [selectedNodeId]);

  const handleDeepAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战略识别看板 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-orange-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-orange-400/50 relative group">
              <Fingerprint size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-orange-500/20 rounded animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Recursive Pattern Recognition Engine
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 重复性故障 <span className="text-orange-500 italic">模式识别中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">活跃顽固簇 (Clusters)</div>
              <div className="text-2xl font-mono font-bold text-orange-400">03 <span className="text-xs text-slate-600">Active</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">重复性占比 (Rate)</div>
              <div className="text-2xl font-mono font-bold text-red-500">22.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">模式匹配信度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">98.2%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：当前故障指纹分析 (DNA Profile) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="实时故障指纹 (DNA)" subtitle="PATTERN_DNA" highlight className="border-orange-500/20">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={CURRENT_FINGERPRINT}>
                          <PolarGrid stroke="#451a03" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="当前特征" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                          <Radar name="参考模式" dataKey="B" stroke="#64748b" strokeWidth={1} fill="#64748b" fillOpacity={0.1} strokeDasharray="5 5" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: '1px solid #7c2d12', borderRadius: '4px', fontSize: '12px' }} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="space-y-4 mt-4">
                    <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded-r">
                       <div className="text-[10px] text-orange-400 font-bold uppercase mb-1">指纹特征值识别 (Identifier)</div>
                       <div className="text-lg font-mono font-bold text-white tracking-widest uppercase">77X-B-9921</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500">主特征频率</div>
                          <div className="text-sm font-bold text-white">42.5 Hz</div>
                       </div>
                       <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <div className="text-[9px] text-slate-500">波峰偏离度</div>
                          <div className="text-sm font-bold text-red-400">+18.4%</div>
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 <span>设备健康基准比对</span>
                 <CheckCircle2 size={12} className="text-green-500" />
              </div>
              <div className="flex items-center gap-3">
                 <Microscope size={20} className="text-orange-500" />
                 <div className="text-[10px] text-slate-400 leading-relaxed italic">
                    “当前故障信号与历史案例 CL-02 匹配度极高，核心差异在于负载响应迟滞。”
                 </div>
              </div>
           </div>
        </div>

        {/* 中枢：3D 故障星云图 (The Cluster Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-orange-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs mb-1">
                          <Zap size={14} className="animate-pulse" />
                          NEURAL CLUSTER ENGINE: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          故障聚类 <span className="text-orange-500 italic">全息分布场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-orange-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">聚类分析深度</div>
                       <div className="text-2xl font-mono font-bold text-orange-400 leading-none mt-1">10k+ <span className="text-sm font-normal text-slate-600">Sample</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Network size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前选定簇 (Focus Cluster)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">Cluster #{activeNode?.clusterId ?? 'NULL'}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleDeepAnalysis}
                         className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
                       >
                          {isAnalyzing ? <RotateCw className="animate-spin" size={14}/> : <BrainCircuit size={16}/>}
                          {isAnalyzing ? '正在重构关联...' : '执行深度拓扑分析'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <RepeatThreeScene 
                    nodes={FAULT_NODES} 
                    activeClusterId={activeNode?.clusterId ?? null}
                    onNodeSelect={setSelectedNodeId}
                    isAnalyzing={isAnalyzing}
                 />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
           </div>

           {/* 底部：重复性时域演化轴 (Temporal Trend) */}
           <SciFiCard title="重复性模式演化曲线 (Temporal Recurrence)" subtitle="TIME_EVOLUTION" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={RECURRENCE_AXIS}>
                       <defs>
                          <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f051a', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                          cursor={{ stroke: '#f97316' }}
                       />
                       <Area type="monotone" dataKey="impact" name="生产影响指数" fill="url(#colorImpact)" stroke="#ef4444" strokeWidth={2} />
                       <Line type="step" dataKey="count" name="重复频次" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：模式匹配与根因治理 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="历史匹配库 (Best Matches)" subtitle="CANDIDATES" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {MATCHING_HISTORY.map((hist) => (
                       <div key={hist.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-orange-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-mono text-slate-500">{hist.id}</span>
                             <div className="flex items-center gap-1">
                                <span className="text-[10px] text-orange-400 font-bold">{hist.confidence}%</span>
                                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-orange-500" style={{ width: `${hist.confidence}%` }}></div>
                                </div>
                             </div>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{hist.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                             <CheckCircle2 size={10} className="text-green-500" />
                             <span>验证方案: {hist.solution}</span>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                       <History size={12} /> 查看所有历史类似案例
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 根因治理建议" subtitle="REASONING" className="border-orange-900/30 bg-orange-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-orange-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">顽固因素诊断</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “该故障模式在过去 90 天内重复出现 4 次，判定为 <span className="text-white font-bold">设计冗余度不足</span> 导致的连锁疲劳。单纯更换备件无法消除模式，建议改进联轴器支撑结构。”
                    </p>
                    <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 opacity-50"></div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Target size={12} className="text-red-500" /> 模式终结任务 (Mode Terminator)
                    </div>
                    {[
                      { label: '结构加强补焊', status: 'pending' },
                      { label: '控制频率动态避开', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-orange-500/30 transition-all">
                         <span className="text-[11px] text-slate-300">{step.label}</span>
                         <ChevronRight size={12} className="text-slate-700" />
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> 生成顽固故障治理方案
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">模式数据库版本</div>
                    <div className="text-xs font-bold text-white">Pattern_Core_v4.2.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-orange-500 transition-colors" />
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.6);
        }
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const PlusCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const RotateCw = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
  </svg>
);
