
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Box, ShoppingCart, TrendingUp, AlertTriangle, 
  Package, Search, Filter, RefreshCcw, Truck, 
  History, BarChart3, Zap, Layers, ArrowRight,
  ClipboardList, Binary, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, ReferenceLine, ComposedChart, Line
} from 'recharts';

// --- Types ---

interface PartRecord {
  id: string;
  name: string;
  category: 'Consumable' | 'WearPart' | 'CriticalSpare';
  stockLevel: number;
  minStock: number;
  maxStock: number;
  monthlyUsage: number;
  lastRestock: string;
  unitPrice: number;
  status: 'Healthy' | 'Low' | 'Critical' | 'Overstock';
}

interface ConsumptionHistory {
  month: string;
  actual: number;
  predicted: number;
  limit: number;
}

// --- Mock Data ---

const CUSTOMER_LIST = [
  { id: 'C-001', name: 'Shanghai Heavy Industries' },
  { id: 'C-002', name: 'Pacific Power Group' },
  { id: 'C-003', name: 'AutoWorks GmbH' },
];

const PARTS_DATA: PartRecord[] = [
  { id: 'P-FIL-001', name: 'Hydraulic Filter H20', category: 'Consumable', stockLevel: 45, minStock: 20, maxStock: 100, monthlyUsage: 15, lastRestock: '2024-02-15', unitPrice: 120, status: 'Healthy' },
  { id: 'P-BRG-204', name: 'SKF Bearing 6204', category: 'WearPart', stockLevel: 8, minStock: 10, maxStock: 50, monthlyUsage: 4, lastRestock: '2023-12-10', unitPrice: 850, status: 'Low' },
  { id: 'P-SEN-X12', name: 'Vibration Sensor', category: 'CriticalSpare', stockLevel: 2, minStock: 2, maxStock: 10, monthlyUsage: 0.5, lastRestock: '2023-06-01', unitPrice: 2400, status: 'Healthy' },
  { id: 'P-OIL-T46', name: 'Turbine Oil T46 (L)', category: 'Consumable', stockLevel: 1200, minStock: 500, maxStock: 2000, monthlyUsage: 200, lastRestock: '2024-03-01', unitPrice: 45, status: 'Healthy' },
  { id: 'P-BELT-V5', name: 'Drive Belt V500', category: 'WearPart', stockLevel: 0, minStock: 5, maxStock: 30, monthlyUsage: 2, lastRestock: '2023-11-20', unitPrice: 180, status: 'Critical' },
  { id: 'P-GSK-R90', name: 'Rubber Gasket Set', category: 'Consumable', stockLevel: 250, minStock: 50, maxStock: 200, monthlyUsage: 10, lastRestock: '2024-01-10', unitPrice: 15, status: 'Overstock' },
  { id: 'P-MOD-IO', name: 'PLC I/O Module', category: 'CriticalSpare', stockLevel: 3, minStock: 1, maxStock: 5, monthlyUsage: 0.2, lastRestock: '2022-08-15', unitPrice: 5600, status: 'Healthy' },
  { id: 'P-VAL-S04', name: 'Solenoid Valve', category: 'WearPart', stockLevel: 12, minStock: 15, maxStock: 40, monthlyUsage: 3, lastRestock: '2023-10-05', unitPrice: 620, status: 'Low' },
];

const PREDICTION_DATA: ConsumptionHistory[] = [
  { month: 'Oct', actual: 4200, predicted: 4000, limit: 6000 },
  { month: 'Nov', actual: 4500, predicted: 4300, limit: 6000 },
  { month: 'Dec', actual: 5100, predicted: 4800, limit: 6000 },
  { month: 'Jan', actual: 3800, predicted: 4100, limit: 6000 },
  { month: 'Feb', actual: 3600, predicted: 3700, limit: 6000 },
  { month: 'Mar', actual: 4800, predicted: 4200, limit: 6000 },
  { month: 'Apr', actual: 0, predicted: 4600, limit: 6000 }, // Future
  { month: 'May', actual: 0, predicted: 4900, limit: 6000 }, // Future
];

