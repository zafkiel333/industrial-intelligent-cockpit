
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitCompare, 
  Users, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Briefcase, 
  DollarSign, 
  ArrowRightLeft,
  ChevronRight,
  Scale,
  Target,
  Cpu,
  Flame,
  AlertTriangle,
  Layers,
  Dna,
  Binary,
  Gavel,
  CheckCircle2,
  Globe,
  FileText
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell, PieChart, Pie,
  ReferenceLine
} from 'recharts';

// --- 模拟数据 ---

const COST_STRUCTURE_INTERNAL = [
  { name: '人力工资', value: 45, color: '#0ea5e9' },
  { name: '工具折旧', value: 20, color: '#6366f1' },
  { name: '技能培训', value: 15, color: '#38bdf8' },
  { name: '备件库存', value: 20, color: '#1e293b' },
];

const COST_STRUCTURE_EXTERNAL = [
  { name: '合同总价', value: 65, color: '#f59e0b' },
  { name: '管理协调', value: 10, color: '#ea580c' },
  { name: '物流差旅', value: 15, color: '#fbbf24' },
  { name: '风险溢价', value: 10, color: '#451a03' },
];

const CROSSOVER_DATA = [
  { volume: 0, internal: 200, external: 50 },
  { volume: 20, internal: 240, external: 150 },
  { volume: 40, internal: 280, external: 250 },
  { volume: 50, internal: 300, external: 300 }, // 交叉点
  { volume: 60, internal: 320, external: 350 },
  { volume: 80, internal: 360, external: 450 },
  { volume: 100, internal: 400, external: 550 },
];

const KPI_COMPARISON = [
  { subject: '响应时效', self: 95, outsource: 70 },
  { subject: '技术深度', self: 75, outsource: 98 },
  { subject: '知识沉淀', self: 100, outsource: 40 },
  { subject: '成本确定性', self: 60, outsource: 90 },
  { subject: '安全管控', self: 92, outsource: 82 },
];

