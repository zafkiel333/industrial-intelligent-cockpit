import React, { useState, useRef, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  Cpu, 
  Microscope, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Dna,
  Clock,
  ArrowUpRight
} from 'lucide-react';
// Fix: Added CartesianGrid to the recharts import
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ComposedChart, Line, CartesianGrid
} from 'recharts';

// --- 模拟历史数据 ---
const HISTORY_NODES = [
  { id: 'WO-H-901', date: '2021-05-12', title: '全机组首次大修', type: 'OVERHAUL', cost: '¥12.5w', user: '张工', health: 95, impact: 'High' },
  { id: 'WO-H-724', date: '2022-02-08', title: '主轴承预防性更换', type: 'PM', cost: '¥3.2w', user: '王工', health: 98, impact: 'Med' },
  { id: 'WO-H-550', date: '2022-09-15', title: '润滑系统回路升级', type: 'UPGRADE', cost: '¥1.8w', user: '赵工', health: 92, impact: 'Low' },
  { id: 'WO-H-312', date: '2023-01-20', title: '非计划性停机抢修', type: 'EMERGENCY', cost: '¥8.9w', user: '张工', health: 75, impact: 'Critical' },
  { id: 'WO-H-201', date: '2023-11-05', title: '传感器集群校准', type: 'INSPECTION', cost: '¥0.5w', user: '李工', health: 96, impact: 'Low' },
  { id: 'WO-H-105', date: '2024-03-01', title: '智能监测模块接入', type: 'UPGRADE', cost: '¥2.4w', user: '系统自动', health: 99, impact: 'Med' },
];

const MAINTENANCE_DENSITY = [
  { month: '21-Q1', count: 12 }, { month: '21-Q2', count: 45 }, { month: '21-Q3', count: 18 }, { month: '21-Q4', count: 22 },
  { month: '22-Q1', count: 35 }, { month: '22-Q2', count: 15 }, { month: '22-Q3', count: 40 }, { month: '22-Q4', count: 28 },
  { month: '23-Q1', count: 65 }, { month: '23-Q2', count: 20 }, { month: '23-Q3', count: 15 }, { month: '23-Q4', count: 32 },
];

