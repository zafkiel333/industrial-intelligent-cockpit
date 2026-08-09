
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { CrusherScene } from '../../components/crushing_screening/CrusherScene';
import { WearPartNode } from '../../components/crushing_screening/three-types';
import { 
  Hammer, 
  Activity, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Package, 
  Maximize2, 
  Layers, 
  ChevronRight, 
  Database,
  ArrowRightCircle,
  Truck,
  History,
  Timer,
  Factory,
  // Fix: Added missing RotateCw, Globe, and FileText imports
  RotateCw,
  Globe,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';

// --- 模拟业务数据 ---
const MOCK_PARTS: WearPartNode[] = [
  { id: 'M-001', name: '动锥衬板 (Mantle)', type: 'mantle', lifeLeft: 0.42, hardnessFactor: 8.5, position: [0, 1.5, 0] },
  { id: 'L-002', name: '定锥衬板 (Bowl Liner)', type: 'bowl_liner', lifeLeft: 0.65, hardnessFactor: 8.5, position: [0, 2.5, 0] },
  { id: 'S-003', name: '高频振动筛网', type: 'mesh', lifeLeft: 0.15, hardnessFactor: 4.2, position: [5, -2, 0] },
];

const WEAR_CURVE = [
  { day: '04-01', wear: 0.05, hardness: 8.2 },
  { day: '04-05', wear: 0.12, hardness: 8.4 },
  { day: '04-10', wear: 0.25, hardness: 9.1 }, // 硬度提升，磨损加速
  { day: '04-15', wear: 0.45, hardness: 8.8 },
  { day: '04-20', wear: 0.68, hardness: 8.5 },
  { day: '04-25', wear: 0.85, hardness: 8.6 },
];

const SIEVE_ANALYSIS = [
  { size: '0-5mm', percentage: 15, target: 12 },
  { size: '5-10mm', percentage: 28, target: 30 },
  { size: '10-20mm', percentage: 42, target: 45 },
  { size: '20-40mm', percentage: 15, target: 13 },
];

export const CrushingScreeningPartsView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('M-001');
  const [isOperating, setIsOperating] = useState(true);
  const [crushSpeed, setCrushSpeed] = useState(1.5);

  const activePart = useMemo(() => 
    MOCK_PARTS.find(p => p.id === selectedId) || MOCK_PARTS[0], 
  [selectedId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#020408] overflow-hidden">
      
      {/* 顶部：战略资源看板 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-stone-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-amber-400/50 relative group">
              <Hammer size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-amber-500/20 rounded-sm animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Aggregate Processing Asset Assurance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 破碎与筛分设备 <span className="text-amber-500 italic">备件健康中枢</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均剩余寿命 (RUL)</div>
              <div className="text-2xl font-mono font-bold text-amber-400">248 <span className="text-sm font-normal text-slate-600">HRS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">高频筛分合规率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">98.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">备件即时就绪度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">92%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：组件资产矩阵 (Asset Matrix) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-amber-500" /> 在役关键耐磨件</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Maximize2 size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {MOCK_PARTS.map(part => (
                <div 
                  key={part.id}
                  onClick={() => setSelectedId(part.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedId === part.id 
                      ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-amber-500 mb-1">{part.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{part.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${part.lifeLeft > 0.3 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        {part.lifeLeft > 0.3 ? <ShieldCheck size={16} className="text-emerald-400"/> : <AlertTriangle size={16} className="text-red-400 animate-pulse"/>}
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                        <span>当前磨损深度 (Depth)</span>
                        <span className={part.lifeLeft < 0.2 ? 'text-red-400' : 'text-slate-300'}>{(1 - part.lifeLeft).toFixed(2)} mm</span>
                     </div>
                     <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${part.lifeLeft < 0.2 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${(1 - part.lifeLeft) * 100}%` }}></div>
                     </div>
                  </div>
                  
                  {selectedId === part.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="物料硬度相关系数" subtitle="ROCK_HARDNESS" className="h-44 border-slate-800">
              <div className="flex items-center gap-4 h-full">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center">
                    <Layers size={24} className="text-amber-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">当前物料 f 值</div>
                    <div className="text-3xl font-mono font-bold text-white">8.5 <span className="text-xs text-slate-600">Pro</span></div>
                    <p className="text-[9px] text-slate-600 leading-tight mt-1">
                       花岗岩高磨蚀工况。衬板消耗率较基准模型提升 14.5%。
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：全息数字化孪生 (Digital Twin Chamber) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-amber-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Subsurface Stress Mapping: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          设备数字化 <span className="text-amber-500 italic">全息解体室</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-amber-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">主轴偏心转速</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">{(crushSpeed * 200).toFixed(0)} <span className="text-sm font-normal text-slate-600 uppercase">rpm</span></div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setIsOperating(!isOperating)} className={`px-4 py-1 rounded text-[10px] font-bold uppercase ${isOperating ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {isOperating ? '停止模拟' : '启动模拟'}
                         </button>
                         <button className="px-4 py-1 bg-slate-800 border border-slate-700 text-white rounded text-[10px] font-bold uppercase hover:bg-slate-700 transition-all">
                            切换爆炸视图
                         </button>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Zap size={20} className="text-amber-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">瞬时破碎功耗 (P)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">315 <span className="text-xs text-slate-600">kW</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Real-time Simulation Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.8%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-amber-600/20 flex items-center justify-center">
                          {/* Fix: Added RotateCw to imports */}
                          <RotateCw size={18} className="text-amber-500" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <CrusherScene 
                    parts={MOCK_PARTS} 
                    activePartId={selectedId}
                    onPartSelect={setSelectedId}
                    isOperating={isOperating}
                    crushSpeed={crushSpeed}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：磨损退化分析与预测 */}
           <SciFiCard title="衬板磨损演化与硬度关联曲线" subtitle="DEGRADATION_ANALYSIS" className="h-60 border-amber-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={WEAR_CURVE}>
                       <defs>
                          <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" stroke="#64748b" fontSize={10} hide />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area yAxisId="left" type="monotone" dataKey="wear" stroke="#f59e0b" fill="url(#colorWear)" strokeWidth={2} name="磨损率 (%)" />
                       <Line yAxisId="right" type="monotone" dataKey="hardness" stroke="#0ea5e9" strokeWidth={2} dot={false} name="物料硬度 (f)" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：产出品位与智能供应 (Supply & Quality) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="成品粒径分布 (Sieve Analysis)" subtitle="OUTPUT_QUALITY">
              <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SIEVE_ANALYSIS} margin={{ left: -30 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="size" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Bar dataKey="percentage" name="当前比例" radius={[2, 2, 0, 0]} barSize={12}>
                          {SIEVE_ANALYSIS.map((entry, index) => (
                             <Cell key={index} fill={Math.abs(entry.percentage - entry.target) > 5 ? '#ef4444' : '#0ea5e9'} />
                          ))}
                       </Bar>
                       <Bar dataKey="target" name="目标比例" fill="#334155" radius={[2, 2, 0, 0]} barSize={6} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2">
                 "10-20mm 骨料比例偏离 3.2%，建议校准排矿口 (CSS) 参数。"
              </div>
           </SciFiCard>

           <SciFiCard title="智能采购与物流" subtitle="SUPPLY_TRACKING" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                       <Truck size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white">备件运输中 (In-Transit)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                       订单: <span className="text-white font-bold">PO-99212</span> - 重型动锥衬板<br/>
                       预计抵达: <span className="text-cyan-400">明日 14:00</span>
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       {/* Fix: Added Globe to imports */}
                       <Globe size={60} className="text-blue-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                       <Timer size={12} className="text-amber-500" /> 预测更换窗口
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                       <span className="text-xs text-slate-300">预计最佳停机时间</span>
                       <span className="text-xs font-bold text-white font-mono">04-28 09:00</span>
                    </div>
                 </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                 <ArrowRightCircle size={16} /> 提交快速申领申请
              </button>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3">
                 {/* Fix: Added FileText to imports */}
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">磨损生命周期证书</div>
                    <div className="text-xs font-bold text-white">WEAR_CERT_V4.pdf</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
    </div>
  );
};