const COST_DISTRIBUTION = [
  { name: 'Consumables', value: 45, color: '#0ea5e9' },
  { name: 'Wear Parts', value: 35, color: '#f59e0b' },
  { name: 'Critical Spares', value: 20, color: '#8b5cf6' },
];

// --- Helper Components ---

const StockStatusCell: React.FC<{ part: PartRecord }> = ({ part }) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'Low': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'Critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'Overstock': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const fillPercent = Math.min(100, (part.stockLevel / part.maxStock) * 100);

  return (
    <div className={`relative p-3 rounded border flex flex-col justify-between h-24 hover:scale-105 transition-transform cursor-pointer group overflow-hidden ${getColor(part.status)}`}>
      {/* Background Fill Level */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-current opacity-10 transition-all duration-500" 
        style={{ height: `${fillPercent}%` }}
      ></div>

      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] font-bold uppercase opacity-80">{part.id}</span>
        {part.status === 'Critical' && <AlertTriangle size={12} className="animate-pulse" />}
      </div>
      
      <div className="relative z-10">
        <div className="text-sm font-bold truncate text-white" title={part.name}>{part.name}</div>
        <div className="flex justify-between items-end mt-1">
          <span className="text-xs font-mono">{part.stockLevel} <span className="text-[9px] opacity-60">/ {part.maxStock}</span></span>
          <span className="text-[9px] opacity-70">{part.category}</span>
        </div>
      </div>
    </div>
  );
};

