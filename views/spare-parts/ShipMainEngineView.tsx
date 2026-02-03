import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipEngineThreeScene } from '../../components/ship_main_engine/ThreeScene';
import { 
  Ship, 
  Activity, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  Globe, 
  Search, 
  Settings2, 
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Database,
  Anchor,
  Wind,
  Gauge,
  Layers,
  AlertTriangle,
  ClipboardCheck,
  RefreshCw,
  // Fix: Added missing CheckCircle2 and FileText imports from lucide-react
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, Bar,
  // Fix: Added missing ReferenceLine import from recharts
  ReferenceLine
} from 'recharts';

// --- 模拟业务数据 ---
const CYLINDER_HEALTH = [
  { name: 'Cyl 1', health: 92, temp: 420 },
  { name: 'Cyl 2', health: 88, temp: 435 },
  { name: 'Cyl 3', health: 95, temp: 410 },
  { name: 'Cyl 4', health: 76, temp: 460 }, // 预警项
  { name: 'Cyl 5', health: 91, temp: 425 },
  { name: 'Cyl 6', health: 89, temp: 430 },
];

const SPARE_PARTS_INVENTORY = [
  { id: 'ME-PIS-01', name: '活塞头 (Piston Crown)', stock: 2, status: 'normal', type: 'piston' },
  { id: 'ME-LNR-04', name: '气缸套 (Cylinder Liner)', stock: 1, status: 'warning', type: 'liner' },
  { id: 'ME-INJ-77', name: '燃油喷嘴 (Injector)', stock: 24, status: 'normal', type: 'injector' },
  { id: 'ME-TBO-X', name: '增压器叶轮轴', stock: 0, status: 'critical', type: 'turbo' },
];

const LOGISTICS_NODES = [
  { city: '新加坡 (SGP)', stock: '充足', delay: '12h', region: '东南亚枢纽' },
  { city: '鹿特丹 (RTM)', stock: '中等', delay: '36h', region: '欧洲门户' },
  { city: '上海 (SHA)', stock: '充足', delay: '24h', region: '远东中心' },
];

const PMAX_PRESSURE_DATA = Array.from({length: 36}, (_, i) => ({
  angle: i * 10,
  p: 120 + Math.sin(i * 0.5) * 40 + Math.random() * 5,
  limit: 155
}));

