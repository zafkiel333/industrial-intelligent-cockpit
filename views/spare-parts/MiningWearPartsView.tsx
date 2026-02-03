
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { WearPartScene } from '../../components/mining_wear/WearPartScene';
import { 
  ShieldAlert, 
  Activity, 
  Zap, 
  Settings, 
  History, 
  Database, 
  Truck, 
  Box, 
  Search,
  Hammer,
  Microscope,
  RotateCw,
  TrendingUp,
  FileText,
  AlertTriangle,
  Scale,
  Atom,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  // Fix: Added missing Maximize2 import
  Maximize2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, LineChart, Line, Legend,
  // Fix: Added missing ComposedChart and ReferenceLine imports
  ComposedChart,
  ReferenceLine
} from 'recharts';

const MATERIAL_GENOME = [
  { element: 'Mn (锰)', val: 18.5, target: 18.0, unit: '%' },
  { element: 'C (碳)', val: 1.25, target: 1.15, unit: '%' },
  { element: 'Cr (铬)', val: 2.1, target: 2.0, unit: '%' },
  { element: 'Mo (钼)', val: 0.45, target: 0.5, unit: '%' },
];

const WEAR_RUL_DATA = Array.from({length: 30}, (_, i) => ({
  tonnage: i * 1000,
  wear: 5 + i * 1.2 + (i > 20 ? i * 0.5 : 0), // 后期磨损加速
  limit: 45
}));

const ROCK_HARDNESS_IMPACT = [
  { subject: '高硬度岩 (f14)', A: 95, fullMark: 100 },
  { subject: '中硬度岩 (f8)', A: 60, fullMark: 100 },
  { subject: '软性物料 (f4)', A: 25, fullMark: 100 },
];

