import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Package, 
  ShoppingCart, 
  Search, 
  Scan, 
  Cpu, 
  Database, 
  Truck, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Layers,
  History,
  Info,
  ChevronRight,
  Zap,
  Fingerprint
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

// --- 模拟备件库数据 ---
const SPARE_PARTS_LIBRARY = [
  { id: 'SP-1022', name: 'SKF 高负载轴承', spec: '22320-E1-K', stock: 12, price: 1250, weight: 1.2, zone: 'A-02-14', category: '轴承', match: 98 },
  { id: 'SP-3044', name: '耐高温密封圈', spec: 'Viton-75A', stock: 45, price: 85, weight: 0.1, zone: 'B-04-02', category: '密封', match: 100 },
  { id: 'SP-7781', name: '主电机冷却风扇', spec: 'CF-700-X', stock: 2, price: 3400, weight: 8.5, zone: 'C-01-05', category: '风控', match: 95 },
  { id: 'SP-2210', name: '力矩传感器支架', spec: 'AL-6061', stock: 8, price: 450, weight: 0.5, zone: 'A-05-11', category: '结构', match: 100 },
];

const STOCK_HEATMAP = [
  { name: '1号库', value: 85, color: '#0ea5e9' },
  { name: '2号库', value: 12, color: '#f59e0b' },
  { name: '3号库', value: 45, color: '#8b5cf6' },
  { name: '4号库', value: 30, color: '#10b981' },
];

