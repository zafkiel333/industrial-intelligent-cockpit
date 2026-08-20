
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Box, Truck, Clock, RefreshCw, 
  CheckCircle2, XCircle, AlertOctagon, 
  MapPin, Calendar, Activity, Zap,
  TrendingUp, ArrowRight, Package,
  Search, Filter, MoreHorizontal,
  FileText, ShieldCheck, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, ReferenceLine, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

type TrialStatus = 'Preparing' | 'In Transit' | 'On Trial' | 'Overdue' | 'Returning' | 'Converted' | 'Returned';

interface TrialRecord {
  id: string;
  customer: string;
  equipment: string;
  serial: string;
  model: string;
  status: TrialStatus;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  utilizationRate: number; // Avg usage % during trial
  healthScore: number;
  conversionProb: number; // AI Prediction
  location: string;
  value: number;
}

// --- Mock Data ---

const TRIAL_LIST: TrialRecord[] = [
  { 
    id: 'TR-2403-01', customer: 'Shanghai Heavy Ind.', equipment: 'Hi-Precision CNC Module', 
    serial: 'CNC-X992', model: 'Pro-X', status: 'On Trial', 
    startDate: '2024-03-01', endDate: '2024-03-31', daysRemaining: 11,
    utilizationRate: 85, healthScore: 98, conversionProb: 92, location: 'Shanghai, CN', value: 450000
  },
  { 
    id: 'TR-2402-15', customer: 'Pacific Power Group', equipment: 'Portable Analyzer', 
    serial: 'PA-2004', model: 'Spec-V', status: 'Overdue', 
    startDate: '2024-02-15', endDate: '2024-03-15', daysRemaining: -5,
    utilizationRate: 95, healthScore: 90, conversionProb: 88, location: 'Beijing, CN', value: 120000
  },
  { 
    id: 'TR-2403-10', customer: 'AutoWorks GmbH', equipment: 'Robotic Arm Demo Unit', 
    serial: 'RA-5501', model: 'Arm-7', status: 'In Transit', 
    startDate: '2024-03-22', endDate: '2024-04-22', daysRemaining: 30,
    utilizationRate: 0, healthScore: 100, conversionProb: 60, location: 'En Route (Logistics)', value: 850000
  },
  { 
    id: 'TR-2401-05', customer: 'Quantum Tech', equipment: 'IoT Gateway Set', 
    serial: 'IOT-G88', model: 'Connect-Pro', status: 'Converted', 
    startDate: '2024-01-05', endDate: '2024-02-05', daysRemaining: 0,
    utilizationRate: 78, healthScore: 95, conversionProb: 100, location: 'Shenzhen, CN', value: 50000
  },
  { 
    id: 'TR-2403-18', customer: 'North Star Logistics', equipment: 'Smart Forklift', 
    serial: 'SF-1002', model: 'Lift-E', status: 'Preparing', 
    startDate: '2024-03-25', endDate: '2024-04-25', daysRemaining: 30,
    utilizationRate: 0, healthScore: 100, conversionProb: 50, location: 'Warehouse A', value: 320000
  },
];

const USAGE_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i+1}`,
  hours: Math.floor(Math.random() * 8) + 2,
  efficiency: 70 + Math.random() * 25
}));

const CONVERSION_FACTORS = [
  { subject: '使用频率', A: 90, fullMark: 100 },
  { subject: '功能匹配', A: 85, fullMark: 100 },
  { subject: '用户反馈', A: 95, fullMark: 100 },
  { subject: '预算充足', A: 70, fullMark: 100 },
  { subject: '竞对对比', A: 80, fullMark: 100 },
];

const STATUS_STATS = [
  { name: '试用中', value: 12, color: '#0ea5e9' },
  { name: '已转化', value: 8, color: '#10b981' },
  { name: '已归还', value: 5, color: '#64748b' },
  { name: '逾期', value: 3, color: '#ef4444' },
];

// --- Helper Components ---

const StatusTag = ({ status }: { status: TrialStatus }) => {
  const styles = {
    'On Trial': 'bg-cyan-900/30 text-cyan-400 border-cyan-600/50',
    'In Transit': 'bg-blue-900/30 text-blue-400 border-blue-600/50',
    'Overdue': 'bg-red-900/30 text-red-400 border-red-600/50 animate-pulse',
    'Converted': 'bg-green-900/30 text-green-400 border-green-600/50',
    'Returning': 'bg-orange-900/30 text-orange-400 border-orange-600/50',
    'Returned': 'bg-slate-800 text-slate-400 border-slate-600',
    'Preparing': 'bg-slate-800 text-slate-300 border-slate-600',
  }[status];

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${styles}`}>
      {status === 'Overdue' && <AlertOctagon size={10} />}
      {status === 'Converted' && <CheckCircle2 size={10} />}
      {status === 'In Transit' && <Truck size={10} />}
      {status}
    </span>
  );
};

