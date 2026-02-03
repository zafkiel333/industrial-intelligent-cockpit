import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  LineChart as LineIcon, 
  Target, 
  Cpu, 
  RotateCw, 
  History, 
  FileSearch,
  ChevronRight,
  Maximize2,
  Minimize2,
  Timer,
  Search,
  Filter,
  ArrowUpRight,
  // Fix: Added missing icons from lucide-react
  CheckCircle2,
  Fingerprint,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, Cell, LineChart, Line, Legend, ComposedChart, Bar,
  ReferenceLine,
  // Fix: Added missing BarChart from recharts
  BarChart
} from 'recharts';

// --- 模拟分析数据 ---

const MONTHLY_METRICS = [
  { month: '01', mtbf: 420, mttr: 12.5, target_mtbf: 450, target_mttr: 10 },
  { month: '02', mtbf: 480, mttr: 11.2, target_mtbf: 450, target_mttr: 10 },
  { month: '03', mtbf: 350, mttr: 15.8, target_mtbf: 450, target_mttr: 10 }, // 发生重大事故
  { month: '04', mtbf: 510, mttr: 9.5, target_mtbf: 500, target_mttr: 8 },
  { month: '05', mtbf: 540, mttr: 8.2, target_mtbf: 500, target_mttr: 8 },
  { month: '06', mtbf: 585, mttr: 6.8, target_mtbf: 500, target_mttr: 8 },
];

const ASSET_QUADRANT = [
  { name: '#1 发电机', mtbf: 620, mttr: 4.5, val: 80, type: 'Elite' },
  { name: '#4 压缩机', mtbf: 150, mttr: 14.5, val: 30, type: 'Critical' },
  { name: '冷却水泵 P1', mtbf: 480, mttr: 5.2, val: 60, type: 'Core' },
  { name: '液压站 B', mtbf: 320, mttr: 8.5, val: 50, type: 'Routine' },
  { name: '皮带机 C-04', mtbf: 280, mttr: 18.2, val: 20, type: 'Warning' },
];

const REPAIR_TIME_DIST = [
  { range: '0-2h', count: 45 },
  { range: '2-4h', count: 32 },
  { range: '4-8h', count: 18 },
  { range: '8-16h', count: 8 },
  { range: '16h+', count: 3 },
];

