
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydraulicScene } from '../../components/mine_hydraulic/HydraulicScene';
import { HydraulicPartNode } from '../../components/mine_hydraulic/three-types';
import { 
  Activity, 
  Zap, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  Clock, 
  Truck, 
  Box, 
  ChevronRight, 
  Search,
  Settings,
  Flame,
  FileText,
  RotateCw,
  Cpu,
  RefreshCw,
  Binary,
  // Fix: Added missing imports for Gauge, Maximize2, and Globe to resolve errors at lines 200, 214, and 297
  Gauge,
  Maximize2,
  Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine,
  // Fix: Added missing imports for RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, and Radar to resolve errors at lines 266-278
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// --- 模拟工程数据 ---
const HYDRAULIC_ASSETS: HydraulicPartNode[] = [
  { id: 'PUMP-01', name: '柱塞变量泵 (Main Pump)', type: 'pump', health: 92, pressure: 31.5, temperature: 45, position: [0, 1, 0] },
  { id: 'ACC-01', name: '隔膜式蓄能器 A', type: 'accumulator', health: 88, pressure: 24.5, temperature: 38, position: [-2.5, 2.5, -2] },
  { id: 'ACC-02', name: '隔膜式蓄能器 B', type: 'accumulator', health: 42, pressure: 21.0, temperature: 52, position: [-2.5, 2.5, 0] },
  { id: 'VALVE-MAIN', name: '多路换向阀组', type: 'valve', health: 96, pressure: 31.2, temperature: 40, position: [0, 1.5, 2] },
];

const PRESSURE_WAVEFORM = Array.from({length: 40}, (_, i) => ({
  time: i,
  raw: 31.5 + Math.sin(i * 0.8) * 1.2 + (Math.random() - 0.5) * 0.5,
  limit: 35.0
}));

const OIL_NAS_LOG = [
  { day: '04-01', nas: 6, water: 45 },
  { day: '04-05', nas: 7, water: 52 },
  { day: '04-10', nas: 6, water: 48 },
  { day: '04-15', nas: 9, water: 120 }, // 污染预警
  { day: '04-20', nas: 7, water: 65 },
];

export const MineHydraulicPartsView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>('PUMP-01');
  const [isPumping, setIsPumping] = useState(true);
  const [simIntensity, setSimIntensity] = useState(1.0);

  const activePart = useMemo(() => 
    HYDRAULIC_ASSETS.find(p => p.id === activeId) || HYDRAULIC_ASSETS[0], 
  [activeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：战略资源指挥台 (Strategic Command) */}
      <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border-2 border-blue-400/50 relative group">
              <Droplets size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-blue-500/20 rounded-sm animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Underground Hydraulic Support Assurance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿用液压系统 <span className="text-blue-500 italic">备件全周期服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统可用性</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">99.4%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均无故障时长</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">2,850 <span className="text-sm font-normal text-slate-600 uppercase">h</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">关键件就绪度</div>
              <div className="text-2xl font-mono font-bold text-amber-500">92%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：组件神经丛 (Component Pulse) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-blue-500" /> 核心在役组件</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {HYDRAULIC_ASSETS.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setActiveId(asset.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeId === asset.id 
                      ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-blue-500 mb-1 uppercase">{asset.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{asset.name}</h3>
                     </div>
                     <div className={`p-2 rounded bg-slate-800 border ${asset.health > 70 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        {asset.health > 70 ? <ShieldCheck size={16} className="text-emerald-400"/> : <AlertTriangle size={16} className="text-red-400 animate-pulse"/>}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">运行压力</div>
                        <div className="text-lg font-mono font-bold text-white">{asset.pressure} <span className="text-[10px] text-slate-600">MPa</span></div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">健康评估</div>
                        <div className={`text-lg font-mono font-bold ${asset.health < 50 ? 'text-red-400' : 'text-slate-300'}`}>{asset.health}%</div>
                     </div>
                  </div>
                  
                  {activeId === asset.id && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 shadow-[0_0_10px_#0ea5e9]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="油质 NAS 趋势" subtitle="FLUID_GENOME" className="h-48 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={OIL_NAS_LOG}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 15]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Line type="monotone" dataKey="nas" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} name="NAS等级" />
                       <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '警示', fill: 'red', fontSize: 10, position: 'right' }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：全息数字化泵站 (The Matrix Chamber) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050810] border border-blue-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          High-Pressure Pulse Mapping: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          泵站数字化 <span className="text-blue-500 italic">全息解体室</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-blue-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">仿真压力载荷</div>
                          <div className="text-3xl font-mono font-bold text-cyan-400">{(simIntensity * 31.5).toFixed(1)} <span className="text-sm font-normal text-slate-600 uppercase">MPa</span></div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setIsPumping(!isPumping)} className={`px-6 py-1.5 rounded-full font-bold text-[10px] uppercase border transition-all ${isPumping ? 'bg-red-900/40 border-red-500 text-red-400' : 'bg-green-900/40 border-green-500 text-green-400'}`}>
                            {isPumping ? '中止动态仿真' : '启动流体仿真'}
                         </button>
                         <button className="p-1.5 bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-white"><RotateCw size={14}/></button>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Gauge size={20} className="text-blue-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">即时体积效率 (Vol. Eff)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">94.2% <span className="text-green-500 text-[10px]">Optimal</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3 group cursor-pointer hover:border-blue-500/30 transition-all">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Digital Twin Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.8%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                          <Maximize2 size={18} className="text-blue-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <HydraulicScene 
                    parts={HYDRAULIC_ASSETS} 
                    activeId={activeId}
                    onSelect={setActiveId}
                    isPumping={isPumping}
                    pressureFluctuation={simIntensity}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：压力脉冲分析 (Pressure Transient) */}
           <SciFiCard title="高压输出脉冲波形分析" subtitle="TRANSIENT_DYNAMICS" className="h-60 border-blue-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={PRESSURE_WAVEFORM}>
                       <defs>
                          <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#475569" fontSize={10} domain={[25, 40]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="raw" stroke="#0ea5e9" fill="url(#colorPress)" strokeWidth={2} name="实时压力 (MPa)" />
                       <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '爆破阈值', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Line type="monotone" dataKey="raw" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：智能决策与物流 (Supply & Decision) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="多维风险评估雷达" subtitle="VULNERABILITY_INDEX">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                       { subject: '热失效', A: 45, fullMark: 100 },
                       { subject: '气蚀损坏', A: 20, fullMark: 100 },
                       { subject: '颗粒磨损', A: 65, fullMark: 100 },
                       { subject: '密封老化', A: 92, fullMark: 100 },
                       { subject: '响应延迟', A: 30, fullMark: 100 },
                    ]}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic mt-2">
                 "密封老化及颗粒磨损是当前 #1 机组的主要风险源。"
              </div>
           </SciFiCard>

           <SciFiCard title="全球供应节点追踪" subtitle="LOGISTICS_HUB" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { node: '博世力士乐仓库', stock: '阀芯 x2', eta: '12h', status: 'Ready' },
                      { node: '德国汉堡中心', stock: '主泵总成', eta: '48h', status: 'Transit' },
                      { node: '上海保税库', stock: '定制密封包', eta: '24h', status: 'Process' },
                    ].map((item, i) => (
                       <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-blue-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2">
                                <Globe size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-200">{item.node}</span>
                             </div>
                             <span className="text-[10px] font-mono text-cyan-400">ETA: {item.eta}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mb-2">{item.stock}</div>
                          <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600" style={{ width: item.status === 'Ready' ? '100%' : '40%' }}></div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-auto space-y-4">
                    <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-blue-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 替换建议</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “识别到蓄能器 B 的健康度下降至 <span className="text-red-400 font-bold">42%</span>。检测到内部皮囊可能发生疲劳破损，建议在下个 48h 停机窗口执行组件化替换。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出液压系统运行白皮书
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 P&ID 原理库</div>
                    <div className="text-xs font-bold text-white">HYD_SCHEM_V5.dwg</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
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
          background: rgba(34, 211, 238, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.6);
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};