const UsageHeatmap = () => (
  <div className="flex gap-1 h-8 mt-2">
    {Array.from({length: 30}).map((_, i) => {
      const active = i < 18; // Simulated days passed
      const intensity = active ? Math.random() : 0;
      return (
        <div 
          key={i} 
          className="flex-1 rounded-sm transition-all hover:scale-110"
          style={{
            backgroundColor: active ? `rgba(14, 165, 233, ${0.2 + intensity * 0.8})` : '#1e293b',
            border: active ? 'none' : '1px solid #334155'
          }}
          title={`Day ${i+1}: ${active ? (intensity*10).toFixed(1) + ' hrs' : 'Future'}`}
        ></div>
      );
    })}
  </div>
);

export const CustomerTrialEquipmentView: React.FC = () => {
  const [selectedTrialId, setSelectedTrialId] = useState(TRIAL_LIST[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeTrial = TRIAL_LIST.find(t => t.id === selectedTrialId) || TRIAL_LIST[0];

  // Calculate Progress for Timeline
  const totalDays = 30; // Assuming standard 30 day trial
  const progressPercent = activeTrial.status === 'Overdue' ? 100 : Math.max(0, Math.min(100, ((30 - activeTrial.daysRemaining) / 30) * 100));

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & KPIs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-cyan-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
               <Box size={14} /> Asset Lending Operations
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户试用 <span className="text-cyan-500">与借测设备管理</span>
            </h1>
          </div>
          
          <div className="flex gap-6">
              <div className="flex flex-col items-end">
                  <div className="text-[10px] text-slate-500 uppercase">Active Assets Value</div>
                  <div className="text-xl font-mono font-bold text-white">¥ 2.45 M</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <div className="text-[10px] text-slate-500 uppercase">Trial Success Rate</div>
                  <div className="text-xl font-mono font-bold text-green-400">78.5%</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <div className="text-[10px] text-slate-500 uppercase">Overdue Items</div>
                  <div className="text-xl font-mono font-bold text-red-500 animate-pulse">3</div>
              </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: The Fleet */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search serial, customer..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {TRIAL_LIST.map(trial => (
                   <div 
                     key={trial.id}
                     onClick={() => setSelectedTrialId(trial.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedTrialId === trial.id 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{trial.serial}</span>
                           <StatusTag status={trial.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedTrialId === trial.id ? 'text-white' : 'text-slate-300'}`}>
                           {trial.equipment}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-2 truncate">{trial.customer}</div>

                       <div className="flex justify-between items-end border-t border-slate-800/50 pt-2">
                           <div className="flex flex-col">
                               <span className="text-[9px] text-slate-500 uppercase">Return Date</span>
                               <span className={`text-xs font-mono ${trial.daysRemaining < 0 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                                   {trial.endDate}
                               </span>
                           </div>
                           <div className="text-right">
                               <div className="text-[9px] text-slate-500 uppercase">Win Prob</div>
                               <div className="text-xs font-bold text-green-400">{trial.conversionProb}%</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Monitor */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Active Trial Dashboard */}
           <SciFiCard title="试用全景监控 (Trial Monitor)" subtitle={activeTrial.id} subtitleIsCode className="border-cyan-900/50 bg-[#080b14]" noPadding>
               <div className="flex flex-col h-full p-5 gap-6">
                   
                   {/* Top Info */}
                   <div className="flex justify-between items-start">
                       <div>
                           <h2 className="text-2xl font-bold text-white mb-1">{activeTrial.equipment}</h2>
                           <div className="flex items-center gap-4 text-xs text-slate-400">
                               <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{activeTrial.model}</span>
                               <span className="flex items-center gap-1"><MapPin size={12}/> {activeTrial.location}</span>
                               <span className="flex items-center gap-1"><DollarSign size={12}/> Value: ¥{activeTrial.value.toLocaleString()}</span>
                           </div>
                       </div>
                       
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Health Status</div>
                           <div className="text-xl font-bold text-green-400 flex items-center justify-end gap-2">
                               <Activity size={18} /> {activeTrial.healthScore}%
                           </div>
                       </div>
                   </div>

                   {/* Timeline Visualizer */}
                   <div className="relative pt-6 pb-2">
                       {/* Bar */}
                       <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                           <div 
                             className={`h-full transition-all duration-1000 ${activeTrial.daysRemaining < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} 
                             style={{width: `${progressPercent}%`}}
                           ></div>
                           {/* Markers */}
                           <div className="absolute top-0 left-[33%] w-0.5 h-full bg-black/50"></div>
                           <div className="absolute top-0 left-[66%] w-0.5 h-full bg-black/50"></div>
                       </div>
                       
                       {/* Labels */}
                       <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                           <span>Start: {activeTrial.startDate}</span>
                           <span className={activeTrial.daysRemaining < 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                               {activeTrial.daysRemaining < 0 ? `Overdue by ${Math.abs(activeTrial.daysRemaining)} days` : `${activeTrial.daysRemaining} days remaining`}
                           </span>
                           <span>End: {activeTrial.endDate}</span>
                       </div>

                       {/* Current Indicator */}
                       <div 
                         className="absolute top-3 w-0.5 h-8 bg-white z-10 transition-all duration-1000"
                         style={{left: `${progressPercent}%`}}
                       >
                           <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                       </div>
                   </div>

                   {/* Usage Heatmap (Activity) */}
                   <div className="mt-2">
                       <div className="flex justify-between items-end mb-2">
                           <div className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                               <Zap size={14} className="text-yellow-400"/> Daily Usage Intensity
                           </div>
                           <div className="text-xs text-slate-300">Avg Utilization: <span className="text-white font-bold">{activeTrial.utilizationRate}%</span></div>
                       </div>
                       <UsageHeatmap />
                   </div>
                   
                   {/* Usage Trend Chart */}
                   <div className="h-40 w-full mt-2 border border-slate-800 rounded bg-slate-900/20 p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={USAGE_DATA}>
                               <defs>
                                   <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="hours" stroke="#0ea5e9" fill="url(#colorUsage)" strokeWidth={2} name="Hours Run" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>

               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: The Deal (Conversion) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Conversion Intelligence */}
           <SciFiCard title="转化概率模型" subtitle="AI PREDICTION" className="border-purple-900/50">
               <div className="flex flex-col items-center py-4">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="none" />
                           <circle 
                             cx="64" cy="64" r="56" 
                             stroke={activeTrial.conversionProb > 80 ? '#10b981' : activeTrial.conversionProb > 50 ? '#f59e0b' : '#ef4444'} 
                             strokeWidth="8" fill="none" 
                             strokeDasharray="351" 
                             strokeDashoffset={351 - (351 * activeTrial.conversionProb) / 100}
                             strokeLinecap="round"
                           />
                       </svg>
                       <div className="absolute text-center">
                           <div className="text-3xl font-bold text-white">{activeTrial.conversionProb}%</div>
                           <div className="text-[9px] text-slate-500 uppercase">Likelihood</div>
                       </div>
                   </div>
               </div>

               <div className="h-40 w-full mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CONVERSION_FACTORS}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Score" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Action Panel */}
           <SciFiCard title="决策操作台" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3">
                   <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20">
                       <CheckCircle2 size={14} /> 确认转化 (Convert to Sale)
                   </button>
                   
                   <div className="grid grid-cols-2 gap-3">
                       <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                           <Clock size={14} /> 延长试用
                       </button>
                       <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                           <RefreshCw size={14} /> 发起回收
                       </button>
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                           <span>Trial Agreement</span>
                           <span className="text-cyan-400 cursor-pointer hover:underline">View PDF</span>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-400">
                           <span>Deposit Status</span>
                           <span className="text-green-400 font-bold">Paid (10%)</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