export const MtbfMttrAnalysisView: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState('#1 发电机');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：战略可靠性控制条 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-6 p-4 rounded-t-lg bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-cyan-400/50 relative group">
              <ShieldCheck size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Asset Reliability & Maintainability Analytics
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 资产可靠性 <span className="text-cyan-500 italic">MTBF/MTTR 趋势图谱</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均故障间隔 (MTBF)</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">585.2 <span className="text-sm font-normal text-slate-600">HRS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均修复耗时 (MTTR)</div>
              <div className="text-2xl font-mono font-bold text-orange-500">6.84 <span className="text-sm font-normal text-slate-600">HRS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">资产健康可用率</div>
              <div className="text-2xl font-mono font-bold text-green-400">98.8%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：可靠性多维清单 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="资产可靠性分位榜" subtitle="ASSET_RANKING" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col h-full">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="检索资产编号..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs text-slate-300 outline-none focus:border-cyan-500 transition-all"
                    />
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {ASSET_QUADRANT.map((asset, i) => (
                       <div 
                         key={i}
                         onClick={() => setActiveAsset(asset.name)}
                         className={`p-3 rounded border transition-all cursor-pointer relative group
                            ${activeAsset === asset.name 
                               ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-900/10' 
                               : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
                         `}
                       >
                          {activeAsset === asset.name && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                          <div className="flex justify-between items-start mb-2">
                             <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{asset.name}</div>
                             <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                                ${asset.type === 'Elite' ? 'bg-green-900/40 text-green-400' : 
                                  asset.type === 'Critical' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-500'}
                             `}>{asset.type}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                             <div className="bg-black/20 p-1.5 rounded">
                                <div className="text-slate-500">MTBF</div>
                                <div className="font-mono font-bold text-cyan-300">{asset.mtbf}h</div>
                             </div>
                             <div className="bg-black/20 p-1.5 rounded">
                                <div className="text-slate-500">MTTR</div>
                                <div className="font-mono font-bold text-orange-400">{asset.mttr}h</div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                       <FileSearch size={14} /> 查看完整技术档案
                    </button>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：MTBF/MTTR 演化趋势场 (核心可视化) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-slate-800 rounded overflow-hidden group p-6 flex flex-col shadow-[inset_0_0_100px_rgba(6,182,212,0.05)]">
              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050508_100%)]"></div>

              {/* HUD 界面叠加层 */}
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Evolutionary Reliability Field
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activeAsset} <span className="text-cyan-500 italic">性能对标图谱</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">综合维保效能</div>
                       <div className="text-3xl font-mono font-bold text-green-400 leading-none mt-1">+12.4<span className="text-sm font-normal text-slate-600">%</span></div>
                    </div>
                 </div>

                 {/* 复合趋势图表 */}
                 <div className="flex-1 w-full pointer-events-auto">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={MONTHLY_METRICS} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                          <defs>
                             <linearGradient id="colorMtbf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorMttr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: '时域月份 (Timeline)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }} />
                          <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'MTBF (Hours)', angle: -90, position: 'insideLeft', fill: '#0ea5e9', fontSize: 10 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'MTTR (Hours)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10 }} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #0891b2', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="diamond" />
                          
                          <Area yAxisId="left" type="monotone" dataKey="mtbf" name="故障间隔 (MTBF)" stroke="#0ea5e9" fill="url(#colorMtbf)" strokeWidth={3} />
                          <Line yAxisId="left" type="monotone" dataKey="target_mtbf" name="可靠性目标线" stroke="#334155" strokeDasharray="5 5" dot={false} />
                          
                          <Bar yAxisId="right" dataKey="mttr" name="维修耗时 (MTTR)" fill="url(#colorMttr)" radius={[4, 4, 0, 0]} barSize={20} />
                          <ReferenceLine yAxisId="right" y={8} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '维保红线', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="mt-6 flex justify-between items-end border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Timer size={24} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前周期利用率</div>
                             <div className="text-lg font-bold text-white font-mono">94.2% <span className="text-[10px] text-green-500">+1.2%</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Zap size={24} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">维保反应指数</div>
                             <div className="text-lg font-bold text-white font-mono">2.4m <span className="text-[10px] text-red-500">-5s</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                       <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-sm text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/30 hover:scale-105 active:scale-95 transition-all">AI 预测演化</button>
                    </div>
                 </div>
              </div>

              {/* 四角技术边框 */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30"></div>
           </div>

           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="资产效能四象限 (Strategy Matrix)" subtitle="PORTFOLIO_ANALYSIS" className="border-slate-800">
                 <div className="h-full w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" dataKey="mtbf" name="MTBF" unit="h" stroke="#64748b" fontSize={10} domain={[0, 800]} label={{ value: 'MTBF', position: 'insideBottomRight', offset: -10, fill: '#64748b', fontSize: 9 }} />
                          <YAxis type="number" dataKey="mttr" name="MTTR" unit="h" stroke="#64748b" fontSize={10} domain={[0, 20]} label={{ value: 'MTTR', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                          <ZAxis type="number" dataKey="val" range={[50, 400]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                          <Scatter name="Assets" data={ASSET_QUADRANT}>
                             {ASSET_QUADRANT.map((entry, index) => (
                               <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.type === 'Elite' ? '#10b981' : entry.type === 'Critical' ? '#ef4444' : '#0ea5e9'} 
                                  fillOpacity={0.8}
                                  stroke={entry.type === 'Critical' ? '#fff' : 'transparent'}
                                  strokeWidth={1}
                               />
                             ))}
                          </Scatter>
                          {/* 象限分割线 */}
                          <ReferenceLine x={400} stroke="#334155" strokeWidth={1} />
                          <ReferenceLine y={10} stroke="#334155" strokeWidth={1} />
                       </ScatterChart>
                    </ResponsiveContainer>
                    {/* 象限标注 */}
                    <div className="absolute top-2 right-2 text-[8px] text-slate-600 font-bold uppercase">高可靠/慢修 (Low Priority)</div>
                    <div className="absolute top-2 left-10 text-[8px] text-red-700 font-bold uppercase">低可靠/慢修 (Critical Risk)</div>
                    <div className="absolute bottom-6 right-2 text-[8px] text-green-700 font-bold uppercase">高可靠/快修 (Golden Asset)</div>
                    <div className="absolute bottom-6 left-10 text-[8px] text-slate-600 font-bold uppercase">低可靠/快修 (Operational)</div>
                 </div>
              </SciFiCard>
              
              <SciFiCard title="维修时长分布 (Histogram)" subtitle="DISTRIBUTION">
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       {/* Fix: Use BarChart from recharts */}
                       <BarChart data={REPAIR_TIME_DIST}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="range" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                          <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={25}>
                             {REPAIR_TIME_DIST.map((entry, index) => (
                               <Cell key={index} fill={index > 3 ? '#ef4444' : '#8b5cf6'} fillOpacity={0.8} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：决策情报与审计 (Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="AI 维保效能建议" subtitle="AI_ADVISORY">
              <div className="space-y-4">
                 <div className="p-4 bg-orange-950/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-3 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <AlertTriangle size={18} className="text-orange-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">可靠性衰减预警</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                       “分析显示 <span className="text-white font-bold">冷却水泵 P1</span> 的 MTBF 在近 3 个月内下降了 <span className="text-red-400">18.5%</span>。关联根因分析指向密封圈疲劳，建议将下次 P-M 计划提前 15 天。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
                       <Cpu size={80} className="text-orange-500" />
                    </div>
                 </div>

                 <div className="bg-slate-900/60 border border-slate-800 p-4 rounded">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">全厂 RCM 覆盖率</span>
                       <span className="text-xs text-cyan-400 font-bold">92.0%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                       <div className="h-full bg-cyan-500 w-[92%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数据真实性审计" subtitle="DATA_PROVENANCE" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                    {[
                      { label: 'PLC 运行日志同步', date: '04-01 10:00', status: 'verified', icon: <Cpu size={14}/> },
                      { label: '维保工单数据拉取', date: '03-28 14:30', status: 'verified', icon: <History size={14}/> },
                      { label: 'SCADA 实时流接入', date: '03-25 09:15', status: 'verified', icon: <Activity size={14}/> },
                    ].map((node, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-500 group-hover:border-cyan-500/50 transition-all">
                            {node.icon}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-200 truncate">{node.label}</div>
                            <div className="text-[9px] text-slate-500 font-mono uppercase">{node.date}</div>
                         </div>
                         {/* Fix: CheckCircle2 icon was missing from imports */}
                         <CheckCircle2 size={12} className="text-green-500" />
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <div className="bg-slate-950 p-3 rounded flex items-center justify-between border border-slate-800 cursor-pointer hover:border-cyan-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          {/* Fix: Fingerprint icon was missing from imports */}
                          <Fingerprint size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[10px] text-slate-500 uppercase">数据信度签名</div>
                             <div className="text-xs font-bold text-white">Trust_Hash_0x9221</div>
                          </div>
                       </div>
                       <ArrowUpRight size={14} className="text-slate-700" />
                    </div>
                    <button className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                       {/* Fix: FileText icon was missing from imports */}
                       <FileText size={16} /> 生成月度审计报告
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
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
        
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
