
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Search, 
  Filter, 
  ChevronRight, 
  Scale, 
  FileText,
  AlertTriangle,
  History,
  Cpu,
  RefreshCw,
  Wallet,
  Globe,
  ArrowUpRight,
  Target,
  Layers,
  ArrowDownCircle,
  FileCheck,
  Clock,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ComposedChart, Line, Legend,
  PieChart as RechartsPieChart, Pie
} from 'recharts';

// --- 模拟数据 ---

const BUDGET_DATA = [
  { name: '已执行', value: 4820000, color: '#6366f1' },
  { name: '承诺中', value: 1200000, color: '#a855f7' },
  { name: '剩余额度', value: 6380000, color: '#1e293b' },
];

const MONTHLY_BURN_RATE = [
  { month: '01', planned: 100, actual: 95 },
  { month: '02', planned: 100, actual: 110 },
  { month: '03', planned: 120, actual: 145 },
  { month: '04', planned: 120, actual: 105 },
  { month: '05', planned: 150, actual: 120 },
  { month: '06', planned: 150, actual: 155 },
];

const CATEGORY_LOAD = [
  { name: '机组大修', value: 85, fill: '#6366f1' },
  { name: '日常点检', value: 45, fill: '#0ea5e9' },
  { name: '备件采购', value: 92, fill: '#f59e0b' },
  { name: '应急抢修', value: 120, fill: '#ef4444' }, // 超支
];

const RECENT_LEDGER = [
  { id: 'TX-20240401', target: '变频器电容模组采购', cost: '¥14.5k', status: 'verified', time: '14:20' },
  { id: 'TX-20240402', target: '#2机组外协技术支持', cost: '¥8.2k', status: 'pending', time: '11:15' },
  { id: 'TX-20240403', target: '润滑系统密封件更换', cost: '¥2.1k', status: 'verified', time: '09:40' },
];

