import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { StockThreeScene } from '../../components/maintenance_stock/ThreeScene';
import { StockLocation } from '../../components/maintenance_stock/three-types';
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  Truck, 
  ShoppingCart, 
  Box, 
  Search, 
  RefreshCw,
  MoreHorizontal,
  ArrowRight,
  ShieldAlert,
  ThermometerSnowflake,
  Timer
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const WAREHOUSE_DATA: StockLocation[] = [
  { id: 'SP-CRIT-01', rack: 0, level: 3, column: 2, status: 'critical', partName: '主轴承 (Main Bearing)' },
  { id: 'SP-CRIT-02', rack: 1, level: 1, column: 4, status: 'critical', partName: '液压伺服阀 (Servo Valve)' },
  { id: 'SP-LOW-01', rack: 0, level: 2, column: 1, status: 'low', partName: '高压密封圈 (Seal Ring)' },
  { id: 'SP-LOW-02', rack: 2, level: 4, column: 0, status: 'low', partName: '滤芯 (Filter Element)' },
  { id: 'SP-NORM-01', rack: 1, level: 2, column: 2, status: 'normal', partName: '控制器模块 (PLC)' },
  { id: 'SP-NORM-02', rack: 2, level: 0, column: 3, status: 'normal', partName: '润滑油泵 (Lube Pump)' },
  // Fillers
  { id: 'SP-F-01', rack: 0, level: 0, column: 0, status: 'normal', partName: '螺栓组' },
  { id: 'SP-F-02', rack: 1, level: 4, column: 4, status: 'normal', partName: '线缆包' },
];

const DEPLETION_PREDICTION = [
  { day: 'Mon', stock: 120, predicted: 120, threshold: 40 },
  { day: 'Tue', stock: 110, predicted: 108, threshold: 40 },
  { day: 'Wed', stock: 95, predicted: 90, threshold: 40 },
  { day: 'Thu', stock: 82, predicted: 75, threshold: 40 },
  { day: 'Fri', stock: 60, predicted: 55, threshold: 40 },
  { day: 'Sat', stock: 45, predicted: 35, threshold: 40 }, // Alert here
  { day: 'Sun', stock: 30, predicted: 20, threshold: 40 },
];

const CRITICAL_LIST = [
  { id: 'SP-CRIT-01', name: '主轴承 SKF-2234', stock: 1, min: 2, leadTime: '14天', supplier: '瑞典SKF' },
  { id: 'SP-CRIT-02', name: '液压伺服阀 Rexroth', stock: 0, min: 1, leadTime: '7天', supplier: '博世力士乐' },
  { id: 'SP-LOW-01', name: '高压密封圈', stock: 5, min: 10, leadTime: '3天', supplier: '本地库' },
];

