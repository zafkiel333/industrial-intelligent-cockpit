import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { InventoryOptScene } from '../../components/spare_parts_inventory_opt/InventoryOptScene';
import { InventoryNode } from '../../components/spare_parts_inventory_opt/three-types';
import { 
  BarChart3, 
  TrendingDown, 
  Activity, 
  Zap, 
  Database, 
  Layers, 
  ShieldCheck, 
  Target, 
  BrainCircuit, 
  RefreshCw, 
  AlertTriangle,
  ArrowRight,
  PieChart,
  Boxes,
  Briefcase,
  LineChart,
  Warehouse,
  ChevronRight,
  Scale
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';

// --- 模拟业务数据 ---
const INVENTORY_NODES: InventoryNode[] = [
  { id: 'ITM-01', name: '精密轴承 SKF-7', turnoverRate: 0.85, stockHealth: 0.95, value: 450000, category: 'A', position: [3, 1, 2] },
  { id: 'ITM-02', name: '液压伺服主阀', turnoverRate: 0.42, stockHealth: 0.65, value: 120000, category: 'B', position: [-4, 2, -3] },
  { id: 'ITM-03', name: '电机冷却风扇', turnoverRate: 0.15, stockHealth: 0.42, value: 15000, category: 'C', position: [0, -5, 4] },
  { id: 'ITM-04', name: '高压密封套件', turnoverRate: 0.92, stockHealth: 0.88, value: 280000, category: 'A', position: [-2, -2, -6] },
  { id: 'ITM-05', name: 'PLC控制模块', turnoverRate: 0.35, stockHealth: 0.72, value: 95000, category: 'B', position: [6, 3, -1] },
];

const ABC_DISTRIBUTION = [
  { name: 'A类 (高值)', value: 75, color: '#f59e0b' },
  { name: 'B类 (中值)', value: 20, color: '#0ea5e9' },
  { name: 'C类 (普值)', value: 5, color: '#64748b' },
];

const TURNOVER_TREND = [
  { month: '01', rate: 1.2 }, { month: '02', rate: 1.5 },
  { month: '03', rate: 1.8 }, { month: '04', rate: 2.4 },
  { month: '05', rate: 2.1 }, { month: '06', rate: 2.8 },
];

export const InventoryOptView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(INVENTORY_NODES[0].id);
  const [optMode, setOptMode] = useState(false);

  const activeItem = useMemo(() => INVENTORY_NODES.find(n => n.id === selectedId) || INVENTORY_NODES[0], [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略平衡控制台 */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-white/20 relative group">
              <Warehouse size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Spare Parts Inventory Optimization
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件库存 <span className="text-cyan-500 italic">智慧平衡中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">资金占用优化</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">-¥ 1.24 <span className="text-sm font-normal text-slate-600">M</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">库存周转率 (ITO)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">4.52 <span className="text-xs text-slate-600">X</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">服务水平目标</div>
              <div className="text-2xl font-mono font-bold text-white">99.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：现状画像 (Current Profile) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="库存ABC分类矩阵" subtitle="VALUE_DISTRIBUTION" highlight className="flex-1">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RePieChart>
                          <Pie
                            data={ABC_DISTRIBUTION}
                            cx="50%" cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={8}
                            dataKey="value"
                          >
                             {ABC_DISTRIBUTION.map((entry, index) => (
                               <Cell key={index} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       </RePieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-3 mt-4">
                    {ABC_DISTRIBUTION.map(item => (
                       <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-xs text-slate-400 font-bold uppercase">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-100">{item.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="滞呆库存扫描" subtitle="DEAD_STOCK_ALERTS" className="h-48">
              <div className="space-y-4">
                 <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded-r flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-red-200">超量存储预警</span>
                       <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                       检测到 <span className="text-white">ITM-03 冷却风扇</span> 已有 18 个月无领用记录，建议执行折价调拨或清理流程。
                    </p>
                 </div>
                 <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-500 uppercase">沉淀资金规模</span>
                    <span className="text-red-400 font-mono font-bold">¥ 842.5k</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 引力平衡场 (Equilibrium Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#02040a] border border-cyan-900/20 rounded overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Dynamic Equilibrium Tracker
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          库存状态 <span className="text-cyan-500 italic">三维引力场</span>
                       </h2>
                    </div>
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <button 
                         onClick={() => setOptMode(!optMode)}
                         className={`px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg
                            ${optMode ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}
                         `}
                       >
                          {optMode ? '退出优化视图' : '启动 AI 优化预览'}
                       </button>
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">库存偏差指数</div>
                          <div className="text-2xl font-mono font-bold text-orange-400 leading-none mt-1">H-0.82 <span className="text-sm font-normal text-slate-600">Dev</span></div>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Target size={20} className="text-indigo-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前焦点对象 (Active Node)</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{activeItem.name}</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                          <RefreshCw size={14}/> 实时全域重算
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <InventoryOptScene 
                    items={INVENTORY_NODES} 
                    activeItemId={selectedId}
                    onItemSelect={setSelectedId}
                    optimizationMode={optMode}
                 />
              </div>

              {/* 装饰边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30"></div>
           </div>

           {/* 底部：周转率趋势图 (Performance Trend) */}
           <SciFiCard title="库存周转率演化 (ITO Evolution)" subtitle="PERFORMANCE_TREND" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TURNOVER_TREND}>
                       <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 4]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="rate" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorRate)" name="周转率指数" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：决策情报 (Decision Intel) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 补货策略建议" subtitle="REORDER_ENGINE">
              <div className="space-y-4">
                 <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <BrainCircuit size={16} className="text-indigo-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">动态再订货点 (ROP)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于预测消耗量，{activeItem.name} 的安全库存水位已调低 15%，建议将 ROP 设置为 <span className="text-white font-bold">14 UNIT</span>，可释放 ¥12.5k 现金流。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Zap size={60} className="text-indigo-500" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase">预期满足率</div>
                       <div className="text-lg font-bold text-white font-mono">99.8%</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500 uppercase">经济订货量 (EOQ)</div>
                       <div className="text-lg font-bold text-cyan-400 font-mono">245</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="库存健康深度画像" subtitle="HEALTH_SPECTRUM" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { label: '周转活跃度', val: 82, status: 'high' },
                      { label: '采购提前期合规', val: 95, status: 'good' },
                      { label: '库位空间利用率', val: 68, status: 'med' },
                      { label: '批次一致性', val: 92, status: 'good' },
                    ].map((metric, i) => (
                      <div key={i} className="flex flex-col gap-1">
                         <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>{metric.label}</span>
                            <span className="text-slate-300 font-mono">{metric.val}%</span>
                         </div>
                         <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${metric.val}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <ShieldCheck size={16} /> 下发库存调优指令
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 库房系统</div>
                    <div className="text-xs font-bold text-white">SAP_MM_CORE_V4</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </div>
  );
};