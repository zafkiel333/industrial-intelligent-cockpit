import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { SafetyStockScene } from '../../components/spare_parts_safety/SafetyStockScene';
import { 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  Zap, 
  Settings, 
  AlertTriangle, 
  Database, 
  Activity, 
  Gauge, 
  Cpu, 
  History, 
  Maximize2,
  Minimize2,
  RefreshCw,
  Target,
  BarChart3,
  Box,
  Truck,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  Briefcase,
  // Fix: Added missing BrainCircuit import from lucide-react to resolve Error at line 328
  BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  // Fix: Added missing PolarRadiusAxis import from recharts to resolve Error at line 183
  PolarRadiusAxis
} from 'recharts';

// --- 模拟数据 ---

const STOCK_SIM_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  stock: 40 + Math.sin(i * 0.5) * 20 + Math.random() * 5,
  safety: 35,
  reorder: 55,
}));

const RISK_RADAR = [
  { subject: '提前期不确定性', A: 85, fullMark: 100 },
  { subject: '需求波动强度', A: 70, fullMark: 100 },
  { subject: '缺货停机损失', A: 95, fullMark: 100 },
  { subject: '资金占用成本', A: 60, fullMark: 100 },
  { subject: '供应链鲁棒性', A: 75, fullMark: 100 },
];

const COMPONENT_LIST = [
  { id: 'SP-922', name: '主轴轴承组件', sl: 98.5, stock: '12 unit', cost: '¥85k', risk: 'low' },
  { id: 'SP-114', name: '液压伺服阀', sl: 95.0, stock: '4 unit', cost: '¥42k', risk: 'medium' },
  { id: 'SP-008', name: 'PLC核心模块', sl: 99.9, stock: '2 unit', cost: '¥120k', risk: 'critical' },
];

