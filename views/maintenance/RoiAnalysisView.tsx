
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Coins, 
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
  ArrowUpRight,
  Target,
  Layers,
  ArrowDownCircle,
  BarChart3,
  BarChart4,
  PieChart as PieIcon,
  ShieldCheck,
  Gem,
  GitCompare,
  LineChart as LineIcon,
  Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ComposedChart, Line, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 模拟业务数据 ---

const COST_VS_BENEFIT = [
  { month: '01', cost: 120, benefit: 180, roi: 1.5 },
  { month: '02', cost: 150, benefit: 260, roi: 1.73 },
  { month: '03', cost: 90, benefit: 195, roi: 2.16 },
  { month: '04', cost: 210, benefit: 480, roi: 2.28 },
  { month: '05', cost: 130, benefit: 310, roi: 2.38 },
  { month: '06', cost: 160, benefit: 420, roi: 2.62 },
];

const INVESTMENT_BREAKDOWN = [
  { name: '人力资源', value: 45, color: '#a855f7' },
  { name: '精密备件', value: 30, color: '#8b5cf6' },
  { name: '外部服务', value: 15, color: '#6366f1' },
  { name: '数字化工具', value: 10, color: '#0ea5e9' },
];

const ASSET_ROI_RANK = [
  { name: '#1 发电机组', roi: 4.2, cost: '¥85k', value: '¥357k', trend: 'up' },
  { name: '#4 压缩机', roi: 3.8, cost: '¥42k', value: '¥160k', trend: 'up' },
  { name: '循环水系统', roi: 2.5, cost: '¥28k', value: '¥70k', trend: 'down' },
  { name: '主变压器', roi: 1.9, cost: '¥120k', value: '¥228k', trend: 'stable' },
];

const ROI_RADAR = [
  { subject: '直接成本', A: 85, fullMark: 100 },
  { subject: '停机损失避免', A: 95, fullMark: 100 },
  { subject: '能源消耗优化', A: 78, fullMark: 100 },
  { subject: '设备寿命延长', A: 92, fullMark: 100 },
  { subject: '安全风险降低', A: 100, fullMark: 100 },
];