export const MiningWearPartsView: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedZone, setSelectedZone] = useState('底部冲击区');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020408] overflow-hidden p-2">
      
      {/* 顶部：战略耐磨看板 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-stone-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-amber-400/50 relative group overflow-hidden">
              <Hammer size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-amber-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Mining Wear Asset Strategic Control
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿山耐磨件 <span className="text-amber-500 italic">精益保障中心</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键件就绪率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均更换时耗</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">4.5 <span className="text-sm font-normal text-slate-600 uppercase">h</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">单位吨耗成本</div>
              <div className="text-2xl font-mono font-bold text-amber-400">¥ 1.42</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：材质基因与岩层分析 (Material & Geology) */}
        <div className="xl:col-span-3 flex flex-col gap-5 overflow-hidden">
           <SciFiCard title="耐磨材质基因图谱" subtitle="METALLURGY_GENOME" highlight className="border-amber-900/30">
              <div className="space-y-4 py-2">
                 {MATERIAL_GENOME.map((item, i) => (
                    <div key={i} className="group cursor-default">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-300 group-hover:text-amber-400 transition-colors">{item.element}</span>
                          <span className="text-[10px] font-mono text-slate-500">Target: {item.target}%</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" style={{ width: `${(item.val / 20) * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">{item.val}{item.unit}</span>
                       </div>
                    </div>
                 ))}
                 <div className="pt-4 mt-2 border-t border-slate-800 flex items-center gap-3">
                    <Microscope size={20} className="text-amber-500" />
                    <p className="text-[10px] text-slate-500 leading-tight">
                       系统检测到 Mn/C 比例略高于标准值。该批次衬板在 <span className="text-white">高冲击负荷</span> 下具备更优的加工硬化层稳定性。
                    </p>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="工况对磨损影响度" subtitle="IMPACT_MATRIX" className="flex-1">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ROCK_HARDNESS_IMPACT}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="磨损速率" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 磨损扫描与厚度遥测 (The Core) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050505] border border-amber-900/20 rounded-2xl overflow-hidden group">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Holographic Attrition Scanner
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          衬板磨损 <span className="text-amber-500 italic">全息扫描室</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-amber-500/30 p-3 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">当前选定区域</div>
                          <div className="text-xl font-bold text-white mt-1">{selectedZone}</div>
                       </div>
                       <button 
                        onClick={() => setIsAnalyzing(!isAnalyzing)}
                        className={`px-6 py-2 rounded-full font-bold text-xs border transition-all ${isAnalyzing ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                          {isAnalyzing ? '正在实时扫描...' : '启动深度探测'}
                       </button>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Target size={20} className="text-amber-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">残余厚度 (Thickness)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">42.5 <span className="text-[10px] text-slate-600">mm</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Scanning Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.8%</div>
                       </div>
                       <button className="w-10 h-10 rounded bg-amber-600/20 flex items-center justify-center border border-amber-500/30">
                          {/* Fix: Maximize2 is now imported */}
                          <Maximize2 size={18} className="text-amber-400" />
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <WearPartScene 
                    activePartId={null}
                    scanProgress={0.5}
                    isAnalyzing={isAnalyzing}
                    onNodeClick={(id) => setSelectedZone(id === 'Z1' ? '底部冲击区' : '中部挤压区')}
                    thicknessData={[]}
                 />
              </div>

              {/* 背景装饰氛围 */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#020408_100%)] opacity-80"></div>
           </div>

           {/* 底部：磨损退化趋势 (RUL Analysis) */}
           <SciFiCard title="处理吨位与磨损量关联演化" subtitle="LIFECYCLE_ANALYTICS" className="h-60 border-amber-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    {/* Fix: ComposedChart and ReferenceLine are now imported */}
                    <ComposedChart data={WEAR_RUL_DATA}>
                       <defs>
                          <linearGradient id="colorWearM" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="tonnage" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: '累计吨位 (T)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="wear" stroke="#f59e0b" fill="url(#colorWearM)" strokeWidth={2} name="磨损量 (mm)" />
                       <Line type="monotone" dataKey="wear" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                       <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '极限报废厚度', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：备件物流与供应链韧性 (Supply & Resilience) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="供应链韧性追踪" subtitle="LOGISTICS_STREAM">
              <div className="space-y-4">
                 <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Truck size={16} className="text-amber-500 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">在途备件实时追踪</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “订单 <span className="text-white font-bold">PO-9221-A</span> (动锥衬板) 已由徐州制造厂发出，预计 48h 后抵达矿区 1 号中转库。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                       <Zap size={80} className="text-amber-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Database size={12} className="text-cyan-500" /> 区域储备分布 (Warehouse)
                    </div>
                    {[
                      { label: '矿区现地库', status: 'critical', val: '1 套' },
                      { label: '省域中心库', status: 'normal', val: '4 套' },
                      { label: '原厂直供库', status: 'normal', val: '12 套' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-amber-500/30 transition-all">
                         <span className="text-[11px] text-slate-300">{step.label}</span>
                         <span className={`font-mono text-[10px] font-bold ${step.status === 'critical' ? 'text-red-400' : 'text-green-400'}`}>{step.val}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="更换成本优化 (TCO)" subtitle="COST_EVAL" className="flex-1 overflow-hidden border-slate-800 bg-slate-950/20">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: '直接采购', val: 100 },
                         { name: '再制造', val: 42 },
                         { name: '预测维护', val: 78 },
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0c0a09', border: 'none'}} />
                          <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={25}>
                             <Cell fill="#334155" />
                             <Cell fill="#10b981" />
                             <Cell fill="#f59e0b" />
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <p className="text-[10px] text-slate-500 leading-relaxed text-center italic">
                    “通过 AI 预测更换周期，可避免平均 12.5 小时的非计划停机，折合避损价值 <span className="text-white font-bold">¥ 450,000</span>。”
                 </p>
                 <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 生成月度耐磨分析白皮书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联磨损特征库</div>
                    <div className="text-xs font-bold text-white">WEAR_PATTERN_V4.dat</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }
        @keyframes scan {
          0% { transform: translateY(-300px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}} />
    </div>
  );
};
