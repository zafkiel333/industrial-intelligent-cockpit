import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { UndergroundShaftScene } from '../../components/underground_emergency/UndergroundShaftScene';
import { UndergroundNode } from '../../components/underground_emergency/three-types';
import { 
  Siren, 
  Activity, 
  Wind, 
  Cpu, 
  Zap, 
  Database, 
  ShieldAlert, 
  Timer, 
  Truck, 
  Plane,
  RotateCw,
  Search,
  Settings2,
  ChevronRight,
  Maximize2,
  Lock,
  Thermometer,
  ShieldCheck,
  ClipboardCheck,
  Layers,
  ArrowRightLeft,
  Radar,
  // Fix: Added missing imports to resolve "Cannot find name" errors
  MapPin,
  Box,
  CheckCircle2,
  Package,
  Wrench
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine
} from 'recharts';

const EMERGENCY_POOL: UndergroundNode[] = [
  { id: 'UNIT-P-850', depth: 850, type: 'pump', status: 'critical', position: [-4, 5, 2] },
  { id: 'UNIT-H-420', depth: 420, type: 'hoist', status: 'warning', position: [5, 10, -3] },
  { id: 'UNIT-V-1200', depth: 1200, type: 'ventilation', status: 'normal', position: [-2, -8, 4] },
];

const SIGNALS = [
  { id: 'SIG-01', time: '14:20:05', asset: '主排水泵组', event: '轴承震动突变', level: 'P1', depth: '-850m' },
  { id: 'SIG-02', time: '13:15:22', asset: '副井提升机', event: 'PLC通信间歇中断', level: 'P2', depth: '-420m' },
  { id: 'SIG-03', time: '10:42:10', asset: '主通风机 B', event: '变频器电容温升过载', level: 'P1', depth: '-50m' },
];

const STOCK_READINESS = [
  { category: '本质安全电路', ready: 95, color: '#10b981' },
  { category: '隔爆密封件', ready: 72, color: '#f59e0b' },
  { category: '湿式多级泵件', ready: 45, color: '#ef4444' },
  { category: 'UWB定位基站', ready: 100, color: '#6366f1' },
];

const COST_SAVED_DATA = [
  { month: '01', val: 12 }, { month: '02', val: 18 }, { month: '03', val: 45 },
  { month: '04', val: 32 }, { month: '05', val: 68 }, { month: '06', val: 55 },
];