export const RoiAnalysisView: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战略价值看板 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-purple-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-purple-400/50 relative group">
              <Gem size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-purple-500/20 rounded animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maintenance ROI Strategic Analysis
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 维修投入产出比 <span className="text-purple-500 italic">效能分析中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           {/* 动态背景流光 */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-full bg-purple-500/10 skew-x-12 animate-[move_4s_linear_infinite]"></div>
           </div>
           
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">年度平均 ROI</div>
              <div className="text-2xl font-mono font-bold text-white">2.42 <span className="text-xs text-purple-400 font-bold ml-1">x</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 relative z-10"></div>
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">累计价值创造</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">¥ 4.28 <span className="text-xs text-slate-600 font-normal">M</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 relative z-10"></div>
           <div className="text-center relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">效能健康度评分</div>
              <div className="text-2xl font-mono font-bold text-indigo-400">92.8</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：资源投入矢量 (Investment) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="维修投入矢量分解" subtitle="INVESTMENT_DNA" highlight className="flex-1">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ROI_RADAR}>
                          <PolarGrid stroke="#1e1b4b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar 
                             name="能力指数" 
                             dataKey="A" 
                             stroke="#a855f7" 
                             strokeWidth={2} 
                             fill="#a855f7" 
                             fillOpacity={0.2} 
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 space-y-3">
                    {INVESTMENT_BREAKDOWN.map((item, i) => (
                      <div key={i} className="flex flex-col gap-1">
                         <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                            <span>{item.name}</span>
                            <span>{item.value}%</span>
                         </div>
                         <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div 
                               className="h-full transition-all duration-1000" 
                               style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            ></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="单位产出维修成本" subtitle="UNIT_COST">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-purple-900/20 rounded border border-purple-500/30">
                    <Coins size={24} className="text-purple-400" />
                 </div>
                 <div>
                    <div className="text-3xl font-mono font-bold text-white tracking-tighter">¥ 1.42</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">每单位产出成本 (CPV)</div>
                 </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px]">
                 <span className="text-green-500 font-bold flex items-center gap-1"><TrendingDown size={12}/> 较去年下降 8.4%</span>
                 <span className="text-slate-600 italic">Target: ¥1.35</span>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：价值增长协同场 (Main Dashboard) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-purple-900/20 rounded overflow-hidden group p-6 flex flex-col">
              {/* 背景战术格线与光斑 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>

              {/* HUD 界面叠加层 */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Value Realization Matrix
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          投入收益 <span className="text-purple-500 italic">协同演化图</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-purple-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ROI 增长率 (YoY)</div>
                       <div className="text-3xl font-mono font-bold text-emerald-400 leading-none mt-1">+12.4%</div>
                    </div>
                 </div>

                 {/* 数据图表：复合趋势图 */}
                 <div className="flex-1 w-full min-h-[300px] pointer-events-auto">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={COST_VS_BENEFIT}>
                          <defs>
                             <linearGradient id="colorCostROI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorBenefitROI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #7e22ce', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Area yAxisId="left" type="monotone" dataKey="cost" name="维修投入 (¥k)" stroke="#ef4444" fill="url(#colorCostROI)" strokeWidth={2} />
                          <Area yAxisId="left" type="monotone" dataKey="benefit" name="避损收益 (¥k)" stroke="#10b981" fill="url(#colorBenefitROI)" strokeWidth={2} />
                          <Line yAxisId="right" type="step" dataKey="roi" name="ROI 指数" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
                          <Legend verticalAlign="top" height={36} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>

                 {/* 底部摘要区 */}
                 <div className="mt-8 grid grid-cols-4 gap-4 border-t border-slate-800 pt-6">
                    {[
                      { label: '故障成本规避', val: '¥1.24M', icon: <ShieldCheck size={16}/>, color: 'text-emerald-400' },
                      { label: '寿命延长增值', val: '¥845k', icon: <History size={16}/>, color: 'text-blue-400' },
                      { label: '能耗优化结余', val: '¥320k', icon: <Zap size={16}/>, color: 'text-amber-400' },
                      { label: '维护资源闲置', val: '4.2%', icon: <TrendingDown size={16}/>, color: 'text-red-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1 group cursor-help">
                         <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2 group-hover:text-purple-400 transition-colors">
                            {item.icon} {item.label}
                         </div>
                         <div className={`text-xl font-bold font-mono ${item.color}`}>{item.val}</div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 四角战术装饰 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-500/20"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/20"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/20"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-500/20"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="资产价值贡献排行" subtitle="ASSET_EFFICIENCY" noPadding>
                 <div className="h-full flex flex-col p-4">
                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                       {ASSET_ROI_RANK.map((asset, i) => (
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-950/50 border border-slate-800 rounded group hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:text-purple-400">
                                  0{i+1}
                               </div>
                               <div>
                                  <div className="text-xs font-bold text-white">{asset.name}</div>
                                  <div className="text-[9px] text-slate-500">投入: {asset.cost} / 避损: {asset.value}</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-sm font-bold text-emerald-400 font-mono">ROI {asset.roi}x</div>
                               <div className={`text-[8px] uppercase font-bold ${asset.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                  {asset.trend === 'up' ? '↑ Increasing' : asset.trend === 'down' ? '↓ Decreasing' : '→ Stable'}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="AI 产出预测模拟" subtitle="PROJECTION_V2">
                 <div className="h-full flex flex-col">
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                             <XAxis type="number" dataKey="x" hide />
                             <YAxis type="number" dataKey="y" hide />
                             <ZAxis type="number" dataKey="z" range={[50, 400]} />
                             <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                             <Scatter name="ROI Nodes" data={[
                               { x: 10, y: 30, z: 200, name: 'Q1' },
                               { x: 40, y: 50, z: 300, name: 'Q2' },
                               { x: 60, y: 80, z: 450, name: 'Q3' },
                               { x: 80, y: 95, z: 600, name: 'Q4 Predicted' },
                             ]} fill="#a855f7" />
                          </ScatterChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="bg-purple-950/20 p-2 rounded border border-purple-500/30 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-purple-400" />
                          <span className="text-[10px] text-slate-400">Q4 预测增长</span>
                       </div>
                       <span className="text-sm font-bold text-white">+18.5%</span>
                    </div>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：AI 决策与投入建议 (Decision Support) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 效能优化建议" subtitle="STRATEGIC_PATH">
              <div className="space-y-4">
                 <div className="p-4 bg-purple-950/20 border-l-4 border-purple-500 rounded-r flex flex-col gap-3 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={18} className="text-purple-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase">重分配提醒</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                       “分析显示 <span className="text-white font-bold">#2 提升机</span> 的预防性维护投入边际收益正在下降。建议将 15% 的该项预算转移至 <span className="text-purple-400 font-bold">数字化预测性监测</span> 升级，预计可将整体 ROI 提升 0.4 个基点。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                       <GitCompare size={80} className="text-purple-500" />
                    </div>
                 </div>

                 <div className="bg-slate-900/60 border border-slate-800 p-4 rounded">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">预算利用效能</span>
                       <span className="text-xs text-emerald-400 font-bold">Excellent</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                       <div className="h-full bg-purple-500 w-[72%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                       <div className="h-full bg-indigo-500 w-[18%]"></div>
                       <div className="h-full bg-slate-700 w-[10%]"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-600 mt-2 font-mono">
                       <span>VALUE-ADDED: 72%</span>
                       <span>ADMIN: 10%</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="节约潜力热力分布" subtitle="SAVING_ENGINE" className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                 <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: '委外替代', val: 85 },
                         { name: '备件再制造', val: 62 },
                         { name: '流程自动化', val: 45 },
                         { name: '故障预警', val: 92 },
                       ]} layout="vertical" margin={{ left: -20 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0c0a09', border: 'none'}} />
                          <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={12}>
                             {Array.from({length: 4}).map((_, i) => (
                               <Cell key={i} fill={i % 2 === 0 ? '#a855f7' : '#6366f1'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-900/20 rounded-full border border-emerald-500/30">
                          <Activity size={16} className="text-emerald-400" />
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">月度避损峰值</div>
                          <div className="text-lg font-bold text-white font-mono">¥ 124,500 <ArrowUpRight size={14} className="inline text-emerald-400" /></div>
                       </div>
                    </div>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 flex items-center justify-center gap-2 transition-all">
                       <FileText size={14} /> 生成投资回报详细审计
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Globe size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联资产财务台账</div>
                    <div className="text-xs font-bold text-white">SAP_FIN_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
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
          background: rgba(168, 85, 247, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
        
        @keyframes move {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(500%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};
