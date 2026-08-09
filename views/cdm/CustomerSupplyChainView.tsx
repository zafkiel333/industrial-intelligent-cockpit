
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Network, Share2, Truck, Package, 
  Activity, RefreshCw, AlertTriangle, 
  GitMerge, GitPullRequest, ArrowRight,
  Database, ShoppingCart, Layers, Globe,
  Zap, BarChart4, Factory, Anchor
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- Mock Data ---

const KPI_STATS = [
  { label: '协同订单交付率 (OTIF)', value: '94.2%', trend: '+1.5%', color: '#10b981' },
  { label: '需求预测准确率 (Forecast)', value: '82.5%', trend: '-0.8%', color: '#f59e0b' },
  { label: '平均交付周期 (Lead Time)', value: '14.5天', trend: '-2.0天', color: '#0ea5e9' },
  { label: '库存周转天数 (DOS)', value: '28天', trend: '稳定', color: '#8b5cf6' },
];

const DEMAND_VS_SUPPLY = [
  { month: 'W1', demand: 4200, supply: 4300, backlog: 0 },
  { month: 'W2', demand: 4500, supply: 4400, backlog: 100 },
  { month: 'W3', demand: 5100, supply: 4600, backlog: 500 },
  { month: 'W4', demand: 3800, supply: 4200, backlog: 100 },
  { month: 'W5', demand: 4900, supply: 4800, backlog: 200 },
  { month: 'W6', demand: 5400, supply: 5000, backlog: 600 },
];

const SUPPLIER_RISK = [
  { name: 'Raw Material A', risk: 85, impact: 90, supplier: 'Supplier-X' },
  { name: 'Chipset B', risk: 60, impact: 95, supplier: 'Tech-Global' },
  { name: 'Steel Plate', risk: 30, impact: 60, supplier: 'IronWorks' },
  { name: 'Hydraulic Unit', risk: 20, impact: 40, supplier: 'FluidSys' },
  { name: 'Packaging', risk: 10, impact: 10, supplier: 'PackCo' },
];

const COLLABORATION_EVENTS = [
  { id: 'EVT-01', time: '10:42', type: 'Design Change', source: 'Customer A', desc: 'Updated specs for Order #8821', status: 'Pending' },
  { id: 'EVT-02', time: '09:15', type: 'Delay Alert', source: 'Supplier X', desc: 'Raw material shortage, +3 days delay', status: 'Critical' },
  { id: 'EVT-03', time: '08:30', type: 'Forecast Sync', source: 'System', desc: 'Q3 Demand Plan consolidated', status: 'Done' },
];

// --- Sub-Components ---

// Custom SVG Visualization for the Supply Chain Flow
const SupplyChainFlowMap = () => {
  return (
    <div className="w-full h-full relative bg-[#050810] overflow-hidden rounded">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glowChain">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Layer 1: Connections --- */}
        {/* Suppliers to Factory */}
        <path d="M100,100 C200,100 200,200 350,200" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M100,200 C200,200 200,200 350,200" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M100,300 C200,300 200,200 350,200" fill="none" stroke="#334155" strokeWidth="2" />

        {/* Factory to Hubs */}
        <path d="M450,200 C550,200 550,120 650,120" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M450,200 C550,200 550,280 650,280" fill="none" stroke="#334155" strokeWidth="2" />

        {/* Hubs to Customers */}
        <path d="M750,120 C850,120 850,100 900,100" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M750,120 C850,120 850,140 900,140" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M750,280 C850,280 850,260 900,260" fill="none" stroke="#334155" strokeWidth="2" />
        <path d="M750,280 C850,280 850,300 900,300" fill="none" stroke="#334155" strokeWidth="2" />

        {/* --- Layer 2: Animated Flow Packets --- */}
        <circle r="3" fill="#0ea5e9" filter="url(#glowChain)">
           <animateMotion dur="3s" repeatCount="indefinite" path="M100,100 C200,100 200,200 350,200" />
        </circle>
        <circle r="3" fill="#f59e0b" filter="url(#glowChain)">
           <animateMotion dur="4s" repeatCount="indefinite" path="M100,300 C200,300 200,200 350,200" />
        </circle>
        <circle r="4" fill="#10b981" filter="url(#glowChain)">
           <animateMotion dur="2.5s" repeatCount="indefinite" path="M450,200 C550,200 550,120 650,120" />
        </circle>
        
        {/* --- Layer 3: Nodes (HTML Overlay for interaction) --- */}
      </svg>
      
      {/* Interactive Nodes */}
      <div className="absolute top-[100px] left-[100px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
         <div className="w-10 h-10 bg-slate-900 border border-slate-600 rounded flex items-center justify-center group-hover:border-cyan-500 transition-colors">
            <Anchor size={16} className="text-slate-400 group-hover:text-cyan-400" />
         </div>
         <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 whitespace-nowrap">Tier 1 Supply</div>
      </div>
      
      <div className="absolute top-[300px] left-[100px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
         <div className="w-10 h-10 bg-slate-900 border border-slate-600 rounded flex items-center justify-center group-hover:border-amber-500 transition-colors">
            <Layers size={16} className="text-slate-400 group-hover:text-amber-400" />
         </div>
         <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 whitespace-nowrap">Tier 2 Supply</div>
      </div>

      <div className="absolute top-[200px] left-[400px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
         <div className="w-16 h-16 bg-[#0b1221] border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] z-10">
            <Factory size={24} className="text-white" />
         </div>
         <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded font-bold whitespace-nowrap">
            Smart Factory
         </div>
      </div>

      <div className="absolute top-[120px] left-[650px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
         <div className="w-12 h-12 bg-slate-900 border border-slate-600 rounded flex items-center justify-center group-hover:border-green-500 transition-colors">
            <Package size={20} className="text-slate-400 group-hover:text-green-400" />
         </div>
         <div className="absolute top-14 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 whitespace-nowrap">Dist. Hub North</div>
      </div>

      <div className="absolute top-[280px] left-[650px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
         <div className="w-12 h-12 bg-slate-900 border border-slate-600 rounded flex items-center justify-center group-hover:border-green-500 transition-colors">
            <Package size={20} className="text-slate-400 group-hover:text-green-400" />
         </div>
         <div className="absolute top-14 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 whitespace-nowrap">Dist. Hub South</div>
      </div>

      <div className="absolute top-[100px] left-[900px] -translate-x-1/2 -translate-y-1/2">
         <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-500 flex items-center justify-center text-xs font-bold text-cyan-200">C1</div>
      </div>
      <div className="absolute top-[140px] left-[900px] -translate-x-1/2 -translate-y-1/2">
         <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400">C2</div>
      </div>
      
    </div>
  );
};