export const UndergroundEmergencyView: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(EMERGENCY_POOL[0].id);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeEvent = useMemo(() => 
    EMERGENCY_POOL.find(e => e.id === activeId) || EMERGENCY_POOL[0], 
  [activeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：应急指挥大脑抬头 */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-4 bg-gradient-to-r from-red-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-stone-900 rounded-sm flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] border-2 border-red-400/50 relative group">
              <Siren size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-red-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-red-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Subterranean Tactical Assurance Console
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 井下设备 <span className="text-red-500 italic">应急备件保障指挥部</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">应急响应时耗</div>
              <div className="text-2xl font-mono font-bold text-red-400">12.4 <span className="text-sm font-normal text-slate-600">MIN</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">资源调度饱和度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">42%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-sm font-bold transition-all shadow-lg shadow-red-900/30 flex items-center gap-2">
              <ShieldAlert size={18} /> 启动特级响应
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：应急信号捕获阵列 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Radar size={14} className="text-red-500" /> SOS 信号流</span>
              <span>LIVE FEED</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {SIGNALS.map(sig => (
                <div 
                  key={sig.id}
                  onClick={() => setActiveId(sig.id.replace('SIG','UNIT'))} // 模拟映射
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeId?.includes(sig.id.slice(-2))
                      ? 'bg-red-950/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-red-500 mb-1 uppercase">{sig.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{sig.asset}</h3>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sig.level === 'P1' ? 'bg-red-600' : 'bg-amber-600'}`}>
                        {sig.level}
                     </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-3 font-medium">“{sig.event}”</div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800 pt-3">
                     <div className="flex items-center gap-1"><MapPin size={10} /> {sig.depth}</div>
                     <span className="font-mono">{sig.time}</span>
                  </div>
                  {activeId?.includes(sig.id.slice(-2)) && (
                     <div className="absolute left-0 top-0 h-full w-1 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                  )}
                </div>
              ))}
           </div>

           <SciFiCard title="避损价值贡献" subtitle="VALUE_PROTECTED" className="h-44 border-slate-800">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={COST_SAVED_DATA}>
                       <defs>
                          <linearGradient id="colorValueUE" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" hide />
                       <YAxis hide />
                       <Area type="monotone" dataKey="val" stroke="#10b981" fill="url(#colorValueUE)" strokeWidth={2} name="回收收益" />
                    </AreaChart>
                 </ResponsiveContainer>
                 <div className="absolute bottom-2 right-4 text-[10px] text-emerald-400 font-bold">¥ 450k SAVED / MO</div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 矿井垂直断面 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#010204] border border-red-900/20 rounded overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-red-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Zap size={14} className="animate-pulse" />
                          Subterranean Node Telemetry
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          矿井垂直 <span className="text-red-500 italic">断面监测场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-red-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">当前目标深度</div>
                          <div className="text-2xl font-mono font-bold text-red-400 leading-none mt-1">-{activeEvent.depth} <span className="text-sm font-normal text-slate-600 uppercase">Meters</span></div>
                       </div>
                       <button 
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`px-6 py-1.5 rounded-full font-bold text-[10px] uppercase border transition-all ${isSimulating ? 'bg-red-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                          {isSimulating ? '停止雷达扫描' : '启动深度扫描'}
                       </button>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Thermometer size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">目标环境温升</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">48.2 <span className="text-[10px] text-slate-600">°C</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-3 group cursor-pointer hover:border-red-500/30 transition-all">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Digital Twin Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.8%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-red-600/20 flex items-center justify-center border border-red-500/30">
                          <Maximize2 size={18} className="text-red-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <UndergroundShaftScene 
                    nodes={EMERGENCY_POOL} 
                    activeNodeId={activeId}
                    onNodeSelect={setActiveId}
                    showScanEffect={isSimulating}
                 />
              </div>

              {/* 背景装饰氛围 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：响应时序监控 */}
           <div className="h-32 bg-slate-900/60 border border-slate-800 rounded p-4 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10% 100%'}}></div>
              
              {DISPATCH_TIMELINE.map((step, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 z-10 relative flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700
                       ${step.status === 'done' ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' : 
                         step.status === 'active' ? 'bg-red-950/30 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-600'}
                    `}>
                       {step.icon}
                    </div>
                    <div className="text-center">
                       <div className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>{step.stage}</div>
                       <div className="text-[9px] font-mono text-slate-500 mt-0.5">{step.time}</div>
                    </div>
                    {i < DISPATCH_TIMELINE.length - 1 && (
                      <div className="absolute top-4 left-[60%] w-full h-[1px] bg-slate-800 -z-10"></div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* 右翼：战术供应链与库存 (Strategy) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="备件就绪度热力" subtitle="STOCK_READINESS">
              <div className="space-y-4 py-2">
                 {STOCK_READINESS.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>{item.category}</span>
                          <span style={{ color: item.color }}>{item.ready}%</span>
                       </div>
                       <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                             className="h-full transition-all duration-1000" 
                             style={{ width: `${item.ready}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="AI 应急配给方案" subtitle="STRATEGY_AI" className="flex-1 border-red-900/30 bg-red-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-red-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">配给指令集</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “基于 -850m 水泵失效工况，系统已自动锁定 <span className="text-white font-bold">隔爆型密封件 (Batch 04)</span>。建议通过 <span className="text-cyan-400 font-bold">5号主提</span> 垂直投送，避开 3号巷道清理作业。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                       <Box size={80} className="text-red-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ShieldCheck size={12} className="text-emerald-500" /> 本安/防爆合规核验
                    </div>
                    {[
                      { label: 'Ex ia I Ma 认证核对', status: 'pass' },
                      { label: '隔爆面间隙传感器自检', status: 'pass' },
                      { label: '数字化扭矩安装同步', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'pass' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <ClipboardCheck size={16} /> 下达战术投送指令
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between border-slate-800 rounded group hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联应急知识库</div>
                    <div className="text-xs font-bold text-white">PROC_UNDER_EMER_V4</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-red-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(239, 68, 68, 0.6); }
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

const DISPATCH_TIMELINE = [
  { stage: '预警触发', time: '10:00', status: 'done', icon: <Zap size={14}/> },
  { stage: '物资集结', time: '10:15', status: 'done', icon: <Package size={14}/> },
  { stage: '垂直投送', time: '10:25', status: 'active', icon: <ArrowRightLeft size={14}/> },
  { stage: '现场修复', time: '预计 10:45', status: 'pending', icon: <Wrench size={14}/> },
];