export const SafetyStockConfigView: React.FC = () => {
  const [serviceLevel, setServiceLevel] = useState(0.95);
  const [variability, setVariability] = useState(0.4);
  const [isSyncing, setIsSyncing] = useState(false);

  const stats = useMemo(() => ({
    ssQty: Math.ceil(serviceLevel * 50 * (1 + variability)),
    rop: Math.ceil(50 + (serviceLevel * 20)),
    holdingCost: (serviceLevel * 12000 * variability).toFixed(0),
    shortageRisk: ((1 - serviceLevel) * 100).toFixed(1),
  }), [serviceLevel, variability]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020617]">
      
      {/* 顶部：战略平衡控制台 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-4 bg-gradient-to-r from-orange-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-400/50 relative group">
              <Scale size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-orange-500/20 rounded animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Dynamic Safety Stock Policy Center
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 安全库存 <span className="text-orange-500 italic">智慧配置引擎</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">综合服务水平 (SL)</div>
              <div className="text-2xl font-mono font-bold text-white">{(serviceLevel * 100).toFixed(1)}%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">资本占用估值</div>
              <div className="text-2xl font-mono font-bold text-orange-400">¥ {stats.holdingCost}</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">缺货风险指数</div>
              <div className="text-2xl font-mono font-bold text-red-500">{stats.shortageRisk}%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左翼：参数调节与配置 (Input Matrix) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <SciFiCard title="服务策略输入" subtitle="STRATEGY_CONFIG" highlight className="border-orange-500/20">
              <div className="space-y-6 py-2">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-orange-500"/> 服务置信度 (Confidence)</span>
                       <span className="text-white font-mono font-bold">{(serviceLevel * 100).toFixed(1)}%</span>
                    </div>
                    <input 
                      type="range" min="0.85" max="0.999" step="0.001" 
                      value={serviceLevel}
                      onChange={(e) => setServiceLevel(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                       <span>LOW (Cost Opt)</span>
                       <span>BALANCED</span>
                       <span>ULTRA (Prod First)</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2"><Activity size={14} className="text-cyan-400"/> 提前期变异系数 (CV)</span>
                       <span className="text-white font-mono font-bold">{(variability).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1" step="0.05" 
                      value={variability}
                      onChange={(e) => setVariability(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                       <span>STABLE (Direct)</span>
                       <span>VOLATILE (Import)</span>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-950/80 border border-slate-800 rounded relative overflow-hidden group">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-widest border-b border-slate-800 pb-2">计算结果 (Calculated)</div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500">建议安全库存量</span>
                          <span className="text-lg font-bold text-white font-mono">{stats.ssQty} <span className="text-[10px] font-normal text-slate-600 uppercase">Unit</span></span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500">动态再订货点 (ROP)</span>
                          <span className="text-lg font-bold text-orange-400 font-mono">{stats.rop}</span>
                       </div>
                    </div>
                    <ArrowRight className="absolute bottom-2 right-2 text-slate-800 group-hover:text-orange-500 transition-colors" />
                 </div>

                 <button 
                  onClick={handleSync}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded border border-slate-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                 >
                    {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : <Database size={14} />}
                    同步生产排程计划
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="风险穿透矩阵" subtitle="RISK_RADAR" className="flex-1">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                       {/* Fix: Added missing PolarRadiusAxis import from recharts */}
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 动态水位模拟与水位推演 (The Core Simulator) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-orange-900/20 rounded-sm overflow-hidden group">
              {/* HUD 界面 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs">
                          <Activity size={14} className="animate-pulse" />
                          PROBABILISTIC INVENTORY RECONCILIATION
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          库存水位 <span className="text-orange-500 italic">动态平衡模拟</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-orange-500/30 p-2 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">资源鲁棒性指数</div>
                       <div className="text-3xl font-mono font-bold text-orange-400 leading-none">H-0.92 <span className="text-sm font-normal text-slate-600">σ</span></div>
                    </div>
                 </div>

                 {/* 四角技术装饰 */}
                 <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-orange-500/20"></div>
                 <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-orange-500/20"></div>

                 {/* 实时状态弹窗 (右侧) */}
                 <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-auto">
                    <div className="bg-slate-900/90 border-l-4 border-orange-500 p-4 rounded-r-sm backdrop-blur-md w-48 shadow-2xl space-y-4">
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Stock-out Cycle</div>
                          <div className="text-sm font-bold text-white">Every <span className="text-orange-400">14.2</span> Months</div>
                       </div>
                       <div className="h-[1px] bg-slate-800"></div>
                       <div>
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Exposure Value</div>
                          <div className="text-sm font-bold text-red-400">¥ 124.5k <span className="text-[8px] text-slate-500 font-normal">/Event</span></div>
                       </div>
                       <div className="pt-2">
                          <div className={`px-2 py-1 rounded-full text-[8px] font-bold text-center border
                             ${serviceLevel > 0.95 ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}
                          `}>
                             {serviceLevel > 0.95 ? 'PROTECTION SECURE' : 'CRITICAL EXPOSURE'}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 底部详细操作区 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm">
                          <Cpu size={24} className="text-orange-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase">当前计算模型</div>
                             <div className="text-sm font-bold text-white uppercase tracking-widest">NormalDist-v2.1</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <button className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2">
                          <Zap size={14}/> 启动 Monte-Carlo 模拟
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <SafetyStockScene 
                    serviceLevel={serviceLevel} 
                    variability={variability}
                    isCalculating={isSyncing}
                    baseColor="#0ea5e9"
                 />
              </div>
           </div>

           {/* 底部：动态库存波动模拟图 (Simulation Profile) */}
           <SciFiCard title="库存安全余量模拟 (Rolling Buffer)" subtitle="SIMULATION_STREAM" className="h-60 border-cyan-900/20" noPadding>
              <div className="w-full h-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={STOCK_SIM_DATA}>
                       <defs>
                          <linearGradient id="colorStockSafety" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={2} />
                       <YAxis hide domain={[0, 80]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="stock" stroke="#0ea5e9" fill="url(#colorStockSafety)" strokeWidth={2} name="当前库存" />
                       <ReferenceLine y={stats.ssQty} stroke="#f97316" strokeDasharray="5 5" label={{ value: '安全水位', fill: '#f97316', fontSize: 10, position: 'insideTopRight' }} />
                       <ReferenceLine y={stats.rop} stroke="#8b5cf6" strokeDasharray="3 3" label={{ value: '再订货点', fill: '#8b5cf6', fontSize: 10, position: 'insideTopLeft' }} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：分类清单与 AI 决策建议 (Inventory Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-1">
           
           <SciFiCard title="备件风险分级清单" subtitle="INVENTORY_RANK" className="flex-1 overflow-hidden border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {COMPONENT_LIST.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-orange-500/30 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-slate-500">{item.id}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${item.risk === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}
                            `}>{item.risk} Risk</span>
                         </div>
                         <div className="text-xs font-bold text-white mb-1 group-hover:text-orange-400 transition-colors truncate">{item.name}</div>
                         <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Service Level: <span className="text-cyan-400 font-bold">{item.sl}%</span></span>
                            <span className="text-slate-300 font-mono">{item.stock}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                       <BarChart3 size={14} /> 导出配置方案
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 动态策略建议" subtitle="REASONING" className="border-orange-900/30 bg-orange-950/5">
              <div className="space-y-4">
                 <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       {/* Fix: Added missing BrainCircuit import from lucide-react */}
                       <BrainCircuit size={16} className="text-orange-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">动态库存调节建议</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “通过分析最近 48 小时的供应链上游数据，<span className="text-white font-bold">主轴承组件</span> 的平均提前期从 14 天波动至 18 天。AI 建议暂时将该类目的 SL 锚点从 95% 上调至 <span className="text-orange-500 font-bold">98%</span> 以应对潜在风险。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Truck size={60} className="text-orange-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <PackageCheck size={12} className="text-emerald-500" /> 供应链敏感度检测 (Lead-Time)
                    </div>
                    {[
                      { label: '海运物流 (10kV 备件)', status: 'delayed', val: '+4.5d' },
                      { label: '本地仓 (标准件)', status: 'normal', val: '0d' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-all">
                         <span className="text-[10px] text-slate-400">{step.label}</span>
                         <span className={`font-mono text-[10px] font-bold ${step.status === 'delayed' ? 'text-red-400' : 'text-green-400'}`}>{step.val}</span>
                      </div>
                    ))}
                 </div>

                 <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> 更新全局安全库存指令
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联 ERP 财务系统</div>
                    <div className="text-xs font-bold text-white">SAP_FIN_MOD_99</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-orange-500 transition-colors" />
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
          background: rgba(249, 115, 22, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </div>
  );
};