export const PartsCartView: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (part: any) => {
    setCart(prev => {
      const existing = prev.find(item => item && item.id === part.id);
      if (existing) {
        return prev.map(item => (item && item.id === part.id) ? { ...item, count: (item.count || 0) + 1 } : item);
      }
      return [...prev, { ...part, count: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item && item.id !== id));
  };

  const updateCount = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      (item && item.id === id) ? { ...item, count: Math.max(1, (item.count || 0) + delta) } : item
    ));
  };

  // --- 统计计算 (Added Safety Checks) ---
  const totals = useMemo(() => {
    if (!Array.isArray(cart)) return { price: 0, weight: 0, items: 0 };
    
    return cart.reduce((acc, curr) => {
      // CRITICAL FIX: Skip undefined/null items to prevent crash
      if (!curr) return acc;
      
      const count = curr.count || 0;
      const price = curr.price || 0;
      const weight = curr.weight || 0;
      
      return {
        price: acc.price + (price * count),
        weight: acc.weight + (weight * count),
        items: acc.items + count
      };
    }, { price: 0, weight: 0, items: 0 });
  }, [cart]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-200 animate-in fade-in duration-700">
      
      {/* 顶部标题与快速搜索 */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-cyan-600 rounded flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <ShoppingCart size={32} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Logistics & Parts Requisition
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 现场备件 <span className="text-cyan-500 italic">战术配给终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="搜索备件名称、型号或库位..." 
                className="bg-slate-900 border border-slate-700 rounded-sm py-2.5 pl-10 pr-4 text-sm w-80 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-2.5 bg-slate-800 border border-slate-700 rounded hover:border-cyan-500 transition-colors">
              <Scan size={20} className="text-cyan-400" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：备件目录与智能推荐 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                 <Database size={14} className="text-cyan-500" /> 可选备件目录
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Total: 142</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {SPARE_PARTS_LIBRARY.map(part => (
                <div 
                  key={part.id}
                  className="bg-slate-900/60 border border-slate-800 p-3 rounded group hover:border-cyan-500/50 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-slate-500">{part.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                       ${part.stock < 5 ? 'bg-amber-900/30 text-amber-500' : 'bg-cyan-900/30 text-cyan-400'}
                    `}>库存: {part.stock}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors mb-1">{part.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mb-3">{part.spec}</div>
                  
                  <div className="flex justify-between items-end">
                     <div className="space-y-1">
                        <div className="text-[10px] text-slate-600 flex items-center gap-1"><MapPin size={8}/> {part.zone}</div>
                        <div className="text-xs font-bold text-slate-300">¥{part.price.toLocaleString()}</div>
                     </div>
                     <button 
                       onClick={() => addToCart(part)}
                       className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-all transform active:scale-90"
                     >
                        <Plus size={14} />
                     </button>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="AI 适配性建议" subtitle="MATCHING_CORE" className="bg-cyan-950/10">
              <div className="space-y-3">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-900/30 rounded"><Cpu size={16} className="text-cyan-400" /></div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                       检测到工单任务为“轴承更换”，建议同步申领<span className="text-white font-bold">航空级润滑油脂</span>。
                    </div>
                 </div>
                 <button className="w-full py-1.5 border border-dashed border-cyan-800 text-[10px] text-cyan-500 rounded uppercase hover:bg-cyan-900/20 transition-all">
                    一键配齐检修包
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：数字化购物车清单 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <SciFiCard title="当前申领配给清单" subtitle="PROVISION_CART" highlight className="flex-1 overflow-hidden" noPadding>
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {cart.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center opacity-30">
                          <ShoppingCart size={80} strokeWidth={1} />
                          <div className="mt-4 uppercase tracking-[0.4em] font-bold">购物车内暂无物资</div>
                       </div>
                    ) : (
                       <div className="space-y-2">
                          {cart.map(item => {
                             if (!item) return null; // Safety check in render
                             return (
                               <div key={item.id} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded flex items-center gap-6 group hover:border-cyan-500/30 transition-all">
                                  <div className="w-12 h-12 bg-slate-900 rounded border border-slate-800 flex items-center justify-center text-cyan-700">
                                     <Package size={24} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                                        <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{item.category}</span>
                                     </div>
                                     <div className="flex gap-4 text-[10px] text-slate-500">
                                        <span className="font-mono">Spec: {item.spec}</span>
                                        <span>Weight: {item.weight}kg</span>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center bg-slate-900 rounded border border-slate-800 overflow-hidden">
                                        <button onClick={() => updateCount(item.id, -1)} className="p-2 hover:bg-slate-800 transition-colors"><Minus size={12}/></button>
                                        <span className="px-3 font-mono font-bold text-white text-sm">{item.count || 1}</span>
                                        <button onClick={() => updateCount(item.id, 1)} className="p-2 hover:bg-slate-800 transition-colors"><Plus size={12}/></button>
                                     </div>
                                     <div className="w-24 text-right">
                                        <div className="text-sm font-mono font-bold text-white">¥{(item.price * (item.count || 1)).toLocaleString()}</div>
                                        <div className="text-[9px] text-slate-600">{(item.weight * (item.count || 1)).toFixed(2)} kg</div>
                                     </div>
                                     <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                    )}
                 </div>

                 {/* 底部摘要操作条 */}
                 <div className="bg-slate-900/80 border-t border-slate-800 p-6">
                    <div className="flex justify-between items-end mb-6">
                       <div className="flex gap-8">
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">申领物资总重</div>
                             <div className="text-2xl font-bold text-white font-mono">{totals.weight.toFixed(2)} <span className="text-xs text-slate-600">KG</span></div>
                          </div>
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">预计消耗成本</div>
                             <div className="text-2xl font-bold text-cyan-400 font-mono">¥{totals.price.toLocaleString()}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">物资清单项</div>
                          <div className="text-2xl font-bold text-white font-mono">{totals.items}</div>
                       </div>
                    </div>

                    <button 
                      disabled={cart.length === 0}
                      className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold tracking-[0.4em] rounded-sm shadow-xl shadow-cyan-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 uppercase"
                    >
                       <Fingerprint size={20} />
                       确 认 申 领 并 签 名
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 右侧：库存分析与物流预测 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="库房库存热力" subtitle="STOCK_DISTRIBUTION">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={STOCK_HEATMAP}>
                       <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={20}>
                          {STOCK_HEATMAP.map((entry, index) => (
                             <Cell key={index} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">平均补货期</div>
                    <div className="text-sm font-bold text-white">4.2d</div>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">物流负载率</div>
                    <div className="text-sm font-bold text-emerald-400">Low</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="预算占用模拟" subtitle="BUDGET_IMPACT" className="flex-1">
              <div className="space-y-6 h-full flex flex-col justify-center">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] text-slate-500 uppercase font-bold">年度维修预算剩余</span>
                       <span className="text-xs text-slate-200 font-mono">¥1.24M / ¥2.5M</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                       <div className="h-full bg-cyan-500 w-[50%]"></div>
                       <div className="h-full bg-slate-700 w-[50%]"></div>
                    </div>
                 </div>

                 <div className="p-3 bg-red-900/10 border border-red-900/20 rounded flex items-center gap-4">
                    <TrendingUp className="text-red-500" size={24} />
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold">支出波动预警</div>
                       <div className="text-sm font-bold text-red-200">当前申领占单次预算 12%</div>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">物流派送时序预测</div>
                    {[
                      { step: '订单处理', time: '15m', done: true },
                      { step: '拣货复核', time: '45m', done: false },
                      { step: '配送抵达', time: '1.5h', done: false },
                    ].map((step, i) => (
                       <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${step.done ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                             <span className={`text-xs ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>{step.step}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-600">{step.time}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">库房即时通讯</span>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-3">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=ware" className="w-8 h-8 rounded bg-slate-800" alt="avatar" />
                 <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-sm italic">
                    “1号库目前有2名技师正在作业，您的申请将在核准后立即处理。”
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};