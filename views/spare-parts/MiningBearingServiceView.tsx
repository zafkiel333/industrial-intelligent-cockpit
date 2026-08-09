
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { BearingDetailScene } from '../../components/mine_bearing/BearingDetailScene';
import { BearingInternalStatus } from '../../components/mine_bearing/three-types';
import { 
  Zap, 
  Droplets, 
  Activity, 
  ShieldAlert, 
  Database, 
  Globe, 
  Award, 
  TrendingUp, 
  Cpu, 
  ChevronRight, 
  Clock, 
  Search,
  Maximize2,
  Wrench,
  Thermometer,
  Gauge,
  RotateCw,
  Waves,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  History,
  Info,
  // Fix: Added missing icons to resolve errors at lines 215, 216, 345 and 360
  Layers,
  Target,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  // Fix: Added missing ReferenceLine import to resolve error at line 290
  LineChart, Line, Legend, ComposedChart, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';

// --- 模拟工程数据 ---
const BEARING_TELEMETRY = {
  id: 'BRG-X7-MINING',
  name: 'SKF 圆柱滚子轴承 (重载型)',
  standard: 'DIN 612-4',
  filmThickness: 0.42,
  vibrationG: 1.25,
  operatingTemp: 84,
  pittingRisk: 12,
};

const VIBRATION_SPECTRUM = Array.from({length: 40}, (_, i) => ({
  freq: i * 10,
  amp: Math.random() * 5 + (i === 12 ? 25 : 0) + (i === 24 ? 15 : 0),
  limit: 10
}));

const OIL_ANALYSIS = [
  { month: '01', particleCount: 1200, viscosity: 45 },
  { month: '02', particleCount: 1450, viscosity: 44 },
  { month: '03', particleCount: 1800, viscosity: 42 },
  { month: '04', particleCount: 2400, viscosity: 38 }, // 异常点
];

const GLOBAL_STOCK = [
  { region: '瑞典哥德堡 (原厂)', stock: 4, eta: '14d', status: 'Ready' },
  { region: '中国天津 (保税库)', stock: 2, eta: '48h', status: 'Transit' },
  { region: '矿区现地 (急用库)', stock: 0, eta: '-', status: 'Empty' },
];

export const MiningBearingServiceView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'stress' | 'lubrication'>('standard');
  const [activePart, setActivePart] = useState<string>('整体总成');
  const [rpm, setRpm] = useState(1200);

  const status: BearingInternalStatus = {
    id: 'BRG-X7',
    name: '主破碎机轴承',
    loadVector: [1, 0, 0],
    oilFilmThickness: 0.42,
    viscosityIndex: 110,
    vibrationPeak: 1.2,
    tempGradient: 0.5,
    isMaintenanceMode: false
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-700 bg-[#05070a] overflow-hidden p-2">
      
      {/* 顶部：战术指引栏 */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 px-4 bg-slate-900/20 rounded-t-xl">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)] border-2 border-amber-400/50 relative group">
              <Zap size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-amber-500/20 rounded animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Tribology & Friction Control Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 矿用重载轴承 <span className="text-amber-500 italic">全生命周期服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统功耗损耗</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">-4.2%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均剩余寿命</div>
              <div className="text-2xl font-mono font-bold text-amber-400">14,250 <span className="text-sm font-normal text-slate-600 uppercase">h</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">数字化覆盖度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">100%</div>
           </div>
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-[shimmer_3s_infinite]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 relative">
        
        {/* 左翼：摩擦学与状态感官 (Tribology) */}
        <div className="xl:col-span-3 flex flex-col gap-5 overflow-hidden">
           <SciFiCard title="实时磨损数字指纹" subtitle="TRIBOLOGY_GENOME" highlight className="border-amber-900/30">
              <div className="space-y-6 py-2">
                 <div className="flex justify-between items-end">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">油膜厚度 (h)</div>
                       <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                          0.42 <span className="text-xs text-amber-500">μm</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${BEARING_TELEMETRY.filmThickness > 0.3 ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                          Steady State
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-400">
                       <span>油液粘度平衡</span>
                       <span className="text-white font-mono">110 VI</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[72%] shadow-[0_0_10px_#f59e0b]"></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800 hover:border-amber-500/50 transition-all">
                       <Thermometer size={14} className="text-orange-400 mb-2" />
                       <div className="text-[10px] text-slate-500 uppercase">当前温度</div>
                       <div className="text-lg font-mono font-bold text-white">84.2°C</div>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800 hover:border-cyan-500/50 transition-all">
                       <Activity size={14} className="text-cyan-400 mb-2" />
                       <div className="text-[10px] text-slate-500 uppercase">振动峰值</div>
                       <div className="text-lg font-mono font-bold text-white">1.25G</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="油质趋势与颗粒度" subtitle="FLUID_INTEGRITY" className="flex-1 overflow-hidden">
              <div className="h-full w-full flex flex-col">
                 <div className="flex-1 min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={OIL_ANALYSIS}>
                          <defs>
                             <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                          <Area type="monotone" dataKey="particleCount" stroke="#0ea5e9" fill="url(#colorOil)" strokeWidth={2} name="颗粒数 (c/ml)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-200 leading-tight">
                       <span className="font-bold">严重警报：</span> 4月检测到大量金属磨屑，NAS等级由7级降至9级。轴承可能已发生早期疲劳剥落。
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：轴承全息扫描与三维演化 (The Core) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#010204] border border-white/5 rounded-2xl overflow-hidden group">
              {/* HUD 交互界面 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Fingerprint size={14} className="animate-pulse" />
                          Sub-micron Integrity Scanner
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          {activePart} <span className="text-cyan-500 italic">数字模型</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-3">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center">分析视角 (View Mode)</div>
                          <div className="flex gap-2">
                             {[
                               { id: 'standard', label: '标准', icon: <Layers size={14}/> },
                               { id: 'stress', label: '应力', icon: <Target size={14}/> },
                               { id: 'lubrication', label: '润滑', icon: <Droplets size={14}/> },
                             ].map(m => (
                               <button 
                                 key={m.id}
                                 onClick={() => setViewMode(m.id as any)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                    ${viewMode === m.id ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}
                                 `}
                               >
                                  {m.icon} {m.label}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center gap-5 backdrop-blur-md shadow-2xl group hover:border-amber-500/50 transition-all">
                          <div className="p-3 bg-amber-950/40 rounded-full border border-amber-900/30">
                             <RotateCw size={24} className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                          </div>
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">仿真运行速度</div>
                             <div className="text-xl font-bold text-white font-mono">{rpm} <span className="text-[10px] text-slate-600 font-normal">RPM</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/80 p-4 rounded-xl border border-white/5 backdrop-blur-md pointer-events-auto flex items-center gap-4 group">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Digital Twin Health</div>
                          <div className="text-2xl font-bold text-white font-mono leading-none tracking-tighter">98.85%</div>
                       </div>
                       <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform cursor-pointer">
                          <Maximize2 size={24} className="text-cyan-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <BearingDetailScene 
                    status={status}
                    rotationSpeed={rpm / 1000}
                    viewMode={viewMode}
                    onPartClick={setActivePart}
                 />
              </div>

              {/* 背景装饰氛围 */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#05070a_100%)] opacity-80"></div>
           </div>

           {/* 底部：声发射频谱分析 (Acoustic Diagnostics) */}
           <SciFiCard title="声发射 (AE) 高频特征频谱" subtitle="ACOUSTIC_ANALYSER" className="h-60 border-amber-900/20" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={VIBRATION_SPECTRUM}>
                       <defs>
                          <linearGradient id="colorSpec" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="freq" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: '频率 (Hz)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="amp" stroke="#f59e0b" fill="url(#colorSpec)" strokeWidth={2} name="当前信号" />
                       <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '报警限值', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Line type="monotone" dataKey="amp" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" name="历史基准" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：全球柔性供应链 (Logistics & Supply) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="韧性供应链监控" subtitle="SUPPLY_RESILIENCE">
              <div className="space-y-4 py-2">
                 {GLOBAL_STOCK.map((node, i) => (
                    <div key={i} className="group flex flex-col gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             <Globe size={14} className="text-cyan-500" />
                             <span className="text-xs font-bold text-slate-200">{node.region}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${node.stock > 0 ? 'text-green-400' : 'text-red-500'}`}>
                             {node.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                       </div>
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">库存数量: <span className="text-white font-mono">{node.stock} EA</span></span>
                          <span className="text-slate-500">运输时延: <span className="text-cyan-400 font-mono">{node.eta}</span></span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div className={`h-full bg-cyan-600 transition-all ${node.status === 'Ready' ? 'w-full' : 'w-1/2'}`}></div>
                       </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-3 bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30">
                    <Zap size={14} /> 启动紧急全域调度
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 替换与技术决策" subtitle="DECISION_SUPPORT" className="flex-1 border-amber-900/30 bg-amber-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Cpu size={16} className="text-amber-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">智能替换评估</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “检测到当前轴承工作于‘极寒矿区’。由于原厂件库存告急，AI 建议选用具备 <span className="text-white font-bold">低温韧性优化</span> 的国产化替代型号，其全温区载荷偏差仅为 <span className="text-emerald-400 font-bold">±1.2%</span>。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-green-500" /> 认证与质量核验 (Class Audit)
                    </div>
                    {[
                      { label: '原厂 17025 实验室报告', status: 'done' },
                      { label: '现场材质金相复核', status: 'done' },
                      { label: '数字化安装扭矩同步', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-slate-600 animate-pulse" />}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg border border-slate-600 transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 导出轴承健康审计白皮书
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded-lg"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联故障诊断树库</div>
                    <div className="text-xs font-bold text-white">FAIL_ARCHIVE_v5.db</div>
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};