export const TimelineView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(HISTORY_NODES[3].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedNode = HISTORY_NODES.find(n => n.id === selectedId) || HISTORY_NODES[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#050505]">
      
      {/* 顶部：时空导航器 */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6 px-4 bg-gradient-to-b from-amber-950/10 to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-sm border border-amber-500/50 bg-amber-950/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <History size={32} />
           </div>
           <div>
              <div className="text-[10px] text-amber-600 uppercase tracking-[0.4em] mb-1">Temporal Data Archaeology</div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">历史工单 <span className="text-amber-500 italic">回溯时间轴</span></h1>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="搜索时空节点..." 
                className="bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs w-64 outline-none focus:border-amber-500 transition-all" 
              />
           </div>
           <button className="p-2 bg-slate-900 border border-slate-800 rounded hover:border-amber-500 transition-colors">
              <Filter size={18} className="text-amber-500" />
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* 左侧：任务考古详情 (考古日志) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="工单数字指纹" subtitle="DATA_FINGERPRINT" highlight className="border-amber-900/40">
              <div className="space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-[10px] font-mono text-amber-600 mb-1">{selectedNode.id}</div>
                       <div className="text-xl font-bold text-white">{selectedNode.title}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                       ${selectedNode.impact === 'Critical' ? 'bg-red-900/40 text-red-500 border border-red-500/50' : 'bg-amber-950/40 text-amber-500 border border-amber-500/50'}
                    `}>
                       Impact: {selectedNode.impact}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <Calendar size={10} /> 发生日期
                       </div>
                       <div className="text-sm font-bold text-white font-mono">{selectedNode.date}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <Cpu size={10} /> 维保类别
                       </div>
                       <div className="text-sm font-bold text-amber-400">{selectedNode.type}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <Clock size={10} /> 归档负责人
                       </div>
                       <div className="text-sm font-bold text-white">{selectedNode.user}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                          <TrendingUp size={10} /> 成本消耗
                       </div>
                       <div className="text-sm font-bold text-emerald-400 font-mono">{selectedNode.cost}</div>
                    </div>
                 </div>

                 <div className="p-4 bg-amber-950/10 border border-amber-900/30 rounded relative overflow-hidden">
                    <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-2">
                       <Microscope size={14} /> 考古备注 / Analysis
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                       “该节点记录了机组在极端工况下的性能表现。检修日志显示，通过更换 #3 密封圈并升级固件版本，有效解决了长期存在的微量渗油问题，系统健康度从 75% 恢复至 96%。”
                    </p>
                    <ArrowUpRight className="absolute bottom-2 right-2 text-amber-900" size={24} />
                 </div>

                 <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                       <FileText size={14} /> 调阅完整报告
                    </button>
                    <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all border border-slate-700">
                       <Dna size={14} />
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="维护能量分布" subtitle="ENERGY_SPECTRUM" className="flex-1 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MAINTENANCE_DENSITY}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                        cursor={{fill: 'rgba(245,158,11,0.05)'}}
                       />
                       <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                          {MAINTENANCE_DENSITY.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.count > 40 ? '#f59e0b' : '#334155'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：横向滚动时间轴主场 */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
           
           {/* 主交互时间轴 */}
           <div className="flex-1 relative bg-[#020202] border border-amber-900/20 rounded overflow-hidden flex flex-col group">
              
              {/* 时间轴装饰背景 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-900/50 to-transparent"></div>

              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs">
                          <Activity size={14} className="animate-pulse" />
                          SCANNING TEMPORAL FLUX: 100%
                       </div>
                       <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Chronos <span className="text-amber-500">Scroll</span></h3>
                    </div>
                    <div className="text-right bg-black/60 border border-amber-900/30 p-2 rounded backdrop-blur">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest">Active Archival Range</div>
                       <div className="text-xs font-mono font-bold text-amber-400">2021-01 / 2024-PRESENT</div>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="flex gap-2">
                       <button className="px-3 py-1 bg-amber-600/20 border border-amber-500/40 rounded text-[10px] text-amber-400 font-bold uppercase pointer-events-auto">全景模式</button>
                       <button className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-slate-500 font-bold uppercase pointer-events-auto">聚焦模式</button>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">Current Focus Target</div>
                        <div className="text-sm font-bold text-white font-mono">{selectedNode.id}</div>
                    </div>
                 </div>
              </div>

              {/* 横向滚动轴容器 */}
              <div 
                ref={scrollRef}
                className="flex-1 flex items-center overflow-x-auto custom-scrollbar px-[20%] space-x-32 snap-x"
              >
                 {HISTORY_NODES.map((node, i) => (
                    <div 
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 snap-center group
                        ${selectedId === node.id ? 'scale-125' : 'opacity-40 hover:opacity-100'}
                      `}
                    >
                       {/* 垂直时间线 */}
                       <div className={`w-[1px] h-20 bg-gradient-to-b from-transparent to-amber-500/50 mb-4 
                          ${selectedId === node.id ? 'opacity-100' : 'opacity-0'}
                       `}></div>

                       {/* 核心节点圆形 */}
                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-black
                          ${selectedId === node.id 
                            ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-110' 
                            : 'border-slate-700 group-hover:border-amber-800'}
                       `}>
                          <div className={`w-4 h-4 rounded-full transition-all duration-500
                             ${selectedId === node.id ? 'bg-amber-500 scale-100' : 'bg-slate-800 scale-50 group-hover:scale-100 group-hover:bg-amber-900'}
                          `}></div>
                       </div>

                       {/* 日期与标题标签 */}
                       <div className="absolute top-full mt-6 text-center whitespace-nowrap">
                          <div className={`text-[10px] font-mono mb-1 transition-colors
                             ${selectedId === node.id ? 'text-amber-400 font-bold' : 'text-slate-600'}
                          `}>{node.date}</div>
                          <div className={`text-xs font-bold transition-all
                             ${selectedId === node.id ? 'text-white translate-y-0' : 'text-slate-500 translate-y-2'}
                          `}>{node.title}</div>
                       </div>
                       
                       {/* 浮动装饰圈 */}
                       {selectedId === node.id && (
                         <div className="absolute -inset-4 border border-amber-500/20 rounded-full animate-ping opacity-20 pointer-events-none"></div>
                       )}
                    </div>
                 ))}
              </div>
           </div>

           {/* 底部：效能演化仪表 */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
              
              <SciFiCard title="健康度演化路径" subtitle="HEALTH_EVOLUTION" className="col-span-2">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={[
                          { name: '21', health: 95, cost: 20 },
                          { name: '22', health: 82, cost: 40 },
                          { name: '23', health: 75, cost: 85 },
                          { name: '24', health: 99, cost: 15 },
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px' }} />
                          <Area type="monotone" dataKey="health" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={2} name="系统健康度" />
                          <Line type="step" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="维修支出峰值" />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>

              <SciFiCard title="时域统计摘要" subtitle="SUMMARY" className="border-slate-800">
                 <div className="space-y-4 justify-center h-full flex flex-col">
                    <div className="flex justify-between items-center px-2">
                       <span className="text-xs text-slate-500">累计考古工单</span>
                       <span className="text-2xl font-bold text-white font-mono">1,482</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <span className="text-xs text-slate-500">平均大修间隔</span>
                       <span className="text-xl font-bold text-amber-500 font-mono">428 d</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <span className="text-xs text-slate-500">最长无故障运行</span>
                       <span className="text-xl font-bold text-emerald-400 font-mono">21.5 mo</span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                       <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest px-2">
                          <ShieldCheck size={12} className="text-green-500" /> 数据完整性已核验
                       </div>
                    </div>
                 </div>
              </SciFiCard>

           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(180, 83, 9, 0.4);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(180, 83, 9, 0.8);
        }
      `}</style>
    </div>
  );
};