export const StockAlertView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>('SP-CRIT-01');
  
  const activePart = WAREHOUSE_DATA.find(p => p.id === selectedPartId) || WAREHOUSE_DATA[0];
  const activeCriticalDetail = CRITICAL_LIST.find(c => c.id === selectedPartId);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-slate-200 animate-in fade-in duration-700">
      
      {/* 1. Header: High-Tech Alert Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-orange-900/50 bg-gradient-to-r from-orange-950/30 to-slate-900/80 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-orange-600/20 rounded-full border-2 border-orange-500 flex items-center justify-center animate-pulse">
               <AlertTriangle size={32} className="text-orange-500" />
            </div>
            <div>
               <div className="text-[10px] text-orange-400 font-bold tracking-[0.3em] uppercase mb-1">Inventory Early Warning System</div>
               <h1 className="text-3xl font-bold text-white tracking-tighter">
                  关键备件 <span className="text-orange-500">库存预警看板</span>
               </h1>
            </div>
         </div>
         
         <div className="flex gap-8 text-right">
            <div>
               <div className="text-[10px] text-slate-500 uppercase">总库存 SKU</div>
               <div className="text-2xl font-mono font-bold text-white">4,285</div>
            </div>
            <div>
               <div className="text-[10px] text-slate-500 uppercase">红色预警</div>
               <div className="text-2xl font-mono font-bold text-red-500">03</div>
            </div>
            <div>
               <div className="text-[10px] text-slate-500 uppercase">供应链延迟</div>
               <div className="text-2xl font-mono font-bold text-amber-400">48h</div>
            </div>
         </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
         
         {/* LEFT: Critical List & AI Prediction */}
         <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-hidden">
            
            <SciFiCard title="急需补货清单 (Critical List)" subtitle="ACTION REQUIRED" highlight className="border-red-900/40">
               <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {CRITICAL_LIST.map((item) => (
                     <div 
                        key={item.id}
                        onClick={() => setSelectedPartId(item.id)}
                        className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                           ${selectedPartId === item.id 
                              ? 'bg-red-950/30 border-red-500 shadow-lg' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-red-500/50'}
                        `}
                     >
                        {selectedPartId === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] bg-slate-950 text-slate-400 px-1 rounded border border-slate-700">{item.id}</span>
                           <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <ShieldAlert size={10} /> Critical
                           </span>
                        </div>
                        <div className="text-sm font-bold text-white mb-3">{item.name}</div>
                        
                        <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                           <div className="flex flex-col">
                              <span className="text-[9px] text-slate-500 uppercase">当前 / 最低</span>
                              <span className="font-mono font-bold text-white">
                                 <span className="text-red-500 text-lg">{item.stock}</span> / {item.min}
                              </span>
                           </div>
                           <div className="h-8 w-[1px] bg-slate-700"></div>
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] text-slate-500 uppercase">补货周期</span>
                              <span className="font-mono font-bold text-amber-400">{item.leadTime}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </SciFiCard>

            <SciFiCard title="智能补货建议" subtitle="AI_REORDER" className="bg-slate-900/30">
               <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-400">
                        <ShoppingCart size={18} />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs text-slate-400">建议立即采购方案</div>
                        <div className="text-sm font-bold text-white">组合包 #A04 (含轴承+密封)</div>
                     </div>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/50 p-2 rounded">
                     基于消耗速率预测，若不立即下单，预计 <span className="text-red-400 font-bold">3天后</span> 将面临停机缺件风险。
                  </div>
                  <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-lg shadow-cyan-900/20">
                     一键生成采购单
                  </button>
               </div>
            </SciFiCard>

         </div>

         {/* CENTER: 3D Holographic Warehouse */}
         <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
            <div className="flex-1 bg-[#020408] border border-slate-800 rounded-lg relative overflow-hidden group">
               
               {/* 3D Scene Container */}
               <div className="absolute inset-0 z-0">
                  <StockThreeScene 
                     locations={WAREHOUSE_DATA} 
                     selectedId={selectedPartId}
                     onSelect={setSelectedPartId}
                  />
               </div>

               {/* Overlay: HUD Interface */}
               <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
                  <div className="flex justify-between">
                     <div className="bg-black/60 border border-slate-700/50 backdrop-blur-sm p-3 rounded-lg max-w-[200px]">
                        <div className="text-[10px] text-cyan-500 font-bold uppercase mb-1 flex items-center gap-2">
                           <Box size={12} /> Digital Twin Warehouse
                        </div>
                        <div className="text-xs text-slate-300">
                           Zone A - Automated Vertical Storage
                        </div>
                        <div className="mt-2 flex gap-1">
                           <div className="h-1 flex-1 bg-red-500 rounded-full"></div>
                           <div className="h-1 flex-1 bg-amber-500 rounded-full"></div>
                           <div className="h-1 flex-1 bg-cyan-500 rounded-full"></div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-2 pointer-events-auto">
                        <button className="w-10 h-10 bg-slate-900/80 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500 transition-all">
                           <Search size={16} />
                        </button>
                        <button className="w-10 h-10 bg-slate-900/80 border border-slate-700 rounded flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500 transition-all">
                           <RefreshCw size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Selected Item Detail Pop-up (Bottom Center) */}
                  {activePart && (
                     <div className="self-center bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md p-4 rounded-xl flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-4">
                        <div className="w-12 h-12 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                           <Package size={24} className={activePart.status === 'critical' ? 'text-red-500' : 'text-cyan-500'} />
                        </div>
                        <div>
                           <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">
                              LOC: R{activePart.rack}-L{activePart.level}-C{activePart.column}
                           </div>
                           <div className="text-sm font-bold text-white">{activePart.partName}</div>
                           <div className="text-[10px] text-slate-400 mt-1">
                              Status: <span className={`font-bold uppercase ${activePart.status === 'critical' ? 'text-red-500' : 'text-cyan-400'}`}>{activePart.status}</span>
                           </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-700"></div>
                        <button className="pointer-events-auto px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600 hover:text-white text-cyan-400 text-xs rounded transition-all">
                           定位货位
                        </button>
                     </div>
                  )}
               </div>
               
               {/* Background Decorative Grid */}
               <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
               }}></div>
            </div>
         </div>

         {/* RIGHT: Analytics & Logistics */}
         <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-hidden">
            
            {/* Depletion Trend */}
            <SciFiCard title="库存消耗预测" subtitle="PREDICTIVE_MODEL" className="h-64 border-cyan-900/30">
               <div className="h-full w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={DEPLETION_PREDICTION}>
                        <defs>
                           <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} />
                        <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Safe Line', fill: '#ef4444', fontSize: 8, position: 'insideRight'}} />
                        <Area type="monotone" dataKey="stock" stroke="#0ea5e9" fill="url(#colorStock)" strokeWidth={2} />
                        <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeDasharray="3 3" fill="transparent" strokeWidth={1} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </SciFiCard>

            {/* Logistics Tracking */}
            <SciFiCard title="物流在途监控" subtitle="IN_TRANSIT" className="flex-1 border-slate-800">
               <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                     <Truck size={16} className="text-cyan-400 mt-1" />
                     <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-white font-bold">急件: 主轴承 x2</span>
                           <span className="text-cyan-400">运输中</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                           <div className="bg-cyan-500 h-full w-[70%]"></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500">
                           <span>预计到达: 明日 10:00</span>
                           <span>距工厂 120km</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800 opacity-60">
                     <Truck size={16} className="text-slate-500 mt-1" />
                     <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-300">常规补货: 滤芯 x50</span>
                           <span className="text-slate-500">已发货</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                           <div className="bg-slate-500 h-full w-[30%]"></div>
                        </div>
                        <div className="text-[9px] text-slate-500">
                           预计到达: 3天后
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="mt-auto pt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-2">
                     <span className="flex items-center gap-1"><ThermometerSnowflake size={12}/> 特种储存条件</span>
                     <span className="text-green-400">恒温恒湿正常</span>
                  </div>
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700 transition-colors flex items-center justify-center gap-2">
                     <ArrowRight size={12} /> 查看所有物流单
                  </button>
               </div>
            </SciFiCard>

         </div>

      </div>
    </div>
  );
};