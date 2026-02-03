
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ConveyorScene } from '../../components/conveying_system/ConveyorScene';
import { 
  Workflow, 
  Activity, 
  Settings, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Database, 
  BarChart3, 
  Timer, 
  AlertTriangle,
  RotateCw,
  Box,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  Globe,
  Waves,
  Wind,
  Maximize2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine
} from 'recharts';

const SYSTEM_ASSETS = [
  { id: 'BELT-MAIN-01', name: '主倾斜皮带 ST2500', health: 74, status: 'In-Service', age: '1.2 yr', load: 'Heavy' },
  { id: 'PULL-01', name: '驱动滚筒总成', health: 92, status: 'Stable', age: '0.8 yr', load: 'Nominal' },
  { id: 'MOTOR-09', name: 'ABB 驱动电机 (400kW)', health: 85, status: 'Optimal', age: '2.1 yr', load: 'High' },
];

const TENSION_SPECTRUM = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  tension: 120 + Math.sin(i * 0.5) * 15 + Math.random() * 5,
  limit: 150
}));

const IDLER_ACOUSTICS = [
  { group: 'G1', noise: 65, vib: 1.2 },
  { group: 'G2', noise: 82, vib: 4.5 }, // 异常点
  { group: 'G3', noise: 58, vib: 0.8 },
  { group: 'G4', noise: 62, vib: 1.1 },
];