export const ShipMainEngineView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>('ME-PIS-01');
  const [isRunning, setIsRunning] = useState(true);
  const [showThermal, setShowThermal] = useState(false);
  const [explodeLevel, setExplodeLevel] = useState(0);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617] overflow-hidden">
      
      {/* 顶部：航行指控抬头 */}
      <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 bg-gradient-to-r from-blue-950/20 via-transparent to-transparent p-4 rounded-t-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border-2 border-blue-400/50 relative group">
              <Ship size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-blue-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maritime Power Digital Twin Console
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 船舶主机 <span className="text-blue-500 italic">全球备件保障系统</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">当前输出功率</div>
              <div className="text-2xl font-mono font-bold text-white">24,500 <span className="text-sm text-slate-600">kW</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">燃油消耗率 (SFOC)</div>
              <div className="text-2xl font-mono font-bold text-green-400">165.2 <span className="text-xs text-slate-600">g/kWh</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">适航认证状态</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">CLASS_OK</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：备件库存与适航性 (Inventory & Class) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="核心备件库存矩阵" subtitle="INVENTORY_HUB" highlight className="flex-1 border-blue-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索部件/型号..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500" />
                 </div>
                 
                 {SPARE_PARTS_INVENTORY.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedId(part.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedId === part.id 
                            ? 'bg-blue-950/30 border-blue-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono text-blue-500 font-bold">{part.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.status === 'critical' ? 'bg-red-900/30 text-red-400 animate-pulse' : 
                               part.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{part.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{part.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>库存: <span className={part.stock === 0 ? 'text-red-500' : 'text-white'}>{part.stock} Unit</span></span>
                          <span className="flex items-center gap-1 uppercase tracking-tighter"><Database size={10} /> {part.type}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="船级社认证监控" subtitle="CLASS_PROTOCOL" className="h-56 border-slate-800">
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2 text-center">
                    {['CCS', 'DNV', 'LR'].map(org => (
                       <div key={org} className="bg-slate-950 border border-slate-800 p-2 rounded group hover:border-blue-500 transition-all cursor-help">
                          <div className="text-[10px] text-slate-500 mb-1">{org}</div>
                          <ShieldCheck size={20} className="mx-auto text-emerald-500" />
                       </div>
                    ))}
                 </div>
                 <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded flex items-start gap-3">
                    <Award className="text-blue-400 shrink-0 mt-0.5" size={16} />
                    <div className="text-[10px] text-slate-400 leading-normal">
                       当前 <span className="text-white font-bold">24枚</span> 燃油喷嘴均持有 DNV 最新材质证书，符合 IMO Tier III 排放标准核验。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：主机全息透视场 (Digital Twin) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#01040a] border border-blue-900/20 rounded-lg overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Wind size={14} className="animate-pulse" />
                          Engine Telemetry Matrix v4.2
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          主机数字化 <span className="text-blue-500 italic">孪生透视场</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-blue-500/30 p-2 rounded backdrop-blur-md">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">分析模式 (Analysis)</div>
                          <div className="flex gap-1">
                             <button onClick={() => setShowThermal(!showThermal)} className={`px-3 py-1 text-[8px] uppercase font-bold rounded-sm border transition-all ${showThermal ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>热力仿真</button>
                             <button onClick={() => setExplodeLevel(explodeLevel > 0 ? 0 : 0.5)} className={`px-3 py-1 text-[8px] uppercase font-bold rounded-sm border transition-all ${explodeLevel > 0 ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>爆炸分解</button>
                          </div>
                       </div>
                       <button onClick={() => setIsRunning(!isRunning)} className={`px-6 py-1.5 rounded-full font-bold text-xs border transition-all ${isRunning ? 'bg-red-900/40 border-red-500 text-red-400' : 'bg-green-900/40 border-green-500 text-green-400'}`}>
                          {isRunning ? '停止模拟' : '启动运行'}
                       </button>
                    </div>
                 </div>

                 {/* 底部详情 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Activity size={20} className="text-blue-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">主轴承震动 (Vib)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">1.24 mm/s <span className="text-green-500 text-[10px]">Normal</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Thermometer size={20} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold">扫气箱温度 (Temp)</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">45.8 °C</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ShipEngineThreeScene 
                    components={[]} 
                    activeComponentId={null}
                    onComponentClick={() => {}}
                    isRunning={isRunning}
                    showThermal={showThermal}
                    explodeLevel={explodeLevel}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：缸压平衡分析 (Combustion Analysis) */}
           <SciFiCard title="燃烧爆发压力实时平衡 (P-max Balancing)" subtitle="COMBUSTION_SCAN" className="h-60 border-blue-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={PMAX_PRESSURE_DATA}>
                       <defs>
                          <linearGradient id="pColor" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="angle" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: '曲轴转角 (deg)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} domain={[0, 180]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="p" stroke="#3b82f6" fill="url(#pColor)" name="当前缸压 (bar)" />
                       <ReferenceLine y={155} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'P-max Limit', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Line type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：全球物流与智能决策 (Logistics & Insight) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="全球供应节点追踪" subtitle="LOGISTICS_STREAM">
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                 {LOGISTICS_NODES.map((node, i) => (
                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-blue-500/50 transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <Anchor size={14} className="text-blue-500" />
                             <span className="text-xs font-bold text-slate-200">{node.city}</span>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400">ETA: {node.delay}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500">{node.region}</span>
                          <span className={`text-[10px] font-bold ${node.stock === '充足' ? 'text-green-500' : 'text-amber-500'}`}>库存{node.stock}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="智能维护决策" subtitle="AI_STRATEGY" className="flex-1 border-blue-900/30 bg-blue-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <Zap size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">性能退化预判</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “监测到 <span className="text-white font-bold">#4 气缸</span> 排气温度持续偏高 (+12°C)，推演显示燃油喷嘴可能存在积碳堵塞。建议船舶在抵达 <span className="text-blue-400 font-bold">新加坡 (SGP)</span> 时安排成套喷嘴更换。”
                    </p>
                 </div>
                 
                 <div className="space-y-2 mt-auto">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <ClipboardCheck size={12} className="text-green-500" /> 维保任务链 (Actions)
                    </div>
                    {[
                      { label: '预订 SGP 港口仓库存货', status: 'done' },
                      { label: '生成海事合规申报', status: 'pending' },
                      { label: '同步机舱维保日志 (E-Log)', status: 'ready' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-blue-500/30 transition-all">
                         <span className="text-[10px] text-slate-300 truncate w-40">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : 
                          step.status === 'ready' ? <RefreshCw size={12} className="text-cyan-500 animate-spin-slow" /> :
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>}
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText size={16} /> 导出主机维保工单 (Job Card)
                 </button>
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
          background: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
