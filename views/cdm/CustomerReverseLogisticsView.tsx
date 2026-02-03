
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  RotateCcw, Truck, ClipboardCheck, Wrench, 
  Trash2, Recycle, AlertTriangle, Search, 
  Filter, CheckCircle2, XCircle, ArrowLeft,
  PackageX, ScanLine, Scale, DollarSign,
  History, Workflow, RefreshCw, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, Sankey
} from 'recharts';

// --- Types ---

type Disposition = 'Restock' | 'Repair' | 'Refurbish' | 'Recycle' | 'Scrap';
type RMAStatus = 'Pending' | 'In-Transit' | 'Inspecting' | 'Processing' | 'Closed';

interface RMARecord {
  id: string;
  customer: string;
  product: string;
  reason: string;
  status: RMAStatus;
  disposition?: Disposition;
  requestDate: string;
  value: number; // Original Value
  recoveryValue: number; // Estimated Recovery
  serialNum: string;
  qcResult?: string;
}

// --- Mock Data ---

const RMA_LIST: RMARecord[] = [
  { id: 'RMA-2403-001', customer: 'Shanghai Heavy Ind.', product: 'Hydraulic Pump H-500', reason: 'Defective (Leak)', status: 'Inspecting', requestDate: '2024-03-20', value: 12000, recoveryValue: 8000, serialNum: 'SN-99821-X', qcResult: 'Seal Failure' },
  { id: 'RMA-2403-005', customer: 'Pacific Power', product: 'Control Module V2', reason: 'Wrong Item Sent', status: 'Processing', disposition: 'Restock', requestDate: '2024-03-19', value: 5400, recoveryValue: 5400, serialNum: 'SN-11029-A', qcResult: 'Unopened' },
  { id: 'RMA-2403-012', customer: 'AutoWorks GmbH', product: 'Servo Motor M20', reason: 'Performance Issue', status: 'In-Transit', requestDate: '2024-03-18', value: 3500, recoveryValue: 0, serialNum: 'SN-33921-B' },
  { id: 'RMA-2403-018', customer: 'Quantum Tech', product: 'Sensor Pack Pro', reason: 'Damaged in Transit', status: 'Closed', disposition: 'Scrap', requestDate: '2024-03-15', value: 1200, recoveryValue: 50, serialNum: 'SN-77210-S', qcResult: 'Crushed' },
  { id: 'RMA-2403-022', customer: 'North Star Mining', product: 'Conveyor Belt Segment', reason: 'Order Cancelled', status: 'Pending', requestDate: '2024-03-21', value: 8500, recoveryValue: 0, serialNum: 'SN-55102-M' },
];

const DISPOSITION_DATA = [
  { name: 'Restock (重新入库)', value: 45, fill: '#10b981' }, // Green
  { name: 'Repair (维修返还)', value: 25, fill: '#3b82f6' }, // Blue
  { name: 'Refurbish (翻新)', value: 15, fill: '#f59e0b' }, // Amber
  { name: 'Recycle (回收)', value: 10, fill: '#8b5cf6' }, // Purple
  { name: 'Scrap (报废)', value: 5, fill: '#ef4444' }, // Red
];

const REASON_STATS = [
  { reason: 'Product Defect', count: 42 },
  { reason: 'Shipping Damage', count: 18 },
  { reason: 'Wrong Item', count: 15 },
  { reason: 'Customer Error', count: 12 },
  { reason: 'Out of Warranty', count: 8 },
];

const COST_RECOVERY_TREND = [
  { month: 'Oct', cost: 50000, recovered: 32000 },
  { month: 'Nov', cost: 48000, recovered: 35000 },
  { month: 'Dec', cost: 62000, recovered: 40000 },
  { month: 'Jan', cost: 45000, recovered: 38000 },
  { month: 'Feb', cost: 55000, recovered: 42000 },
  { month: 'Mar', cost: 51000, recovered: 45000 },
];

// --- Components ---