export const ConveyingSystemPartsView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>('BELT-MAIN-01');
  const [speed, setSpeed] = useState(1.0);
  const [viewMode, setViewMode] = useState<'standard' | 'xray' | 'thermal'>('standard');

  const activeAsset = useMemo(() => 
    SYSTEM_ASSETS.find(a => a.id === activeId) || SYSTEM_ASSETS[0], 
  [activeId]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#020408] overflow-hidden p-2">
      
      {/* 顶部：核心战略看板 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 relative group">
              <Workflow size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Continuous Bulk Material Transport
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 输送系统 <span className="text-cyan-500 italic">全生命周期备件服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统可用性</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">99.85%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均无故障时长</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">4,250 <span className="text-sm font-normal text-slate-600">h</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">备件即时就绪率</div>
              <div className="text-2xl font-mono font-bold text-amber-500">94%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：资产物理画像 (Physical Profile) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-cyan-500" /> 线路核心组件</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {SYSTEM_ASSETS.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setActiveId(asset.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeId === asset.id 
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-cyan-500 mb-1 uppercase">{asset.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{asset.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${asset.health > 80 ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                        {asset.health > 80 ? <ShieldCheck size={16} className="text-emerald-400"/> : <AlertTriangle size={16} className="text-amber-400 animate-pulse"/>}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">健康评估</div>
                        <div className="text-lg font-mono font-bold text-white">{asset.health}%</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">服役时长</div>
                        <div className="text-xs text-slate-300 font-mono mt-1">{asset.age}</div>
                     </div>
                  </div>
                  
                  {activeId === asset.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="材料特征分析 (Fingerprint)" subtitle="SPECTROSCOPY" className="h-48 border-slate-800">
              <div className="flex gap-4 h-full items-center">
                 <div className="w-16 h-16 rounded border border-cyan-500/30 bg-cyan-900/10 flex items-center justify-center">
                    <Zap size={24} className="text-cyan-400" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase">硫化接头强度系数</div>
                    <div className="text-2xl font-mono font-bold text-white">0.94 <span className="text-xs text-green-400">NORMAL</span></div>
                    <p className="text-[9px] text-slate-400 leading-tight">基于 X 射线扫描，当前接头内部钢帘线无断裂或移位迹象。</p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中轴：3D 全息数字化视窗 (The Reactor) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020610] border border-cyan-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Sub-mm Precision Telemetry
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          输送走廊 <span className="text-cyan-500 italic">全息数字化室</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">带速 (Belt Speed)</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400 leading-none mt-1">{speed.toFixed(1)} <span className="text-sm font-normal text-slate-600">m/s</span></div>
                       </div>
                       <div className="flex gap-2">
                          {['standard', 'xray', 'thermal'].map(mode => (
                             <button 
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-4 py-1 text-[8px] font-bold uppercase rounded border transition-all 
                                  ${viewMode === mode ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-900/30' : 'bg-slate-900 border-slate-800 text-slate-500'}
                                `}
                             >
                                {mode}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 动态控制条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <RotateCw size={20} className="text-cyan-500 animate-spin-slow" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">驱动电流 (Current)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">142.5 <span className="text-xs text-slate-600">A</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">仿真置信度</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.2%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                          <Maximize2 size={18} className="text-cyan-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ConveyorScene 
                    parts={SYSTEM_ASSETS as any} 
                    activeId={activeId}
                    onSelect={setActiveId}
                    speed={speed}
                    viewMode={viewMode}
                 />
              </div>

              {/* 背景装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：波形与张力分析图 */}
           <SciFiCard title="皮带运行张力与稳定性分析" subtitle="DYNAMIC_TENSION" className="h-60 border-cyan-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={TENSION_SPECTRUM}>
                       <defs>
                          <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={3} />
                       <YAxis stroke="#475569" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '12px' }} />
                       <Area type="monotone" dataKey="tension" stroke="#0ea5e9" fill="url(#colorTension)" strokeWidth={2} name="实时张力 (kN)" />
                       <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'MAX_LIMIT', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Line type="monotone" dataKey="tension" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：声学诊断与备件调度 (Logistics & Insights) */}
        <div className="xl:col-span-3 flex flex-col gap-5 overflow-hidden pr-2">
           
           <SciFiCard title="托辊组声学健康矩阵" subtitle="ACOUSTIC_DIAG">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={IDLER_ACOUSTICS}>
                       <XAxis dataKey="group" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
                       <Bar dataKey="noise" radius={[2, 2, 0, 0]} barSize={14}>
                          {IDLER_ACOUSTICS.map((entry, index) => (
                             <Cell key={index} fill={entry.noise > 80 ? '#ef4444' : '#0ea5e9'} />
                          ))}
                       </Bar>
                       <Bar dataKey="vib" fill="#334155" radius={[2, 2, 0, 0]} barSize={6} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2">
                 "G2 组托辊异常尖锐噪声识别，匹配：轴承磨损，建议更换。"
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="LOGISTICS_STREAM" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden">
                       <div className="flex items-center gap-2">
                          <Truck size={16} className="text-blue-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase">重型皮带在途 (SGP)</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal">
                          批次: <span className="text-white font-bold">PO-9921-X</span><br/>
                          预计抵港: <span className="text-cyan-400 font-mono">2024-04-12 14:00</span>
                       </p>
                       <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                          <Globe size={60} className="text-blue-500" />
                       </div>
                    </div>
                    
                    {[
                      { item: '托辊组 C2', loc: '华北前置仓', eta: 'Tomorrow', status: 'Ready' },
                      { item: '清扫器刀片', loc: '徐州制造中心', eta: '3 Days', status: 'Process' },
                    ].map((ship, i) => (
                       <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all flex justify-between items-center">
                          <div>
                             <div className="text-[11px] font-bold text-slate-200">{ship.item}</div>
                             <div className="text-[9px] text-slate-500 uppercase">{ship.loc}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs font-mono font-bold text-cyan-400">{ship.eta}</div>
                             <div className="text-[8px] text-slate-600 uppercase font-bold">{ship.status}</div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-4">
                    <div className="p-3 bg-cyan-950/20 border-l-4 border-cyan-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Zap size={16} className="text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 补货指令</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “检测到当前由于环境湿度升高，主斜井皮带的摩擦力修正系数偏移。建议增加 <span className="text-white font-bold">高性能橡胶清洁器</span> 备件等级。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-cyan-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出系统健康审计报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">输送设备标准档案</div>
                    <div className="text-xs font-bold text-white">CONV_STD_V5.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.6); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}} />
    </div>
  );
};
