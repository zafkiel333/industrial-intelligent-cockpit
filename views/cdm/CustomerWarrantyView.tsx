
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Shield, Calendar, Clock, Wrench, 
  FileText, Search, Filter, CheckCircle2, 
  AlertTriangle, XCircle, MoreHorizontal,
  RefreshCw, Award, Zap, History,
  ArrowRight, ShieldCheck, HeartPulse,
  Plus
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- Types ---

interface WarrantyPlan {
  id: string;
  name: string;
  type: 'Standard' | 'Premium' | 'Extended';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Expired';
  coverage: string[]; // e.g., "Parts", "Labor", "Software"
  slaResponse: number; // hours
  assetsCovered: number;
}

interface MaintenanceTask {
  id: string;
  date: string;
  type: 'Preventive' | 'Corrective' | 'Inspection';
  status: 'Scheduled' | 'Completed' | 'Overdue';
  description: string;
  technician?: string;
}

interface CustomerWarrantyProfile {
  id: string;
  customerName: string;
  contractId: string;
  activePlan: WarrantyPlan;
  assetHealth: number; // 0-100 aggregate
  nextMaintenance: string;
  tasks: MaintenanceTask[];
}

// --- Mock Data ---

const CUSTOMER_WARRANTIES: CustomerWarrantyProfile[] = [
  {
    id: 'C-001',
    customerName: 'Shanghai Heavy Industries',
    contractId: 'CTR-2022-W01',
    activePlan: {
      id: 'PLN-PLATINUM',
      name: 'Platinum Care 5Y',
      type: 'Premium',
      startDate: '2022-01-01',
      endDate: '2027-01-01',
      status: 'Active',
      coverage: ['Parts', 'Labor', 'Remote', 'On-site'],
      slaResponse: 4,
      assetsCovered: 12
    },
    assetHealth: 94,
    nextMaintenance: '2024-04-15',
    tasks: [
      { id: 'T-101', date: '2024-04-15', type: 'Preventive', status: 'Scheduled', description: 'Annual System Calibration' },
      { id: 'T-100', date: '2024-01-10', type: 'Inspection', status: 'Completed', description: 'Q1 Routine Check', technician: 'Wang Eng.' },
      { id: 'T-099', date: '2023-11-05', type: 'Corrective', status: 'Completed', description: 'Replace Filter Unit B' },
    ]
  },
  {
    id: 'C-002',
    customerName: 'Pacific Power Group',
    contractId: 'CTR-2020-W05',
    activePlan: {
      id: 'PLN-STD',
      name: 'Standard Warranty',
      type: 'Standard',
      startDate: '2020-06-01',
      endDate: '2024-06-01',
      status: 'Expiring',
      coverage: ['Parts', 'Labor'],
      slaResponse: 24,
      assetsCovered: 45
    },
    assetHealth: 88,
    nextMaintenance: '2024-03-25',
    tasks: [
      { id: 'T-202', date: '2024-03-25', type: 'Preventive', status: 'Scheduled', description: 'End-of-Warranty Inspection' },
      { id: 'T-201', date: '2023-12-15', type: 'Inspection', status: 'Completed', description: 'Winter Season Prep' },
    ]
  },
  {
    id: 'C-003',
    customerName: 'AutoWorks GmbH',
    contractId: 'CTR-2023-W12',
    activePlan: {
      id: 'PLN-EXT',
      name: 'Extended Drive Train',
      type: 'Extended',
      startDate: '2023-01-01',
      endDate: '2026-01-01',
      status: 'Active',
      coverage: ['Parts Only', 'Remote'],
      slaResponse: 48,
      assetsCovered: 8
    },
    assetHealth: 98,
    nextMaintenance: '2024-06-01',
    tasks: [
      { id: 'T-301', date: '2024-06-01', type: 'Preventive', status: 'Scheduled', description: 'Software Firmware Upgrade' },
    ]
  }
];

const ASSET_LIST = [
  { id: 'EQ-001', name: 'Gas Turbine Unit A', warranty: 85, status: 'Covered', type: 'Hardware' },
  { id: 'EQ-002', name: 'Gas Turbine Unit B', warranty: 85, status: 'Covered', type: 'Hardware' },
  { id: 'EQ-003', name: 'Control Panel Main', warranty: 60, status: 'Covered', type: 'Electronics' },
  { id: 'EQ-004', name: 'Auxiliary Pump Sys', warranty: 15, status: 'Expiring', type: 'Mechanical' },
  { id: 'EQ-005', name: 'Monitoring Software', warranty: 100, status: 'Subscribed', type: 'Software' },
];