export const CustomerSupplyChainView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & KPI Deck */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
           <div>
             <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
                <Network size={14} /> Supply Chain Orchestration
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                供应链与客户数据 <span className="text-cyan-500">协同管理中枢</span>
             </h1>
           </div>
           <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500 text-indigo-300 rounded text-xs hover:bg-indigo-600/40 transition-colors flex items-center gap-2">
                 <GitPullRequest size={14} /> CPFR 协同计划
              </button>
              <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold shadow-lg transition-colors flex items-center gap-2">
                 <Zap size={14} /> JIT 触发
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {KPI_STATS.map((kpi, i) => (
             <div key={i} className="bg-[#0b101e] border border-slate-800 p-3 rounded flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                <div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{kpi.label}</div>
                   <div className="text-2xl font-mono font-bold text-white">{kpi.value}</div>
                   <div className={`text-[10px] mt-1 font-bold`} style={{color: kpi.color}}>
                      {kpi.trend}
                   </div>
                </div>
                <div className="h-8 w-1 rounded-full opacity-50" style={{backgroundColor: kpi.color}}></div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Demand Sensing */}
        <div className="w-full lg:w-[340px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Demand Forecast */}
           <SciFiCard title="客户需求感知 (Demand Sensing)" subtitle="ORDERS vs FORECAST" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col h-full">
                   <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={DEMAND_VS_SUPPLY} margin={{top:10, right:0, left:-20, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1'}} />
                               <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                               <Area type="monotone" dataKey="demand" name="Customer Demand" stroke="#6366f1" fill="url(#colorDemand)" />
                               <Line type="monotone" dataKey="supply" name="Supply Cap" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="3 3"/>
                               <Bar dataKey="backlog" name="Backlog" barSize={10} fill="#ef4444" />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="mt-4 space-y-3">
                       <div className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs text-red-300 font-bold flex items-center gap-2">
                                   <Activity size={12}/> Demand Spike
                               </span>
                               <span className="text-[10px] text-red-400">Week 6</span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight">
                               Unexpected +20% order volume from Customer "Pacific Power". Suggest initiating overtime shift.
                           </p>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Collaborative Events */}
           <SciFiCard title="协同事件流 (Event Stream)" subtitle="INTERACTIONS" className="h-[300px] border-slate-800">
               <div className="flex flex-col gap-2 overflow-y-auto h-full custom-scrollbar pr-1">
                   {COLLABORATION_EVENTS.map(evt => (
                       <div key={evt.id} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded flex flex-col gap-1 hover:border-cyan-500/30 transition-colors">
                           <div className="flex justify-between items-start">
                               <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                                   ${evt.status === 'Critical' ? 'bg-red-900/30 text-red-400' : 
                                     evt.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}
                               `}>
                                   {evt.type}
                               </span>
                               <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                           </div>
                           <div className="text-xs font-bold text-slate-200">{evt.desc}</div>
                           <div className="text-[10px] text-cyan-500 flex items-center gap-1">
                               <Share2 size={10} /> {evt.source}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Neural Network */}
        <div className="flex-1 flex flex-col gap-6">
           
           {/* Flow Map */}
           <SciFiCard title="供应链全景流 (Value Stream)" subtitle="LIVE TRACKING" className="flex-1 border-indigo-900/50 bg-[#020408]" noPadding>
               <div className="w-full h-full relative p-2 flex flex-col">
                   {/* Legend Overlay */}
                   <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-black/60 p-2 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-[#0ea5e9] shadow-[0_0_5px_#0ea5e9]"></div> Normal Flow
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]"></div> Buffer Low
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400">
                           <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]"></div> Completed
                       </div>
                   </div>
                   
                   <div className="flex-1">
                       <SupplyChainFlowMap />
                   </div>

                   {/* Quick Status Bar */}
                   <div className="h-12 bg-[#0b101e] border-t border-slate-800 flex items-center justify-between px-6">
                       <div className="flex items-center gap-4">
                           <span className="text-xs text-slate-400 flex items-center gap-2"><Truck size={14}/> Logistics: <span className="text-green-400 font-bold">On Time</span></span>
                           <div className="h-4 w-px bg-slate-700"></div>
                           <span className="text-xs text-slate-400 flex items-center gap-2"><Factory size={14}/> Production: <span className="text-yellow-400 font-bold">92% Cap</span></span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-cyan-400 cursor-pointer hover:text-white">
                           View Detail Map <ArrowRight size={14} />
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Material Traceability (Horizontal) */}
           <SciFiCard title="物料追溯与批次管理" subtitle="TRACEABILITY" className="h-[180px] border-slate-800">
               <div className="flex items-center justify-between h-full px-4 gap-4">
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
                           <Database size={24} />
                       </div>
                       <span className="text-[10px] text-slate-500 uppercase">Raw Mat</span>
                       <span className="text-xs font-bold text-white">Batch #RM-092</span>
                   </div>
                   <ArrowRight size={20} className="text-slate-600" />
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 rounded bg-indigo-900/30 border border-indigo-500 flex items-center justify-center text-indigo-400">
                           <RefreshCw size={24} className="animate-spin" style={{animationDuration:'10s'}}/>
                       </div>
                       <span className="text-[10px] text-indigo-400 uppercase">Processing</span>
                       <span className="text-xs font-bold text-white">Line A-2</span>
                   </div>
                   <ArrowRight size={20} className="text-slate-600" />
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
                           <Package size={24} />
                       </div>
                       <span className="text-[10px] text-slate-500 uppercase">Finished</span>
                       <span className="text-xs font-bold text-white">Pending QC</span>
                   </div>
                   <div className="h-full w-px bg-slate-800 mx-4"></div>
                   <div className="flex-1 bg-slate-900/50 p-3 rounded text-xs text-slate-400 leading-relaxed border border-slate-800">
                       <strong className="text-white block mb-1">Genealogy Record:</strong>
                       Linked to Customer Order <span className="text-cyan-400 font-mono">PO-2024-8842</span>. 
                       Supplier Cert: <span className="text-green-400">Verified</span>.
                       Exp Delivery: 24h.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Supplier & Risk */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Supplier Risk Matrix */}
           <SciFiCard title="供应商风险矩阵" subtitle="SUPPLY SHOCK" className="border-red-900/30">
               <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="risk" name="Risk Prob." stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Probability', position: 'insideBottom', offset: -5, fontSize: 10 }} domain={[0, 100]} />
                           <YAxis type="number" dataKey="impact" name="Impact" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Impact', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 100]} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#fff'}} />
                           <Scatter name="Suppliers" data={SUPPLIER_RISK} fill="#ef4444">
                               {SUPPLIER_RISK.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.risk > 70 && entry.impact > 70 ? '#ef4444' : entry.risk < 30 ? '#10b981' : '#f59e0b'} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
               <div className="mt-2 text-center">
                   <span className="text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-800">
                       High Risk: Raw Material A (Geopolitical)
                   </span>
               </div>
           </SciFiCard>

           {/* Bullwhip Effect Monitor */}
           <SciFiCard title="牛鞭效应监测 (Bullwhip)" subtitle="VOLATILITY" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-4 h-full">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Demand Amplification</span>
                       <span className="text-yellow-400 font-bold">1.45x</span>
                   </div>
                   
                   <div className="relative h-32 w-full border-b border-slate-700">
                       {/* Simplified Wave Viz */}
                       <svg className="w-full h-full absolute bottom-0" preserveAspectRatio="none">
                           <path d="M0,80 Q50,70 100,80 T200,80 T300,80" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
                           <path d="M0,80 Q50,50 100,80 T200,80 T300,80" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.7" />
                           <path d="M0,80 Q50,20 100,80 T200,80 T300,80" fill="none" stroke="#f59e0b" strokeWidth="2" />
                       </svg>
                       <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                           <span className="text-[8px] text-purple-400">--- Customer</span>
                           <span className="text-[8px] text-cyan-400">--- Distributor</span>
                           <span className="text-[8px] text-yellow-400">--- Factory</span>
                       </div>
                   </div>

                   <div className="mt-auto p-3 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-300 leading-relaxed">
                       <div className="flex items-center gap-1 text-yellow-400 font-bold mb-1"><AlertTriangle size={10}/> Optimization Tip</div>
                       Inventory buffer at Hub North is excessive (+25%). Suggest reducing safety stock based on Q2 forecast.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
