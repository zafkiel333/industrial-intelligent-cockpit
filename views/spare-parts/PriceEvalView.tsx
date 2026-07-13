
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { PriceThreeScene } from '../../components/spare_parts_price/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-price-eval]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-price-eval';
import { SupplierNode } from '../../components/spare_parts_price/three-types';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Gavel, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Calculator, 
  ArrowRightLeft, 
  History,
  PieChart as PieIcon,
  ShoppingBag,
  Zap,
  Globe,
  Award,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, CartesianGrid, Legend, PieChart, Pie
} from 'recharts';

// --- MOCK DATA ---

const PARTS_QUEUE = [
  { id: 'P-9921', name: '高压柱塞泵总成', targetPrice: 125000, urgency: 'High', status: 'Evaluating' },
  { id: 'P-8842', name: '精密伺服阀 (Rexroth)', targetPrice: 24000, urgency: 'Med', status: 'Pending' },
  { id: 'P-7731', name: '大型回转支承', targetPrice: 85000, urgency: 'High', status: 'Pending' },
  { id: 'P-6610', name: '工业控制器 PLC', targetPrice: 32000, urgency: 'Low', status: 'Optimized' },
];

const SUPPLIERS: SupplierNode[] = [
  { id: 'S1', name: '原厂 (OEM)', price: 135000, score: 95, isBest: false, deviation: 8 },
  { id: 'S2', name: '授权代理 A', price: 122000, score: 92, isBest: true, deviation: -2.4 },
  { id: 'S3', name: '通用件厂商 B', price: 98000, score: 75, isBest: false, deviation: -21.6 },
  { id: 'S4', name: '海外现货商 C', price: 155000, score: 88, isBest: false, deviation: 24 },
  { id: 'S5', name: '翻新件渠道 D', price: 65000, score: 60, isBest: false, deviation: -48 },
];

const COST_BREAKDOWN = [
  { name: '原材料', value: 45, color: '#eab308' },
  { name: '制造工艺', value: 25, color: '#0ea5e9' },
  { name: '品牌溢价', value: 15, color: '#8b5cf6' },
  { name: '物流关税', value: 10, color: '#64748b' },
  { name: '研发摊销', value: 5, color: '#10b981' },
];

const PRICE_TREND = [
  { month: 'Q1', market: 118000, our: 120000 },
  { month: 'Q2', market: 122000, our: 118000 },
  { month: 'Q3', market: 135000, our: 125000 },
  { month: 'Q4', market: 128000, our: 122000 },
  { month: 'Forecast', market: 132000, our: 124000 },
];

const RADAR_DATA = [
  { subject: '价格优势', A: 90, fullMark: 100 },
  { subject: '交货周期', A: 85, fullMark: 100 },
  { subject: '质量信誉', A: 95, fullMark: 100 },
  { subject: '售后服务', A: 88, fullMark: 100 },
  { subject: '付款账期', A: 80, fullMark: 100 },
];