const COST_DISTRIBUTION = [
  { name: 'Labor', value: 40 },
  { name: 'Parts', value: 35 },
  { name: 'Logistics', value: 15 },
  { name: 'Other', value: 10 },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Active': 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50',
    'Expiring': 'bg-amber-900/30 text-amber-400 border-amber-800/50 animate-pulse',
    'Expired': 'bg-red-900/30 text-red-400 border-red-800/50',
    'Scheduled': 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    'Completed': 'bg-slate-800 text-slate-400 border-slate-700',
    'Overdue': 'bg-red-900/30 text-red-400 border-red-800/50',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

const PlanTypeIcon = ({ type }: { type: string }) => {
  if (type === 'Premium') return <Award size={14} className="text-purple-400" />;
  if (type === 'Extended') return <ShieldCheck size={14} className="text-blue-400" />;
  return <Shield size={14} className="text-slate-400" />;
};

export const CustomerWarrantyView: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState(CUSTOMER_WARRANTIES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeProfile = CUSTOMER_WARRANTIES.find(p => p.id === selectedProfileId) || CUSTOMER_WARRANTIES[0];

  // Calculate remaining days roughly
  const today = new Date();
  const end = new Date(activeProfile.activePlan.endDate);
  const diffTime = Math.abs(end.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalDuration = 365 * 5; // Assuming 5 year max for bar calc
  const progress = Math.min(100, (diffDays / totalDuration) * 100);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#022c22] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <ShieldCheck size={14} /> Service Lifecycle Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             质保与维保 <span className="text-emerald-500">计划管理</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Active Plans</div>
                <div className="text-xl font-mono font-bold text-white">1,204</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Expiring (30d)</div>
                <div className="text-xl font-mono font-bold text-amber-400">12</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <Zap size={14} /> 快速续保
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Customer List */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Search */}
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex flex-col gap-2">
               {CUSTOMER_WARRANTIES.map(profile => (
                   <div 
                     key={profile.id}
                     onClick={() => setSelectedProfileId(profile.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedProfileId === profile.id 
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[inset_4px_0_0_#10b981]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{profile.contractId}</span>
                           <StatusBadge status={profile.activePlan.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedProfileId === profile.id ? 'text-white' : 'text-slate-300'}`}>
                           {profile.customerName}
                       </h3>
                       
                       <div className="flex justify-between items-end mt-2">
                           <div className="flex items-center gap-1.5 text-xs text-slate-400">
                               <PlanTypeIcon type={profile.activePlan.type} />
                               {profile.activePlan.name}
                           </div>
                           <div className="text-[10px] text-slate-500">
                               Next Svc: {profile.nextMaintenance}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Plan & Assets */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Top: Warranty Timeline Card */}
           <SciFiCard title="质保计划全景 (Warranty Landscape)" subtitle="TIMELINE" className="border-emerald-900/50 bg-[#061418]">
               <div className="flex flex-col gap-4 py-2">
                   
                   {/* Header Info */}
                   <div className="flex justify-between items-end">
                       <div>
                           <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                               {activeProfile.activePlan.name}
                               {activeProfile.activePlan.type === 'Premium' && <span className="bg-purple-900/30 text-purple-400 text-[10px] border border-purple-800 px-2 py-0.5 rounded">VIP</span>}
                           </div>
                           <div className="text-xs text-slate-400 font-mono">
                               Valid: {activeProfile.activePlan.startDate} ~ {activeProfile.activePlan.endDate}
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-3xl font-bold text-emerald-400">{diffDays}</div>
                           <div className="text-[10px] text-slate-500 uppercase">Days Remaining</div>
                       </div>
                   </div>

                   {/* Progress Bar Visualization */}
                   <div className="relative pt-4 pb-2">
                       <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                           {/* Elapsed Time */}
                           <div className="h-full bg-slate-600 opacity-30" style={{width: `${100-progress}%`}}></div>
                           {/* Remaining Time */}
                           <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{width: `${progress}%`}}></div>
                       </div>
                       {/* Markers */}
                       <div className="absolute top-0 left-0 text-[10px] text-slate-500 transform -translate-y-1/2">Start</div>
                       <div className="absolute top-0 right-0 text-[10px] text-slate-500 transform -translate-y-1/2">End</div>
                       <div className="absolute top-8 left-[30%] -translate-x-1/2 flex flex-col items-center">
                           <div className="w-0.5 h-3 bg-slate-600 mb-1"></div>
                           <span className="text-[9px] text-slate-500 uppercase">Year 1 Check</span>
                       </div>
                       <div className="absolute top-8 left-[60%] -translate-x-1/2 flex flex-col items-center">
                           <div className="w-0.5 h-3 bg-slate-600 mb-1"></div>
                           <span className="text-[9px] text-slate-500 uppercase">Mid-Term</span>
                       </div>
                   </div>

                   {/* Coverage Badges */}
                   <div className="flex gap-2 mt-2">
                       {activeProfile.activePlan.coverage.map((tag, i) => (
                           <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
                               <CheckCircle2 size={12} className="text-emerald-500" /> {tag}
                           </div>
                       ))}
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 ml-auto">
                           <Clock size={12} className="text-blue-400" /> SLA: {activeProfile.activePlan.slaResponse}h
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Middle: Asset Matrix */}
           <SciFiCard title="受保资产矩阵" subtitle="ASSET COVERAGE" className="border-slate-800">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {ASSET_LIST.map((asset, i) => (
                       <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-emerald-500/30 transition-colors group">
                           <div className="flex justify-between items-start mb-2">
                               <span className="text-[10px] text-slate-500 font-mono">{asset.id}</span>
                               <span className={`w-2 h-2 rounded-full ${asset.status === 'Covered' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                           </div>
                           <div className="text-sm font-bold text-slate-200 mb-2 truncate" title={asset.name}>{asset.name}</div>
                           
                           {/* Mini Warranty Bar */}
                           <div className="space-y-1">
                               <div className="flex justify-between text-[10px] text-slate-500">
                                   <span>Warranty</span>
                                   <span>{asset.warranty}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${asset.warranty < 20 ? 'bg-red-500' : asset.warranty < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                     style={{width: `${asset.warranty}%`}}
                                   ></div>
                               </div>
                           </div>
                           
                           <div className="mt-3 flex justify-between items-center">
                               <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{asset.type}</span>
                               <button className="text-[10px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   Details <ArrowRight size={10} />
                               </button>
                           </div>
                       </div>
                   ))}
                   
                   {/* Add Asset Button */}
                   <div className="border border-dashed border-slate-700 rounded p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-900/20 transition-colors cursor-pointer">
                       <Plus size={24} />
                       <span className="text-xs font-bold">Add Equipment</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Maintenance & History */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Maintenance Schedule */}
           <SciFiCard title="维保日历 (Maintenance)" subtitle="SCHEDULE" className="border-emerald-900/50">
               <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                   {activeProfile.tasks.map((task, i) => (
                       <div key={i} className="relative">
                           <div className={`absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950 
                               ${task.status === 'Completed' ? 'border-green-500' : task.status === 'Overdue' ? 'border-red-500' : 'border-blue-500'}`}>
                           </div>
                           <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] font-mono text-slate-500">{task.date}</span>
                                   <StatusBadge status={task.status} />
                               </div>
                               <div className="text-xs font-bold text-slate-200 mb-1">{task.description}</div>
                               <div className="flex justify-between items-center text-[10px] text-slate-500">
                                   <span>Type: {task.type}</span>
                                   {task.technician && <span>Tech: {task.technician}</span>}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                   <Calendar size={12} /> Schedule New Visit
               </button>
           </SciFiCard>

           {/* Health & Cost Analysis */}
           <SciFiCard title="健康度与成本分析" className="border-slate-800 flex-1">
               <div className="flex flex-col gap-6">
                   {/* Health Score */}
                   <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded border border-slate-800">
                       <HeartPulse size={24} className="text-red-400" />
                       <div className="flex-1">
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-400">Overall Asset Health</span>
                               <span className="text-white font-bold">{activeProfile.assetHealth}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="bg-gradient-to-r from-red-500 to-green-500 h-full" style={{width: `${activeProfile.assetHealth}%`}}></div>
                           </div>
                       </div>
                   </div>

                   {/* Cost Distribution Chart */}
                   <div className="h-40 w-full relative">
                       <div className="absolute top-0 left-0 text-[10px] text-slate-500 uppercase">Cost Breakdown</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie 
                                 data={COST_DISTRIBUTION} 
                                 innerRadius={30} 
                                 outerRadius={50} 
                                 paddingAngle={5} 
                                 dataKey="value"
                               >
                                   {COST_DISTRIBUTION.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={[ '#3b82f6', '#10b981', '#f59e0b', '#64748b'][index % 4]} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', color: '#e2e8f0'}} />
                           </PieChart>
                       </ResponsiveContainer>
                       {/* Legend Overlay */}
                       <div className="absolute bottom-0 w-full flex justify-between px-2 text-[9px] text-slate-400">
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Labor</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Parts</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Logs</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