export const CostCompareView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('routine'); // routine, emergency, overhaul

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：模式博弈抬头 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-blue-900/10 via-transparent to-orange-900/10">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-slate-900 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-white/20 relative group">
              <GitCompare size={36} className="text-white group-hover:rotate-180 transition-transform duration-700" />
              <div className="absolute -inset-1 border border-white/10 rounded-lg animate-pulse"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maintenance Mode Strategic Duel
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维保模式 <span className="text-blue-500 italic">自行</span> vs <span className="text-orange-500 italic">外包</span> 成本博弈
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-slate-900/60 p-1.5 rounded-sm border border-slate-800 flex">
              {[
                { id: 'routine', label: '日常维保', icon: <Activity size={14}/> },
                { id: 'emergency', label: '紧急抢修', icon: <Zap size={14}/> },
                { id: 'overhaul', label: '年度大修', icon: <Gavel size={14}/> },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveScenario(tab.id)}
                  className={`px-6 py-2 text-xs font-bold transition-all rounded-sm flex items-center gap-2
                     ${activeScenario === tab.id ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}
                  `}
                >
                   {tab.icon} {tab.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：内源维保效能 (Self-Maintenance) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="内源维保成本结构" subtitle="INTERNAL_TCO" highlight className="flex-1 border-blue-500/20">
              <div className="h-full flex flex-col">
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={COST_STRUCTURE_INTERNAL} 
                            innerRadius={50} outerRadius={70} 
                            paddingAngle={5} dataKey="value"
                          >
                             {COST_STRUCTURE_INTERNAL.map((entry, index) => (
                               <Cell key={index} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-3 mt-4">
                    {COST_STRUCTURE_INTERNAL.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-blue-900/10 border border-blue-800/30 rounded">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-xs text-slate-400">{item.name}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white">{item.value}%</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">核心优势分析</div>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                          <CheckCircle2 size={12}/> 响应极速 (&lt; 15min)
                       </div>
                       <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                          <CheckCircle2 size={12}/> 核心Know-how完全掌控
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中轴：博弈分析场 (Break-even & Duel) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#030712] border border-white/5 rounded-sm overflow-hidden flex flex-col">
              {/* 背景战术格线 */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="relative z-10 p-6 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Binary size={14} className="animate-pulse" />
                          Economic Singularity Analysis
                       </div>
                       <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">
                          盈亏平衡点 <span className="text-indigo-500">动态推演库</span>
                       </h3>
                    </div>
                    <div className="bg-black/60 border border-slate-800 p-3 rounded backdrop-blur-sm text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">决策拐点指数</div>
                       <div className="text-3xl font-mono font-bold text-white">50.4<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 核心可视化：Crossover Chart */}
                 <div className="flex-1 w-full pointer-events-auto">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={CROSSOVER_DATA} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="volume" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: '维保任务量 (Task Volume)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} label={{ value: '总拥有成本 (TCO)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #4c1d95', borderRadius: '4px', fontSize: '12px' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area type="monotone" dataKey="internal" name="自行维保成本" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.05} strokeWidth={2} />
                          <Area type="monotone" dataKey="external" name="外包维保成本" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={2} />
                          <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '拐点: 50单位', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                          <Legend verticalAlign="top" height={36} iconType="diamond" />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Cpu size={24} className="text-blue-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">自行维保阈值</div>
                             <div className="text-lg font-bold text-white font-mono">¥ 280k <span className="text-[10px] text-green-500">+12%</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Globe size={24} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">外包损益阈值</div>
                             <div className="text-lg font-bold text-white font-mono">¥ 350k <span className="text-[10px] text-red-500">-8%</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/30">AI 最佳模式推荐</button>
                    </div>
                 </div>
              </div>

              {/* 对撞机特效装饰 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20 pointer-events-none"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full opacity-10 pointer-events-none animate-ping"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="核心KPI对撞机" subtitle="KPI_COLLISION" className="border-slate-800">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={KPI_COMPARISON}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="自行维保" dataKey="self" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.2} />
                          <Radar name="外包服务" dataKey="outsource" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="风险对冲模型" subtitle="RISK_HEDGING">
                 <div className="flex flex-col h-full justify-center gap-4">
                    {[
                      { label: '交付延迟风险', self: 10, out: 45 },
                      { label: '质量一致性风险', self: 15, out: 20 },
                      { label: '知识产权流失', self: 2, out: 85 },
                    ].map((risk, i) => (
                      <div key={i} className="space-y-1">
                         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                            <span>{risk.label}</span>
                            <span className="flex gap-2">
                               <span className="text-blue-400">S:{risk.self}</span>
                               <span className="text-orange-400">O:{risk.out}</span>
                            </span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-500" style={{width: `${risk.self}%`}}></div>
                            <div className="h-full bg-orange-500" style={{width: `${risk.out}%`}}></div>
                         </div>
                      </div>
                    ))}
                    <div className="mt-2 text-[10px] text-slate-400 italic">
                       * 外包模式在“知识产权”维度存在显著风险
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：外协资源势能 (Outsourced Maintenance) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           <SciFiCard title="外包维保成本结构" subtitle="EXTERNAL_FEES" highlight className="flex-1 border-orange-500/20">
              <div className="h-full flex flex-col">
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={COST_STRUCTURE_EXTERNAL} 
                            innerRadius={50} outerRadius={70} 
                            paddingAngle={5} dataKey="value"
                          >
                             {COST_STRUCTURE_EXTERNAL.map((entry, index) => (
                               <Cell key={index} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-3 mt-4">
                    {COST_STRUCTURE_EXTERNAL.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-orange-900/10 border border-orange-800/30 rounded">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-xs text-slate-400">{item.name}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-white">{item.value}%</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">外部势能分析</div>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                          <CheckCircle2 size={12}/> 获取全球顶尖专家支持
                       </div>
                       <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                          <CheckCircle2 size={12}/> 资产拥有成本极小化 (CapEx Free)
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 战略模式建议" subtitle="AI_ADVISORY" className="border-indigo-900/30">
              <div className="flex flex-col gap-4">
                 <div className="p-4 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Cpu size={18} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">推荐方案: 混合模式 (Hybrid)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                       “基于当前资产状况及任务复杂度，建议将 <span className="text-white font-bold">85%</span> 的日常点检任务保留在内源维保，而将 <span className="text-orange-400 font-bold">#4 机组</span> 这种涉及非公开算法的组件大修任务通过外包完成，以降低 22% 的管理复杂度。”
                    </p>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                       <span>数据信度系数</span>
                       <span className="text-green-500">0.982</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[98%] shadow-[0_0_10px_#22c55e]"></div>
                    </div>
                 </div>

                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> 生成战略维保白皮书
                 </button>
              </div>
           </SciFiCard>
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
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};