export const PriceEvalView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState(PARTS_QUEUE[0].id);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>('S2');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const activePart = PARTS_QUEUE.find(p => p.id === selectedPartId) || PARTS_QUEUE[0];
  const activeSupplier = SUPPLIERS.find(s => s.id === selectedSupplierId) || SUPPLIERS[0];

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => setIsEvaluating(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：行情指数看板 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-amber-400/50 relative group">
              <Coins size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-amber-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Global Spare Parts Value Exchange
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 备件价格 <span className="text-amber-500 italic">智能评估与比价</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-800 flex gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">通用件指数</span>
                 <div className="text-sm font-bold text-green-400 flex items-center gap-1">1,042.5 <TrendingDown size={12}/></div>
              </div>
              <div className="w-[1px] h-8 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">关键件指数</span>
                 <div className="text-sm font-bold text-red-400 flex items-center gap-1">2,884.2 <TrendingUp size={12}/></div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">累计节约成本</div>
              <div className="text-2xl font-mono font-bold text-white">¥ 4.82 <span className="text-sm text-slate-600">M</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：评估队列 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="待评估备件队列" subtitle="QUEUE" highlight className="flex-1 border-amber-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="输入零件号或名称..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-amber-500" />
                 </div>
                 
                 {PARTS_QUEUE.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedPartId(part.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedPartId === part.id 
                            ? 'bg-amber-950/20 border-amber-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-amber-500 font-bold">{part.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.urgency === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                          `}>{part.urgency}</span>
                       </div>
                       <div className="text-xs font-bold text-white mb-2">{part.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>目标价: ¥{part.targetPrice.toLocaleString()}</span>
                          <span className="text-cyan-400">{part.status}</span>
                       </div>
                       {selectedPartId === part.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <Globe size={14} className="text-cyan-500" /> 市场行情快照
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">原材料 (钢)</div>
                    <div className="text-xs font-bold text-red-400">+4.2%</div>
                 </div>
                 <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                    <div className="text-[9px] text-slate-500">汇率波动</div>
                    <div className="text-xs font-bold text-green-400">-0.5%</div>
                 </div>
              </div>
              <div className="text-[9px] text-slate-500 leading-relaxed italic bg-slate-950/50 p-2 rounded">
                 * 受国际镍价上涨影响，进口轴承类备件预计下季度涨幅 5-8%。
              </div>
           </div>
        </div>

        {/* 中枢：3D 价值引力场 (The Price Galaxy) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#05020a] border border-amber-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Scale size={14} className="animate-pulse" />
                          VALUE GRAVITY FIELD
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          竞价 <span className="text-amber-500 italic">引力星系</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-amber-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">目标基准价 (Target)</div>
                       <div className="text-3xl font-mono font-bold text-emerald-400 leading-none mt-1">¥ {activePart.targetPrice.toLocaleString()}</div>
                    </div>
                 </div>

                 {/* 选中供应商浮窗 */}
                 {activeSupplier && (
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 w-64 pointer-events-auto">
                       <div className="bg-slate-900/90 border-l-4 border-amber-500 p-4 rounded backdrop-blur-md shadow-2xl animate-in slide-in-from-right-4 duration-300">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Selected Node</span>
                             {activeSupplier.isBest && <Award size={16} className="text-yellow-500" />}
                          </div>
                          <div className="text-lg font-bold text-white mb-1">{activeSupplier.name}</div>
                          <div className="text-2xl font-mono font-bold text-cyan-400 mb-3">¥ {activeSupplier.price.toLocaleString()}</div>
                          
                          <div className="space-y-2 text-xs">
                             <div className="flex justify-between">
                                <span className="text-slate-500">价格偏差</span>
                                <span className={`font-bold ${activeSupplier.deviation > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                   {activeSupplier.deviation > 0 ? '+' : ''}{activeSupplier.deviation}%
                                </span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-slate-500">综合评分</span>
                                <span className="text-white font-bold">{activeSupplier.score}</span>
                             </div>
                          </div>
                          
                          <button className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded uppercase tracking-widest transition-all">
                             查看详细报价单
                          </button>
                       </div>
                    </div>
                 )}

                 {/* 底部操作条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Gavel size={20} className="text-slate-400" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">参评供应商</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">{SUPPLIERS.length} Candidates</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button 
                         onClick={handleEvaluate}
                         disabled={isEvaluating}
                         className={`px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2
                            ${isEvaluating ? 'opacity-80 cursor-wait' : ''}
                         `}
                       >
                          {isEvaluating ? <RefreshCw className="animate-spin" size={14}/> : <Calculator size={14}/>}
                          {isEvaluating ? '正在演算模型...' : '启动全网比价'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <PriceThreeScene 
                    targetPrice={activePart.targetPrice}
                    suppliers={SUPPLIERS}
                    onSelect={setSelectedSupplierId}
                    isEvaluating={isEvaluating}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：价格趋势与预测 */}
           <SciFiCard title="历史价格趋势与预测 (Price Trend)" subtitle="FORECAST" className="h-56 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PRICE_TREND}>
                       <defs>
                          <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOur" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={['auto', 'auto']} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                       <Area type="monotone" dataKey="market" name="市场均价" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorMarket)" />
                       <Area type="monotone" dataKey="our" name="我司成交价" stroke="#f59e0b" strokeWidth={2} fill="url(#colorOur)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：成本拆解与决策 (Deep Dive) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 成本构成拆解" subtitle="COST_BREAKDOWN">
              <div className="h-44 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={COST_BREAKDOWN} 
                          cx="50%" cy="50%" 
                          innerRadius={40} 
                          outerRadius={55} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {COST_BREAKDOWN.map((entry, index) => (
                             <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="pr-4 space-y-1.5 flex-1">
                    {COST_BREAKDOWN.map(item => (
                      <div key={item.name} className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="truncate">{item.name}</span>
                         <span className="text-slate-200 ml-auto">{item.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 italic text-center">
                 "品牌溢价占比偏低，主要成本集中在原材料。"
              </div>
           </SciFiCard>

           <SciFiCard title="供应商综合雷达" subtitle="RADAR_SCORE">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 采购决策建议" subtitle="DECISION" className="flex-1 border-emerald-900/30 bg-emerald-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-emerald-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">最佳选择</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “综合考虑价格、交期与历史质量评分，<span className="text-white font-bold">{activeSupplier.name}</span> 为当前最优解。虽然价格略高于通用件，但预计使用寿命长 25%，全生命周期成本最低。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <CheckCircle2 size={60} className="text-emerald-500" />
                    </div>
                 </div>
                 
                 <div className="mt-auto flex gap-2">
                     <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 transition-all">
                        <ShoppingBag size={14} /> 生成采购单
                     </button>
                     <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700">
                        <ArrowRightLeft size={14} />
                     </button>
                 </div>
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
          background: rgba(245, 158, 11, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.6);
        }
      `}</style>
    </div>
  );
};
