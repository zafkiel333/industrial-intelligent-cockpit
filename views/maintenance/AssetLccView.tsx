import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Wallet, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  History, 
  BarChart3, 
  PieChart as PieIcon, 
  Zap, 
  Maximize2, 
  Settings, 
  ClipboardList,
  Cpu,
  RefreshCw,
  Scale,
  Calendar,
  AlertCircle,
  Tag,
  Gauge,
  Briefcase,
  TrendingUp,
  Coins,
  // Fix: Added missing FileText import from lucide-react
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, ComposedChart, Line, Legend
} from 'recharts';

// --- 模拟数据 ---

const COST_COMPOSITION = [
  { name: '购置成本', value: 450000, color: '#94a3b8' },
  { name: '运行能耗', value: 125000, color: '#f59e0b' },
  { name: '预防维保', value: 85000, color: '#10b981' },
  { name: '故障维修', value: 65000, color: '#ef4444' },
  { name: '停机损失', value: 110000, color: '#8b5cf6' },
];

const LIFECYCLE_TIMELINE = [
  { year: '2020', cumulative: 450000, incremental: 450000, health: 100 },
  { year: '2021', cumulative: 495000, incremental: 45000, health: 98 },
  { year: '2022', cumulative: 560000, incremental: 65000, health: 92 },
  { year: '2023', cumulative: 685000, incremental: 125000, health: 85 },
  { year: '2024(Q1)', cumulative: 750000, incremental: 65000, health: 78 },
];

const MAINTENANCE_ROI = [
  { month: '01', maintenance: 1200, uptime: 99 },
  { month: '02', maintenance: 800, uptime: 98 },
  { month: '03', maintenance: 4500, uptime: 99.5 },
  { month: '04', maintenance: 1500, uptime: 97 },
  { month: '05', maintenance: 2200, uptime: 98.5 },
];