export const CustomerPartsView: React.FC = () => {
  const [selectedCust, setSelectedCust] = useState(CUSTOMER_LIST[0].id);
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#120a2e] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <Box size={14} /> Supply Chain Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             备件与耗材 <span className="text-purple-500">消耗画像</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            {/* Customer Selector */}
            <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
               {CUSTOMER_LIST.map(c => (
                 <button 
                   key={c.id}
                   onClick={() => setSelectedCust(c.id)}
                   className={`px-3 py-1.5 rounded text-xs font-bold transition-all
                     ${selectedCust === c.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}
                   `}
                 >
                   {c.name}
                 </button>
               ))}
            </div>
            
            <div className="h-8 w-px bg-slate-700"></div>

            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Annual Spend</div>
                <div className="text-xl font-mono font-bold text-white">$ 425.8k</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Turnover Rate</div>
                <div className="text-xl font-mono font-bold text-green-400">4.2x</div>
            </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        
        {/* LEFT: Charts & Analysis (Col 4) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Spend Analysis */}
           <SciFiCard title="消耗成本分布" subtitle="YTD COST" className="border-purple-900/50">
               <div className="h-48 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={COST_DISTRIBUTION} 
                             innerRadius={40} 
                             outerRadius={60} 
                             paddingAngle={5} 
                             dataKey="value"
                           >
                               {COST_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-xs font-bold text-slate-500">100%</span>
                   </div>
               </div>
               <div className="space-y-2 px-2">
                   {COST_DISTRIBUTION.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                               <span className="text-slate-300">{item.name}</span>
                           </div>
                           <span className="font-mono text-white">{item.value}%</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Health KPI */}
           <SciFiCard title="库存健康度" className="border-slate-800">
               <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                       <div className="text-xs text-slate-400">Availability</div>
                       <div className="text-xl font-bold text-green-400">98.5%</div>
                   </div>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="bg-green-500 h-full w-[98.5%]"></div>
                   </div>

                   <div className="flex justify-between items-center">
                       <div className="text-xs text-slate-400">Stockout Risk</div>
                       <div className="text-xl font-bold text-red-400">High</div>
                   </div>
                   <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-[10px] text-red-300 flex gap-2 items-center">
                       <AlertTriangle size={12} /> 2 Critical Spares below min level
                   </div>
               </div>
           </SciFiCard>

           {/* Quick Actions */}
           <div className="bg-slate-900/50 p-4 rounded border border-slate-700 flex flex-col gap-2">
               <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2">
                   <ShoppingCart size={14} /> Generate Restock Order
               </button>
               <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                   <FileText size={14} /> Download Usage Report
               </button>
           </div>

        </div>

        {/* CENTER: Virtual Warehouse (Col 6) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
           
           {/* Visual Grid Header */}
           <div className="flex justify-between items-center bg-[#0f0a1e] p-3 rounded border border-purple-900/30">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-900/20 rounded text-purple-400"><Layers size={18} /></div>
                   <div>
                       <h3 className="text-sm font-bold text-white">Site Inventory Matrix</h3>
                       <div className="text-[10px] text-slate-500">Virtual Representation of Customer Stock</div>
                   </div>
               </div>
               <div className="flex gap-2">
                   <span className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded bg-emerald-500/50"></div> Healthy</span>
                   <span className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded bg-red-500/50"></div> Critical</span>
               </div>
           </div>

           {/* The Grid */}
           <div className="flex-1 bg-[#0b0814] border border-slate-800 rounded p-4 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                   {PARTS_DATA.map((part) => (
                       <StockStatusCell key={part.id} part={part} />
                   ))}
                   {/* Placeholder Empty Slots for visual effect */}
                   {Array.from({length: 4}).map((_, i) => (
                       <div key={`empty-${i}`} className="p-3 rounded border border-slate-800 border-dashed flex items-center justify-center opacity-30">
                           <span className="text-xs text-slate-600">Empty Slot</span>
                       </div>
                   ))}
               </div>
           </div>

           {/* Consumption Trend Chart */}
           <SciFiCard title="消耗预测与补货建议" subtitle="AI PREDICTION" className="h-64 border-purple-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={PREDICTION_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                           <defs>
                               <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}/>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                           <ReferenceLine x="Mar" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Current', fill: '#f59e0b', fontSize: 10, position: 'insideTop' }} />
                           
                           {/* Actual Data */}
                           <Area type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorCons)" name="Actual Spend" />
                           {/* Predicted Data (Dotted) */}
                           <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Prediction" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Lists & Logs (Col 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* Top Consumers */}
           <SciFiCard title="消耗排行 (Top 5)" subtitle="QTY" className="border-slate-800">
               <div className="flex flex-col gap-3">
                   {PARTS_DATA.sort((a,b) => b.monthlyUsage * b.unitPrice - a.monthlyUsage * a.unitPrice).slice(0, 5).map((part, i) => (
                       <div key={i} className="flex items-center gap-3 border-b border-slate-800 pb-2 last:border-0">
                           <div className="text-lg font-bold text-slate-600 w-4">0{i+1}</div>
                           <div className="flex-1 min-w-0">
                               <div className="text-xs font-bold text-slate-200 truncate">{part.name}</div>
                               <div className="text-[10px] text-slate-500">{part.category}</div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs font-mono text-purple-300">$ {part.monthlyUsage * part.unitPrice}</div>
                               <div className="text-[10px] text-slate-500">{part.monthlyUsage} units/mo</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Transaction Stream */}
           <SciFiCard title="最近领用记录" subtitle="LOGS" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar max-h-[300px]">
                   {[
                       { time: '10:42 AM', user: 'Li Wei', part: 'Hydraulic Filter', qty: 2, type: 'Maint' },
                       { time: '09:15 AM', user: 'Zhang H.', part: 'Turbine Oil', qty: 50, type: 'Refill' },
                       { time: 'Yesterday', user: 'System', part: 'Gasket Set', qty: 5, type: 'Auto' },
                       { time: 'Mar 12', user: 'Wang D.', part: 'Solenoid Valve', qty: 1, type: 'Repair' },
                       { time: 'Mar 10', user: 'Li Wei', part: 'Drive Belt', qty: 2, type: 'Maint' },
                   ].map((log, i) => (
                       <div key={i} className="bg-slate-900/40 p-2 rounded border border-slate-800 text-xs">
                           <div className="flex justify-between text-slate-500 mb-1">
                               <span>{log.time}</span>
                               <span className="uppercase">{log.type}</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-slate-200 font-bold">{log.part}</span>
                               <span className="text-purple-400 font-mono">x{log.qty}</span>
                           </div>
                           <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                               <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px]">{log.user.charAt(0)}</div>
                               {log.user}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
