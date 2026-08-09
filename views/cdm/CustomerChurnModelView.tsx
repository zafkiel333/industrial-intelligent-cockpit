
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertOctagon, Activity, TrendingDown, TrendingUp, 
  UserMinus, Shield, Zap, Search, Sliders, 
  MessageCircle, Gift, Phone, Clock, ArrowRight,
  Fingerprint, Target, Lock, Unlock, HelpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ScatterChart, Scatter, ReferenceLine, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface RiskProfile {
  id: string;
  name: string;
  industry: string;
  arr: number; // Annual Recurring Revenue
  churnProb: number; // 0-100%
  healthScore: number; // 0-100
  riskLevel: 'Critical' | 'High' | 'Medium';
  primaryFactor: string;
  daysToRenewal: number;
}

interface RiskFactor {
  factor: string;
  weight: number; // Contribution to risk
  value: string; // Display value
  trend: 'Up' | 'Down' | 'Stable';
}

interface Intervention {
  id: string;
  type: 'Discount' | 'Service' | 'Engagement';
  title: string;
  cost: number;
  successProb: number; // Predicted success %
  roi: number;
}

// --- Mock Data ---

const HIGH_RISK_CUSTOMERS: RiskProfile[] = [
  { id: 'C-9921', name: 'Nanjing Logistics Co.', industry: 'Logistics', arr: 450000, churnProb: 92, healthScore: 35, riskLevel: 'Critical', primaryFactor: 'Usage Drop', daysToRenewal: 45 },
  { id: 'C-8832', name: 'Blue Sky Energy', industry: 'Energy', arr: 1200000, churnProb: 78, healthScore: 48, riskLevel: 'High', primaryFactor: 'Payment Delay', daysToRenewal: 12 },
  { id: 'C-7741', name: 'TechConstruct Ltd.', industry: 'Construction', arr: 280000, churnProb: 65, healthScore: 55, riskLevel: 'Medium', primaryFactor: 'Support Tickets', daysToRenewal: 90 },
  { id: 'C-6650', name: 'Global Shipping Inc.', industry: 'Logistics', arr: 850000, churnProb: 88, healthScore: 40, riskLevel: 'Critical', primaryFactor: 'Competitor', daysToRenewal: 30 },
  { id: 'C-5512', name: 'Future Retail', industry: 'Retail', arr: 150000, churnProb: 60, healthScore: 62, riskLevel: 'Medium', primaryFactor: 'Low Adoption', daysToRenewal: 120 },
];

const SURVIVAL_DATA = [
  { month: 'M0', active: 100, risk: 100 },
  { month: 'M1', active: 98, risk: 95 },
  { month: 'M2', active: 96, risk: 88 },
  { month: 'M3', active: 95, risk: 80 },
  { month: 'M4', active: 94, risk: 70 },
  { month: 'M5', active: 93, risk: 55 },
  { month: 'M6', active: 92, risk: 40 }, // Current Prediction
  { month: 'M7', active: 91, risk: 25 },
  { month: 'M8', active: 90, risk: 10 },
  { month: 'M9', active: 89, risk: 0 },
];

const RISK_FACTORS_DATA: RiskFactor[] = [
  { factor: 'Usage Frequency', weight: 85, value: '-40%', trend: 'Down' },
  { factor: 'NPS Score', weight: 60, value: '4/10', trend: 'Down' },
  { factor: 'Ticket Response', weight: 45, value: '48h', trend: 'Up' }, // Bad
  { factor: 'Payment Terms', weight: 30, value: 'Overdue', trend: 'Stable' },
  { factor: 'Competitor Activity', weight: 70, value: 'High', trend: 'Up' },
];

const INTERVENTIONS: Intervention[] = [
  { id: 'ACT-01', type: 'Discount', title: '15% Renewal Discount', cost: 12000, successProb: 65, roi: 4.5 },
  { id: 'ACT-02', type: 'Engagement', title: 'Executive QBR Visit', cost: 5000, successProb: 55, roi: 8.2 },
  { id: 'ACT-03', type: 'Service', title: 'Free Training Upgrade', cost: 2000, successProb: 40, roi: 12.0 },
];

const SCATTER_CLUSTERS = [
  { x: 20, y: 80, z: 100, type: 'Safe' },
  { x: 30, y: 70, z: 200, type: 'Safe' },
  { x: 80, y: 20, z: 500, type: 'Churn' }, // Selected
  { x: 75, y: 25, z: 400, type: 'Churn' },
  { x: 50, y: 50, z: 300, type: 'At Risk' },
];

// --- Components ---

