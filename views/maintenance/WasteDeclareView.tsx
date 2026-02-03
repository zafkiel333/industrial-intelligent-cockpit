
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Recycle, 
  Trash2, 
  Leaf, 
  ShieldCheck, 
  ArrowRightLeft, 
  TrendingUp, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertTriangle,
  Zap,
  Activity,
  History,
  Scale,
  Coins,
  Database,
  Globe,
  FlaskConical,
  Truck,
  // Added missing imports to fix the reported errors
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';

// --- 模拟废弃物数据 ---

const WASTE_CATEGORIES = [
  { name: '危险废物 (油液/电池)', value: 35, color: '#10b981' },
  { name: '金属碎屑 (钢/铜)', value: 45, color: '#0ea5e9' },
  { name: '电子废弃物 (PCB)', value: 15, color: '#8b5cf6' },
  { name: '其他', value: 5, color: '#475569' },
];

const RECENT_DECLARATIONS = [
  { id: 'WST-772401', target: '#4机组更换润滑油', weight: '120kg', type: '危废', status: 'In-Transit', time: '10:24' },
  { id: 'WST-772405', target: '主变压器报废铜缆', weight: '450kg', type: '可回收', status: 'Stored', time: '09:15' },
  { id: 'WST-772409', target: '控制系统损毁板卡', weight: '12kg', type: '电废', status: 'Pending', time: '昨日' },
];

const CIRCULAR_VALUE_TREND = [
  { month: '01', revenue: 12000, carbonSaved: 450 },
  { month: '02', revenue: 15000, carbonSaved: 520 },
  { month: '03', revenue: 18000, carbonSaved: 680 },
  { month: '04', revenue: 14000, carbonSaved: 490 },
  { month: '05', revenue: 22000, carbonSaved: 850 },
  { month: '06', revenue: 26000, carbonSaved: 920 },
];

// --- 物质循环拓扑图 (SVG) ---
const FlowTopology = () => (
  <div className="relative w-full h-full bg-[#050508] rounded overflow-hidden group">
    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
    
    <svg className="w-full h-full" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="ecoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="ecoGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 核心节点：工厂/产出端 */}
      <g transform="translate(100, 200)">
        <rect x="-40" y="-40" width="80" height="80" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" />
        <rect x="-30" y="-30" width="60" height="60" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="2" />
        <Database size={24} x="-12" y="-12" className="text-emerald-500" />
        <text y="55" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">产出端 (Source)</text>
      </g>

      {/* 分离节点 */}
      <g transform="translate(300, 200)">
        <circle r="50" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" className="animate-[spin_20s_linear_infinite]" />
        <circle r="40" fill="#0ea5e9" fillOpacity="0.05" stroke="#0ea5e9" strokeWidth="2" />
        <Activity size={24} x="-12" y="-12" className="text-sky-500" />
        <text y="65" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="bold">智能分类 (Logic)</text>
      </g>

      {/* 回收节点 */}
      <g transform="translate(500, 100)">
        <circle r="30" fill="#8b5cf6" fillOpacity="0.1" stroke="#8b5cf6" strokeWidth="2" />
        <Recycle size={20} x="-10" y="-10" className="text-purple-500" />
        <text x="45" y="5" fill="#8b5cf6" fontSize="10" fontWeight="bold">再制造 (Renew)</text>
      </g>

      {/* 处理节点 */}
      <g transform="translate(500, 300)">
        <circle r="30" fill="#f43f5e" fillOpacity="0.1" stroke="#f43f5e" strokeWidth="2" />
        <ShieldCheck size={20} x="-10" y="-10" className="text-rose-500" />
        <text x="45" y="5" fill="#rose-500" fontSize="10" fontWeight="bold">无害化 (Safety)</text>
      </g>

      {/* 路径线条 */}
      <path d="M140,200 L260,200" stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
      <path d="M340,180 Q400,100 470,100" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
      <path d="M340,220 Q400,300 470,300" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
      
      {/* 动态粒子动画 */}
      <circle r="3" fill="#fff" filter="url(#ecoGlow)">
        <animateMotion path="M140,200 L260,200" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle r="3" fill="#0ea5e9" filter="url(#ecoGlow)">
        <animateMotion path="M340,180 Q400,100 470,100" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>

    {/* 底部浮层 */}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
      <div className="bg-emerald-900/40 border border-emerald-500/30 p-2 rounded backdrop-blur-sm">
        <div className="text-[10px] text-emerald-400 font-bold uppercase">实时循环通量</div>
        <div className="text-lg font-mono font-bold text-white">4.28 <span className="text-xs">t/h</span></div>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2 text-[9px] text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 可持续流向正常</div>
        <div className="flex items-center gap-2 text-[9px] text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> AI分类逻辑已锁定</div>
      </div>
    </div>
  </div>
);