const StatusBadge = ({ status }: { status: RMAStatus }) => {
  const styles = {
    'Pending': 'bg-slate-800 text-slate-400 border-slate-600',
    'In-Transit': 'bg-blue-900/30 text-blue-400 border-blue-600',
    'Inspecting': 'bg-amber-900/30 text-amber-400 border-amber-600 animate-pulse',
    'Processing': 'bg-purple-900/30 text-purple-400 border-purple-600',
    'Closed': 'bg-green-900/30 text-green-400 border-green-600',
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const DispositionIcon = ({ type }: { type?: Disposition }) => {
  switch(type) {
    case 'Restock': return <PackageX size={16} className="text-green-500" />;
    case 'Repair': return <Wrench size={16} className="text-blue-500" />;
    case 'Refurbish': return <RefreshCw size={16} className="text-amber-500" />;
    case 'Recycle': return <Recycle size={16} className="text-purple-500" />;
    case 'Scrap': return <Trash2 size={16} className="text-red-500" />;
    default: return <AlertTriangle size={16} className="text-slate-500" />;
  }
};

const ProcessStep = ({ label, active, completed, icon: Icon }: any) => (
  <div className={`flex flex-col items-center gap-2 relative z-10 ${active ? 'scale-110' : ''}`}>
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
      ${active ? 'bg-orange-500 border-orange-300 text-white shadow-[0_0_15px_#f97316]' : 
        completed ? 'bg-slate-800 border-orange-700/50 text-orange-600' : 'bg-slate-900 border-slate-700 text-slate-600'}
    `}>
      <Icon size={18} />
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-orange-400' : 'text-slate-500'}`}>
      {label}
    </span>
  </div>
);

export const CustomerReverseLogisticsView: React.FC = () => {
  const [selectedRMA, setSelectedRMA] = useState(RMA_LIST[0].id);
  const activeRecord = RMA_LIST.find(r => r.id === selectedRMA) || RMA_LIST[0];

  // Determine active step index
  const getStepIndex = (status: RMAStatus) => {
    switch(status) {
      case 'Pending': return 0;
      case 'In-Transit': return 1;
      case 'Inspecting': return 2;
      case 'Processing': return 3;
      case 'Closed': return 4;
      default: return 0;
    }
  };
  const currentStep = getStepIndex(activeRecord.status);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-orange-900/50 pb-4 bg-gradient-to-r from-[#1f1005] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-1 uppercase tracking-wider">
             <RotateCcw size={14} /> Reverse Supply Chain
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户退换货 <span className="text-orange-500">与逆向物流管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Pending RMA</div>
                <div className="text-xl font-mono font-bold text-white">24</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Avg Process Time</div>
                <div className="text-xl font-mono font-bold text-cyan-400">4.5 Days</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Value Recovered</div>
                <div className="text-xl font-mono font-bold text-green-400">$ 452K</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: RMA Queue */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search RMA / Serial..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-orange-500 text-slate-200"
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {RMA_LIST.map(rma => (
                   <div 
                     key={rma.id}
                     onClick={() => setSelectedRMA(rma.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedRMA === rma.id 
                            ? 'bg-orange-950/20 border-orange-500/50 shadow-[inset_4px_0_0_#f97316]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{rma.id}</span>
                           <StatusBadge status={rma.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedRMA === rma.id ? 'text-white' : 'text-slate-300'}`}>
                           {rma.product}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-2 truncate">{rma.customer}</div>

                       <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-800/50">
                           <span className="text-red-300 flex items-center gap-1"><AlertTriangle size={10}/> {rma.reason}</span>
                           <span className="text-slate-500">{rma.requestDate}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Processing Pipeline */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Pipeline Visualizer */}
           <SciFiCard title="逆向处置流程 (Processing Pipeline)" subtitle="LIFECYCLE" className="h-[220px] border-orange-900/50 bg-[#0c0a06]" noPadding>
               <div className="w-full h-full p-6 flex flex-col justify-center relative">
                   {/* Connecting Line */}
                   <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-800 -z-0 rounded">
                       <div 
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000" 
                          style={{width: `${(currentStep / 4) * 100}%`}}
                       ></div>
                   </div>

                   <div className="flex justify-between items-center relative z-10">
                       <ProcessStep label="Created" active={currentStep === 0} completed={currentStep > 0} icon={FileText} />
                       <ProcessStep label="Logistics" active={currentStep === 1} completed={currentStep > 1} icon={Truck} />
                       <ProcessStep label="Inspection" active={currentStep === 2} completed={currentStep > 2} icon={ScanLine} />
                       <ProcessStep label="Decision" active={currentStep === 3} completed={currentStep > 3} icon={Scale} />
                       <ProcessStep label="Closed" active={currentStep === 4} completed={currentStep > 4} icon={CheckCircle2} />
                   </div>
               </div>
           </SciFiCard>

           {/* Inspection & Disposition Detail */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
               
               {/* QC / Inspection Panel */}
               <SciFiCard title="质检与鉴定 (Inspection)" subtitle="QC REPORT" className="border-slate-800">
                   <div className="flex flex-col h-full gap-4">
                       <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded">
                           <div className="p-2 bg-slate-800 rounded text-slate-300">
                               <ClipboardCheck size={20} />
                           </div>
                           <div>
                               <div className="text-xs text-slate-500 uppercase">Serial Number</div>
                               <div className="text-sm font-mono font-bold text-white">{activeRecord.serialNum}</div>
                           </div>
                           <div className="ml-auto text-right">
                               <div className="text-[10px] text-slate-500">QC Status</div>
                               <div className="text-xs font-bold text-orange-400">{activeRecord.qcResult || 'Pending'}</div>
                           </div>
                       </div>

                       <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded p-2 overflow-y-auto">
                           <div className="text-xs text-slate-400 mb-2">Checklist:</div>
                           <div className="space-y-2">
                               <div className="flex items-center gap-2 text-xs">
                                   {activeRecord.status === 'Inspecting' ? <div className="w-3 h-3 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"/> : <CheckCircle2 size={12} className="text-green-500"/>}
                                   <span className="text-slate-300">Visual Damage Check</span>
                               </div>
                               <div className="flex items-center gap-2 text-xs">
                                   <div className={`w-3 h-3 border rounded-full ${currentStep >= 3 ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}></div>
                                   <span className="text-slate-300">Functional Test</span>
                               </div>
                               <div className="flex items-center gap-2 text-xs">
                                   <div className={`w-3 h-3 border rounded-full ${currentStep >= 3 ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}></div>
                                   <span className="text-slate-300">Warranty Validation</span>
                               </div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Disposition Decision */}
               <SciFiCard title="处置决策 (Disposition)" subtitle="ACTION" className="border-slate-800">
                   <div className="flex flex-col h-full gap-4 justify-center items-center">
                       {activeRecord.disposition ? (
                           <div className="text-center animate-in fade-in zoom-in duration-500">
                               <div className="mb-2 inline-block p-4 rounded-full bg-slate-900 border-2 border-slate-700">
                                   <DispositionIcon type={activeRecord.disposition} />
                               </div>
                               <div className="text-lg font-bold text-white">{activeRecord.disposition}</div>
                               <div className="text-xs text-slate-500">Assigned Action</div>
                           </div>
                       ) : (
                           <div className="text-center text-slate-500 text-xs">
                               <AlertTriangle size={32} className="mx-auto mb-2 opacity-50"/>
                               Awaiting Inspection Result
                           </div>
                       )}

                       {/* Recovery Calculator */}
                       <div className="w-full bg-slate-900/50 p-3 rounded border border-slate-700 mt-auto">
                           <div className="flex justify-between text-xs text-slate-400 mb-1">
                               <span>Original Value</span>
                               <span className="line-through decoration-slate-600">$ {activeRecord.value}</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-slate-200">Recoverable Value</span>
                               <span className="text-lg font-mono font-bold text-green-400">$ {activeRecord.recoveryValue}</span>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Analytics & Recovery */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Disposition Stats */}
           <SciFiCard title="处置方式分布" subtitle="OUTCOME" className="border-orange-900/30">
               <div className="h-48 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={DISPOSITION_DATA} 
                             innerRadius={40} 
                             outerRadius={60} 
                             paddingAngle={5} 
                             dataKey="value"
                           >
                               {DISPOSITION_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a05', borderColor: '#f97316', color: '#fff'}} />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                       <span className="text-2xl font-bold text-white">85%</span>
                       <span className="text-[9px] text-slate-500 uppercase">Recovery Rate</span>
                   </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                   {DISPOSITION_DATA.map((d, i) => (
                       <div key={i} className="flex items-center gap-1">
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                           <span>{d.name.split(' ')[0]}</span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Cost Trend */}
           <SciFiCard title="退货成本 vs 回收价值" subtitle="FINANCIALS" className="border-slate-800">
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COST_RECOVERY_TREND}>
                           <defs>
                               <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a05', borderColor: '#f97316'}} />
                           <Area type="monotone" dataKey="recovered" stroke="#10b981" fill="url(#colorRec)" name="Recovered" />
                           <Area type="monotone" dataKey="cost" stroke="#ef4444" fill="none" name="Cost" strokeDasharray="3 3" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Return Reasons (Pareto) */}
           <SciFiCard title="退货原因分析" subtitle="PARETO" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar max-h-[200px]">
                   {REASON_STATS.map((item, i) => (
                       <div key={i} className="flex flex-col gap-1">
                           <div className="flex justify-between text-xs">
                               <span className="text-slate-300">{item.reason}</span>
                               <span className="text-slate-500">{item.count}</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-orange-600" 
                                 style={{width: `${(item.count / 50) * 100}%`}}
                               ></div>
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