const RiskGauge = ({ value }: { value: number }) => {
  // A circular SVG gauge
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value > 80 ? '#ef4444' : value > 50 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="32" cy="32" r={radius} stroke="#1e293b" strokeWidth="4" fill="none" />
        <circle 
          cx="32" cy="32" r={radius} 
          stroke={color} strokeWidth="4" fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs font-bold text-white">{value}%</span>
      </div>
    </div>
  );
};

export const CustomerChurnModelView: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(HIGH_RISK_CUSTOMERS[0].id);
  const [simulationVal, setSimulationVal] = useState(0);

  const activeCustomer = HIGH_RISK_CUSTOMERS.find(c => c.id === selectedCustomerId) || HIGH_RISK_CUSTOMERS[0];
  
  // Dynamic color for the active customer
  const activeColor = activeCustomer.riskLevel === 'Critical' ? '#ef4444' : activeCustomer.riskLevel === 'High' ? '#f59e0b' : '#3b82f6';

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Global Threat Level */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-red-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-wider">
               <AlertOctagon size={14} className="animate-pulse" /> Predictive Churn Analytics
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               客户流失预警 <span className="text-red-500">与挽留模型</span>
            </h1>
          </div>
          
          <div className="flex gap-6">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Revenue at Risk (ARR)</div>
                <div className="text-2xl font-mono font-bold text-red-400">¥ 2.85 M</div>
             </div>
             <div className="h-10 w-px bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Predicted Churn Rate</div>
                <div className="text-2xl font-mono font-bold text-white">4.2% <span className="text-xs text-red-500 font-normal">(+0.5%)</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: The Hit List (High Risk Queue) */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex items-center justify-between px-1">
               <span className="text-xs font-bold text-slate-400 uppercase">High Risk Targets</span>
               <div className="text-[10px] bg-red-900/20 text-red-400 px-2 py-0.5 rounded border border-red-900/50">
                   {HIGH_RISK_CUSTOMERS.length} Critical
               </div>
           </div>

           <div className="flex flex-col gap-3">
               {HIGH_RISK_CUSTOMERS.map(cust => (
                   <div 
                     key={cust.id}
                     onClick={() => setSelectedCustomerId(cust.id)}
                     className={`relative p-3 rounded border cursor-pointer transition-all duration-300 group overflow-hidden
                        ${selectedCustomerId === cust.id 
                            ? 'bg-red-950/20 border-red-500/50 shadow-[inset_4px_0_0_#ef4444]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       {/* Background Scan Effect */}
                       {selectedCustomerId === cust.id && (
                           <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
                       )}

                       <div className="flex justify-between items-start mb-2 relative z-10">
                           <div>
                               <div className={`font-bold text-sm truncate w-40 ${selectedCustomerId === cust.id ? 'text-white' : 'text-slate-300'}`}>
                                   {cust.name}
                               </div>
                               <div className="text-[10px] text-slate-500">{cust.industry} • ARR: ¥{(cust.arr/1000).toFixed(0)}k</div>
                           </div>
                           <RiskGauge value={cust.churnProb} />
                       </div>

                       <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                           <div className="bg-slate-950/50 p-1.5 rounded border border-slate-700/50">
                               <div className="text-[9px] text-slate-500 uppercase">Risk Factor</div>
                               <div className="text-xs text-red-300 truncate">{cust.primaryFactor}</div>
                           </div>
                           <div className="bg-slate-950/50 p-1.5 rounded border border-slate-700/50">
                               <div className="text-[9px] text-slate-500 uppercase">Renewal In</div>
                               <div className="text-xs text-white">{cust.daysToRenewal} Days</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Diagnosis */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* 1. Survival Analysis */}
           <SciFiCard title="客户生存曲线 (Survival Analysis)" subtitle="PREDICTION" className="h-[300px] border-red-900/30 bg-[#080505]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-4 px-2">
                       <div className="text-xs text-slate-400">
                           Comparing <span className="text-white font-bold">{activeCustomer.name}</span> vs Portfolio Average
                       </div>
                       <div className="flex gap-4 text-[10px]">
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded-full"></div> Portfolio Avg</span>
                           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> This Customer</span>
                       </div>
                   </div>
                   
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={SURVIVAL_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                               
                               <Area type="monotone" dataKey="active" stroke="#64748b" strokeDasharray="5 5" fill="none" strokeWidth={2} name="Avg Survival" />
                               <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} fill="url(#colorRisk)" name="Customer Survival" />
                               
                               <ReferenceLine x="M6" stroke="#fff" label={{value: 'Now', fill: '#fff', fontSize: 10, position: 'top'}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* 2. Factor Analysis & Clustering */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
               
               <SciFiCard title="流失归因分析 (Root Cause)" subtitle="FACTORS" className="border-slate-800">
                   <div className="w-full h-full p-2 flex flex-col justify-center gap-3">
                       {RISK_FACTORS_DATA.map((factor, i) => (
                           <div key={i} className="flex items-center gap-3">
                               <div className="w-24 text-xs text-slate-400 text-right">{factor.factor}</div>
                               <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full rounded-full" 
                                     style={{
                                         width: `${factor.weight}%`, 
                                         backgroundColor: factor.weight > 70 ? '#ef4444' : factor.weight > 40 ? '#f59e0b' : '#3b82f6'
                                     }}
                                   ></div>
                               </div>
                               <div className="w-16 flex justify-between text-xs font-mono">
                                   <span className="text-white">{factor.value}</span>
                                   {factor.trend === 'Down' ? <TrendingDown size={12} className="text-red-500"/> : 
                                    factor.trend === 'Up' ? <TrendingUp size={12} className="text-green-500"/> : 
                                    <Activity size={12} className="text-slate-500"/>}
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

               <SciFiCard title="行为聚类 (Behavior Cluster)" subtitle="AI MODEL" className="border-slate-800">
                   <div className="w-full h-full p-2 relative">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                               <XAxis type="number" dataKey="x" name="Engagement" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Engagement', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                               <YAxis type="number" dataKey="y" name="Satisfaction" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Satisfaction', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444'}} />
                               <Scatter name="Clusters" data={SCATTER_CLUSTERS}>
                                   {SCATTER_CLUSTERS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.type === 'Churn' ? '#ef4444' : entry.type === 'At Risk' ? '#f59e0b' : '#10b981'} />
                                   ))}
                               </Scatter>
                           </ScatterChart>
                       </ResponsiveContainer>
                       {/* Label Overlay */}
                       <div className="absolute top-2 right-2 bg-red-900/20 text-red-400 text-[10px] px-2 py-1 rounded border border-red-500/30">
                           Target in "High Churn" Cluster
                       </div>
                   </div>
               </SciFiCard>
           </div>
        </div>

        {/* RIGHT COLUMN: The Cure (Intervention) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Next Best Action */}
           <SciFiCard title="智能挽留策略 (NBA)" subtitle="AI SUGGESTION" className="border-green-900/30">
               <div className="flex flex-col gap-4">
                   <div className="text-xs text-slate-400">
                       AI Model recommends the following actions based on historical success rates for similar profiles.
                   </div>
                   
                   <div className="space-y-3">
                       {INTERVENTIONS.map((action, i) => (
                           <div key={i} className="bg-slate-900/50 border border-slate-700 p-3 rounded hover:border-green-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                               {/* Selection Highlight */}
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 group-hover:bg-green-500 transition-colors"></div>
                               
                               <div className="flex justify-between items-start mb-1 pl-2">
                                   <div className="flex items-center gap-2">
                                       {action.type === 'Discount' ? <Gift size={14} className="text-yellow-400"/> :
                                        action.type === 'Engagement' ? <MessageCircle size={14} className="text-blue-400"/> :
                                        <Zap size={14} className="text-purple-400"/>}
                                       <span className="text-sm font-bold text-white">{action.title}</span>
                                   </div>
                               </div>
                               
                               <div className="pl-6 grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-2">
                                   <div>Success Prob: <span className="text-green-400 font-bold">{action.successProb}%</span></div>
                                   <div>Est. ROI: <span className="text-white font-bold">{action.roi}x</span></div>
                                   <div className="col-span-2">Cost: ¥{action.cost.toLocaleString()}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Simulator */}
           <SciFiCard title="挽留效果模拟 (Simulator)" subtitle="WHAT-IF" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   <div className="bg-indigo-900/10 p-3 rounded border border-indigo-500/20">
                       <div className="flex justify-between items-center mb-4">
                           <span className="text-xs font-bold text-indigo-300">Adjustment: Discount</span>
                           <span className="text-xs font-mono text-white">{simulationVal}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="30" step="5"
                         value={simulationVal}
                         onChange={(e) => setSimulationVal(parseInt(e.target.value))}
                         className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                       />
                       <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                           <span>0%</span>
                           <span>30%</span>
                       </div>
                   </div>

                   <div className="flex-1 flex flex-col justify-center items-center gap-2">
                       <div className="text-xs text-slate-400 uppercase">Projected Churn Rate</div>
                       <div className="text-4xl font-bold text-white transition-all">
                           {(activeCustomer.churnProb - (simulationVal * 1.5)).toFixed(1)}%
                       </div>
                       <div className="text-[10px] text-green-400 flex items-center gap-1">
                           <ArrowRight size={10} className="rotate-45" /> Improvement: {(simulationVal * 1.5).toFixed(1)} pts
                       </div>
                   </div>

                   <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2">
                       <PlayCircle size={16} /> Deploy Strategy
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

// Helper Icon
const PlayCircle = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);