export const WasteDeclareView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(RECENT_DECLARATIONS[0].id);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：生态审计抬头 */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-400/50 relative group">
              <Recycle size={36} className="text-white group-hover:rotate-180 transition-transform duration-1000" />
              <div className="absolute -inset-2 border border-emerald-500/10 rounded animate-[pulse_3s_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Industrial Waste Lifecycle Control
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修废弃物 <span className="text-emerald-500 italic">处置申报记录</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">本年减碳贡献</div>
              <div className="text-2xl font-mono font-bold text-green-400">142.5 <span className="text-xs text-slate-600 font-normal">tCO2e</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">合规审计评分</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">98.2</div>
           </div>
           <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-sm text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2">
              <Zap size={14} /> 发起新申报
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：申报流水 (Declaration Stream) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-2"><History size={14} className="text-emerald-500" /> 近期申报流水</span>
              <button className="hover:text-emerald-400 transition-colors"><Filter size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {RECENT_DECLARATIONS.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === item.id 
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">{item.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                       ${item.type === '危废' ? 'bg-rose-900/30 text-rose-400' : 'bg-emerald-900/30 text-emerald-400'}
                    `}>{item.type}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{item.target}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <div className="flex items-center gap-1"><Scale size={10} /> {item.weight}</div>
                    <span className="flex items-center gap-1"><Clock size={10} /> {item.time}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <Truck size={10} className={item.status === 'In-Transit' ? 'text-sky-400 animate-pulse' : 'text-slate-600'} />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{item.status}</span>
                     </div>
                     <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500 transition-transform" />
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="处理商响应态势" subtitle="VENDOR_SLA">
              <div className="space-y-4">
                 {[
                   { label: '危废中心 (P1)', val: 99.2, color: 'bg-emerald-500' },
                   { label: '再生资源厂', val: 88.5, color: 'bg-sky-500' },
                 ].map((item, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                          <span>{item.label}</span>
                          <span className="text-slate-200">{item.val}%</span>
                       </div>
                       <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：物质循环全息拓扑 (Circular Field) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative border border-emerald-900/20 rounded overflow-hidden">
              <FlowTopology />
              
              {/* HUD 信息层 */}
              <div className="absolute top-8 left-8 pointer-events-none">
                 <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs mb-1 uppercase tracking-widest">
                    <Leaf size={14} className="animate-bounce" />
                    Circular Economy Engine Active
                 </div>
                 <h2 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                    物质循环 <span className="text-emerald-500 italic">动态拓扑场</span>
                 </h2>
              </div>
           </div>

           {/* 底部：环境与财务双重评估图 */}
           <SciFiCard title="环境贡献与价值回收趋势" subtitle="ROI_&_CARBON" className="h-56">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={CIRCULAR_VALUE_TREND}>
                       <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" hide />
                       <YAxis yAxisId="right" orientation="right" hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f051a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#0ea5e9" strokeWidth={2} name="回收收益 (¥)" />
                       <Line yAxisId="right" type="monotone" dataKey="carbonSaved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="二氧化碳减排 (kg)" />
                       <Legend verticalAlign="top" height={36} iconType="diamond" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：分类分析与 AI 建议 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="废弃物成分解剖" subtitle="WASTE_MATRIX">
              <div className="h-44 w-full flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={WASTE_CATEGORIES} 
                          cx="50%" cy="50%" 
                          innerRadius={40} 
                          outerRadius={55} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {WASTE_CATEGORIES.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="pr-4 space-y-1.5 flex-1">
                    {WASTE_CATEGORIES.map(item => (
                      <div key={item.name} className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="truncate">{item.name.split(' (')[0]}</span>
                         <span className="text-slate-200 ml-auto">{item.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 循环处理建议" subtitle="AI_ADVISORY" className="flex-1 border-emerald-900/30 bg-emerald-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-emerald-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">价值回收机遇</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “检测到申报单 <span className="text-emerald-400 font-bold">WST-772405</span> 中的铜缆纯度极高，建议不要进入碎料流程。AI 匹配到下游‘精密拉丝厂’可溢价 <span className="text-white font-bold">12%</span> 进行定向回收。”
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-emerald-500" /> 合规合规状态审计
                    </div>
                    {[
                      { label: '五联单电子化', status: 'done' },
                      { label: '危废转移联单审批', status: 'doing' },
                      { label: '最终处置证明获取', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                         <span className={`text-[11px] ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-emerald-500" /> : 
                          step.status === 'doing' ? <RefreshCw size={12} className="text-cyan-500 animate-spin" /> : 
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Globe size={14} /> 全链条溯源报告
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Globe size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联环境局同步系统</div>
                    <div className="text-xs font-bold text-white">ENV_API_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
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
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
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