export const BudgetMonitorView: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：资金流量态势抬头 */}
      <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4 p-4 rounded-t-lg bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-indigo-400/50 relative group">
              <Wallet size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-indigo-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maintenance CapEx Control Terminal
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修预算 <span className="text-indigo-500 italic">实时执行监测</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex bg-slate-900/60 p-1.5 rounded-sm border border-slate-800">
              <button className="px-6 py-2 text-xs font-bold bg-indigo-600 text-white rounded-sm shadow-lg shadow-indigo-900/40">财务全景</button>
              <button className="px-6 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">部门细分</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：预算分配与热力分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="预算资金分布" subtitle="BUDGET_NODES" highlight className="flex-1">
              <div className="h-full flex flex-col relative">
                 <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RechartsPieChart>
                          <Pie
                            data={BUDGET_DATA}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveSegment(index)}
                            onMouseLeave={() => setActiveSegment(null)}
                          >
                             {BUDGET_DATA.map((entry, index) => (
                               <Cell key={index} fill={entry.color} stroke="none" fillOpacity={activeSegment === index ? 1 : 0.7} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] text-slate-500 uppercase font-bold">Execution</span>
                       <span className="text-2xl font-bold text-white">38.8%</span>
                    </div>
                 </div>

                 <div className="space-y-2 mt-4 px-2">
                    {BUDGET_DATA.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/50 rounded group hover:border-indigo-500/30 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-xs text-slate-400 font-bold uppercase">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-100">¥{(item.value/10000).toFixed(1)}w</span>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="分项支出预警" subtitle="CATEGORY_ALERT">
              <div className="space-y-4">
                 {CATEGORY_LOAD.map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>{cat.name}</span>
                          <span className={cat.value > 100 ? 'text-red-400' : 'text-slate-300'}>{cat.value}%</span>
                       </div>
                       <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                             className="h-full transition-all duration-1000 shadow-[0_0_8px_currentColor]" 
                             style={{ width: `${Math.min(100, cat.value)}%`, backgroundColor: cat.fill }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：资金脉冲与动态趋势图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-indigo-900/20 rounded overflow-hidden group p-6 flex flex-col shadow-[inset_0_0_100px_rgba(99,102,241,0.05)]">
              {/* 背景战术格线 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              
              {/* HUD 界面层 */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Zap size={14} className="animate-pulse" />
                          Budget Burning Dynamics
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          资金损耗 <span className="text-indigo-500 italic">矢量态势图</span>
                       </h2>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前财务水位</div>
                       <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-mono font-bold text-white tracking-tighter">¥ 6.38</span>
                          <span className="text-sm text-slate-500">M</span>
                       </div>
                    </div>
                 </div>

                 {/* 数据图表：月度计划 vs 实际 */}
                 <div className="flex-1 w-full min-h-[320px] pointer-events-auto">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={MONTHLY_BURN_RATE}>
                          <defs>
                             <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis hide domain={[0, 200]} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #4f46e5', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={3} fill="url(#colorActual)" name="实际支出" />
                          <Line type="stepAfter" dataKey="planned" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" dot={false} name="预算基准" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {/* 底部摘要操作条 */}
                 <div className="mt-8 grid grid-cols-4 gap-4 border-t border-slate-800 pt-6">
                    {[
                      { label: '预算偏离度', val: '+4.2%', icon: <TrendingUp size={16}/>, color: 'text-amber-500' },
                      { label: '资金占用率', val: '48.5%', icon: <Layers size={16}/>, color: 'text-indigo-400' },
                      { label: '平均结项周期', val: '12.4d', icon: <Clock size={16}/>, color: 'text-cyan-400' },
                      { label: '财务风险评分', val: '92.0', icon: <ShieldCheck size={16}/>, color: 'text-emerald-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1">
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                            {item.icon} {item.label}
                         </div>
                         <div className={`text-xl font-bold font-mono ${item.color}`}>{item.val}</div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 四角技术边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/20"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/20"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/20"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/20"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-48">
              <SciFiCard title="季度节约额度" subtitle="SAVING_METRICS">
                 <div className="h-full flex items-center gap-6 px-4">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                       <TrendingDown size={32} className="text-emerald-500" />
                       <div className="absolute -inset-2 border border-emerald-500/10 rounded-full animate-ping"></div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">累计节约估值</div>
                       <div className="text-3xl font-bold text-white font-mono leading-none mb-2">¥ 124,500</div>
                       <div className="text-[10px] text-green-500 flex items-center gap-1">
                          <CheckCircle2 size={10} /> 优化外协费支出成功
                       </div>
                    </div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="预测支出模型 (Next Q)" subtitle="AI_SIMULATION">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: '07', val: 120 }, { name: '08', val: 140 }, { name: '09', val: 180 }
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={25}>
                             {Array.from({length: 3}).map((_, i) => <Cell key={i} fillOpacity={0.4 + i*0.2} />)}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 风险推演与总账 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 成本风险穿透" subtitle="RISK_DETECTION">
              <div className="space-y-4">
                 <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                       <span className="text-xs font-bold text-red-200">超支熔断预警</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于 4 月备件损耗曲线，预测第 2 季度总支出将触及预算上限 <span className="text-white font-bold">115%</span>。建议立即暂缓非急需的‘工业清洗’服务合同。”
                    </p>
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                 </div>

                 <div className="bg-slate-900/60 border border-slate-800 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">预算安全余量</span>
                       <span className="text-xs text-amber-500 font-bold">Low</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[24%]"></div>
                    </div>
                    <div className="text-[9px] text-slate-600 mt-2 text-right font-mono">MARGIN: ¥ 1.24M</div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="实时交易总账" subtitle="LEDGER_STREAM" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {RECENT_LEDGER.map((tx, i) => (
                      <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded group hover:border-indigo-500/50 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-mono text-slate-500">{tx.id}</span>
                            <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{tx.cost}</span>
                         </div>
                         <div className="text-[11px] text-slate-300 truncate mb-2">{tx.target}</div>
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-[9px] text-slate-600">
                               <Clock size={10} /> {tx.time}
                            </div>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border
                               ${tx.status === 'verified' ? 'border-green-900/50 text-green-500 bg-green-950/20' : 'border-slate-700 text-slate-500'}
                            `}>{tx.status}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                       <FileText size={14} /> 导出财务合规报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Globe size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 结算系统</div>
                    <div className="text-xs font-bold text-white">SAP_FIN_SYNC_9022</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
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