export const AssetLccView: React.FC = () => {
  const [selectedAsset] = useState('EQ-VSI-7724');

  const totalCost = useMemo(() => COST_COMPOSITION.reduce((acc, curr) => acc + curr.value, 0), []);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：资产身份与全周期摘要 */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-amber-950/10 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-stone-800 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)] border border-amber-400/50 relative group">
              <Briefcase size={36} className="text-white group-hover:rotate-12 transition-transform" />
              <div className="absolute -inset-2 border border-amber-500/10 rounded animate-pulse"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Total Cost of Ownership Analysis
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 设备全生命周期 <span className="text-amber-500 italic">成本全息卡片</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">累计持有成本 (TCO)</div>
              <div className="text-2xl font-mono font-bold text-white">¥ 750,240</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">单位小时成本</div>
              <div className="text-2xl font-mono font-bold text-amber-400">¥ 42.5 <span className="text-xs">/H</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前市场估值</div>
              <div className="text-2xl font-mono font-bold text-green-400">¥ 185,000</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：成本基因图谱 (Breakdown) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="成本基因分解" subtitle="COST_DNA" highlight className="border-amber-500/20">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={COST_COMPOSITION} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {COST_COMPOSITION.map((entry, index) => (
                             <Cell key={index} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '12px'}} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 uppercase">TCO Index</span>
                    <span className="text-lg font-bold text-white">100%</span>
                 </div>
              </div>

              <div className="space-y-2 mt-4">
                 {COST_COMPOSITION.map(item => (
                   <div key={item.name} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 group hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                         <span className="text-xs text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-100">¥{(item.value/1000).toFixed(0)}k</span>
                   </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="资产静态参数" subtitle="SPECIFICATIONS">
              <div className="space-y-3">
                 {[
                   { label: '设备编码', val: 'EQ-VSI-7724', icon: <Tag size={12}/> },
                   { label: '投产日期', val: '2020-05-12', icon: <Calendar size={12}/> },
                   { label: '设计寿命', val: '12 Years', icon: <History size={12}/> },
                   { label: '制造厂商', val: '德国美卓重工', icon: <Settings size={12}/> },
                 ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] border-b border-slate-800 pb-2">
                       <span className="text-slate-500 flex items-center gap-2">{item.icon} {item.label}</span>
                       <span className="text-slate-200 font-mono">{item.val}</span>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：财务时空轨迹 (Accumulation & Health) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-amber-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 叠加层 */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-end mb-8">
                    <div>
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Temporal Expenditure Track
                       </div>
                       <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
                          成本累积 <span className="text-amber-500 italic">时空演化场</span>
                       </h2>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">财务合规性签名</div>
                       <div className="text-xs font-mono text-amber-400 opacity-60">0x7724...9022_VERIFIED</div>
                    </div>
                 </div>

                 {/* 数据图表：累积成本与健康度 */}
                 <div className="flex-1 w-full min-h-[300px] pointer-events-auto">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={LIFECYCLE_TIMELINE}>
                          <defs>
                             <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="year" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" hide />
                          <YAxis yAxisId="right" orientation="right" hide />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #d97706', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area yAxisId="left" type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={3} fill="url(#colorCost)" name="累积总成本" />
                          <Line yAxisId="right" type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} dot={{r: 4}} name="设备健康指数" />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>

                 {/* 底部摘要操作条 */}
                 <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4">
                          <div className="p-2 bg-amber-900/30 rounded-full"><TrendingUp size={20} className="text-amber-400" /></div>
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">预测剩余价值</div>
                             <div className="text-sm font-bold text-white font-mono">¥ 24,500 <span className="text-[10px] text-slate-600 font-normal">Est. 2028</span></div>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3 pointer-events-auto">
                       <button className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all flex items-center gap-2">
                          <RefreshCw size={14}/> 重新评估残值
                       </button>
                    </div>
                 </div>
              </div>

              {/* 四角边框装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/20"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/20"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/20"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/20"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-48">
              <SciFiCard title="维护回报率 (ROI)" subtitle="EFFICIENCY_MODEL">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={MAINTENANCE_ROI}>
                          <XAxis dataKey="month" hide />
                          <YAxis hide domain={[90, 100]} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                          <Area type="step" dataKey="uptime" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="可用性 %" />
                       </AreaChart>
                    </ResponsiveContainer>
                    <div className="text-[10px] text-slate-500 text-center mt-2 italic">“当前维护投入与可用性产出比处于 A 级最优区间”</div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="关键节点财务审计" subtitle="AUDIT_TRAIL">
                 <div className="space-y-2 overflow-y-auto max-h-32 pr-2 custom-scrollbar">
                    {[
                      { date: '2023.11', event: '主轴承预防性更换', cost: '¥42k' },
                      { date: '2022.05', event: '电机固件升级(减耗)', cost: '¥8.5k' },
                      { date: '2020.05', event: '原始购置入账', cost: '¥450k' },
                    ].map((log, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px] p-1.5 bg-slate-900 border border-slate-800 rounded">
                          <span className="text-slate-500 font-mono">{log.date}</span>
                          <span className="text-slate-200 font-bold truncate mx-2">{log.event}</span>
                          <span className="text-amber-500 font-bold">{log.cost}</span>
                       </div>
                    ))}
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 报废与折旧决策 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-1">
           
           <SciFiCard title="AI 报废决策建议" subtitle="REPLACEMENT_MODEL">
              <div className="space-y-4">
                 <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-amber-400" />
                       <span className="text-xs font-bold text-white uppercase">决策推荐: 维持运行</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于 LCC 深度学习模型，该设备目前处于 <span className="text-green-400">稳定运维期</span>。预计在 <span className="text-white font-bold">2026年Q3</span> 进入‘故障高发期’。当前建议：继续执行 P-M 计划，无需申请更替预算。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <ShieldCheck size={60} className="text-amber-500" />
                    </div>
                 </div>
                 
                 <div className="bg-slate-900/60 border border-slate-800 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">经济寿命剩余</span>
                       <span className="text-xs text-amber-500 font-bold">64%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[64%]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="折旧走势分析" subtitle="DEPRECIATION" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: '购置', val: 100 },
                         { name: '现值', val: 42 },
                         { name: '残值', val: 5 },
                       ]}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Bar dataKey="val" barSize={25} radius={[4, 4, 0, 0]}>
                             <Cell fill="#334155" />
                             <Cell fill="#f59e0b" />
                             <Cell fill="#1e293b" />
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                       <span>累计计提折旧</span>
                       <span className="text-slate-200 font-bold">¥ 265,000</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                       <span>平均年运维成本</span>
                       <span className="text-slate-200 font-bold">¥ 48,000</span>
                    </div>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                       <Coins size={14} /> 生成资产财务报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联全周期日志</div>
                    <div className="text-xs font-bold text-white">Full_Lifecycle_Log.dat</div>
                 </div>
              </div>
              <button className="text-amber-500 hover:text-white transition-colors">
                 <Maximize2 size={16} />
              </button>
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
      `}</style>
    </div>
  );
};