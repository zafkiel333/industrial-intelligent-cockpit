import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CriticalThreeScene } from '../../components/spare_parts_critical/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-critical-list]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-critical-list';
import { CriticalPartNode } from '../../components/spare_parts_critical/three-types';
import { 
  ShieldAlert, 
  Layers, 
  Settings, 
  Activity, 
  Database, 
  Search, 
  Filter, 
  Cpu, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  FileSearch,
  ChevronRight,
  GitBranch,
  Factory,
  BarChart3,
  Box,
  Binary,
  ArrowRight,
  Download,
  Plus,
  // Fix: Added missing Target import to resolve Error at line 295
  Target
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟业务数据 ---
const CRITICAL_NODES: CriticalPartNode[] = [
  { id: 'P01', name: '主轴轴承 (Main Bearing)', score: 98, riskLevel: 'critical', position: [-2, 1, -2], category: '动力系统' },
  { id: 'P02', name: '液压伺服阀 (Servo Valve)', score: 92, riskLevel: 'critical', position: [3, -1, 4], category: '控制系统' },
  { id: 'P03', name: '密封圈组 (Seal Kit)', score: 75, riskLevel: 'high', position: [0, 4, -5], category: '液压系统' },
  { id: 'P04', name: 'PLC CPU 模块', score: 88, riskLevel: 'high', position: [-6, -2, 2], category: '电气系统' },
  { id: 'P05', name: '冷却风扇 (Cooling Fan)', score: 45, riskLevel: 'medium', position: [5, 3, -1], category: '辅助系统' },
];

const EVAL_DIMENSIONS = [
  { subject: '停机损失', A: 95, fullMark: 100 },
  { subject: '获取难度', A: 88, fullMark: 100 },
  { subject: '故障频次', A: 70, fullMark: 100 },
  { subject: '技术门槛', A: 85, fullMark: 100 },
  { subject: '成本压力', A: 60, fullMark: 100 },
];

const RECENT_LISTS = [
  { id: 'LST-001', name: '2024年度水轮机组清单', count: 42, status: '已审定', date: '03-25' },
  { id: 'LST-002', name: '辅机系统备件补充库', count: 18, status: '草稿', date: '04-01' },
];

export const CriticalListView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(CRITICAL_NODES[0].id);
  const [activeTab, setActiveTab] = useState('structure');
  const [searchTerm, setSearchTerm] = useState('');

  const activePart = useMemo(() => CRITICAL_NODES.find(n => n.id === selectedId) || CRITICAL_NODES[0], [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战略资源指挥台 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-orange-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-400/50 relative group">
              <ShieldAlert size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-orange-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Strategic Spare Parts Governance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 关键备件清单 <span className="text-orange-500 italic">全息构建服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键件占比</div>
              <div className="text-2xl font-mono font-bold text-orange-400">12.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">风险覆盖度</div>
              <div className="text-2xl font-mono font-bold text-green-400">98.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AI 推荐准确率</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">96.2%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：资产物理架构 (Asset Explorer) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Layers size={14} className="text-orange-500" /> 物理资产树</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 px-1">
              {['动力系统', '控制系统', '液压系统', '电气系统', '辅助系统'].map(group => (
                <div key={group} className="mb-2">
                   <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 rounded-t border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group">
                      <ChevronRight size={14} className="text-slate-500 group-hover:text-orange-500" />
                      <span className="text-xs font-bold text-slate-300">{group}</span>
                   </div>
                   <div className="pl-6 pt-2 space-y-1">
                      {CRITICAL_NODES.filter(n => n.category === group).map(node => (
                        <div 
                          key={node.id}
                          onClick={() => setSelectedId(node.id)}
                          className={`p-2 rounded text-xs transition-all cursor-pointer flex justify-between items-center
                            ${selectedId === node.id ? 'bg-orange-600/10 text-orange-400 border border-orange-500/30' : 'text-slate-500 hover:text-slate-300'}
                          `}
                        >
                           <div className="flex items-center gap-2">
                              <div className={`w-1 h-1 rounded-full ${node.riskLevel === 'critical' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-600'}`}></div>
                              {node.name.split(' (')[0]}
                           </div>
                           <span className="text-[10px] font-mono opacity-50">{node.id}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>

           <SciFiCard title="归档历史清单" subtitle="ARCHIVE">
              <div className="space-y-3">
                 {RECENT_LISTS.map(lst => (
                    <div key={lst.id} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded group hover:border-orange-500/30 transition-all cursor-pointer">
                       <div>
                          <div className="text-[11px] font-bold text-slate-200 group-hover:text-orange-300">{lst.name}</div>
                          <div className="text-[9px] text-slate-600 font-mono">{lst.id} | {lst.date}</div>
                       </div>
                       <span className={`text-[10px] font-bold ${lst.status === '已审定' ? 'text-green-500' : 'text-slate-500'}`}>{lst.count} 项</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：全息拓扑映射 (The Reactor) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-orange-900/20 rounded-sm overflow-hidden group">
              {/* 背景装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          CRITICALITY CONVERGENCE FIELD
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          关键度 <span className="text-orange-500 italic">拓扑聚合场</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-orange-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">推荐清单密度</div>
                       <div className="text-3xl font-mono font-bold text-orange-400 leading-none mt-1">H-9.4 <span className="text-sm font-normal text-slate-600">Density</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Binary size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前焦点对象 (Focus Node)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{activePart.name}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20">加入构建清单</button>
                       <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-sm text-xs uppercase tracking-widest border border-slate-700 transition-all">全域回溯分析</button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <CriticalThreeScene 
                    parts={CRITICAL_NODES} 
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    isRotating={!selectedId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>
           </div>

           {/* 底部：构建清单明细表 (Construction Grid) */}
           <SciFiCard title="备件清单构建明细 (Draft Grid)" subtitle="LIST_BUILDER" className="h-64 border-emerald-900/30">
              <div className="overflow-x-auto h-full custom-scrollbar">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-[#0b1221] z-10 border-b border-slate-800">
                       <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                          <th className="py-3 px-4">UID</th>
                          <th className="py-3 px-4">备件名称 / 规格</th>
                          <th className="py-3 px-4">关键度</th>
                          <th className="py-3 px-4">主要风险源</th>
                          <th className="py-3 px-4 text-right">操作</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                       {CRITICAL_NODES.map(node => (
                          <tr key={node.id} className={`group hover:bg-slate-900/40 transition-colors ${selectedId === node.id ? 'bg-orange-950/10' : ''}`}>
                             <td className="py-4 px-4 font-mono text-xs text-orange-500">{node.id}</td>
                             <td className="py-4 px-4">
                                <div className="text-xs font-bold text-slate-100">{node.name}</div>
                                <div className="text-[9px] text-slate-600 mt-1 uppercase">{node.category}</div>
                             </td>
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                   <div className="flex-1 h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${node.score > 90 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${node.score}%` }}></div>
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-400">{node.score}</span>
                                </div>
                             </td>
                             <td className="py-4 px-4">
                                <span className="text-[10px] text-slate-500 italic">
                                   {node.riskLevel === 'critical' ? '⚡ 停机即损 45k/h' : '⏳ 采购提前期 14d'}
                                </span>
                             </td>
                             <td className="py-4 px-4 text-right">
                                <button className="p-1.5 hover:bg-red-900/20 text-slate-600 hover:text-red-500 rounded transition-colors"><Zap size={14}/></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：决策推演与策略 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="分值评估雷达" subtitle="SCORING_V2">
              <div className="h-56 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={EVAL_DIMENSIONS}>
                       <PolarGrid stroke="#1e293b" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar 
                          name="分值" 
                          dataKey="A" 
                          stroke="#f97316" 
                          strokeWidth={2} 
                          fill="#f97316" 
                          fillOpacity={0.2} 
                       />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 备选清单建议" subtitle="REASONING" className="flex-1 border-orange-900/30 bg-orange-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-orange-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">基于 RCM 的决策建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “通过分析最近 24 个月的维护工单发现，<span className="text-white font-bold">#2 伺服阀</span> 的故障与油液清洁度高度正相关。建议将此备件列入‘绝对关键清单’，并同步增加过滤芯的储备等级。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Zap size={60} className="text-orange-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Target size={12} className="text-red-500" /> 供应链敏感度探测 (Suppliers)
                    </div>
                    {[
                      { label: 'SKF 原厂 (进口)', status: 'delay', time: '142d' },
                      { label: '博世力士乐 (代理)', status: 'normal', time: '12d' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         <span className={`font-mono text-[10px] font-bold ${step.status === 'delay' ? 'text-red-400' : 'text-green-400'}`}>{step.time}</span>
                      </div>
                    ))}
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <CheckCircle2 size={16} /> 提交清单并下发采购令
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Download size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">导出构建分析报告</div>
                    <div className="text-xs font-bold text-white">Full_Critical_BOM.xlsx</div>
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
          background: rgba(249, 115, 22, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </div>
  );
};
