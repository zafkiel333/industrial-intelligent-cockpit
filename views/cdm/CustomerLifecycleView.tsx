
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, UserPlus, UserMinus, TrendingUp, 
  Activity, Heart, AlertOctagon, Target, 
  RefreshCw, Zap, Gift, ShieldAlert,
  ArrowRight, Search, Filter, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Sector, LineChart, Line, Legend
} from 'recharts';

// --- Mock Data ---

// Lifecycle Stage Counts
const STAGE_DATA = [
  { name: '获客 (Acquisition)', value: 15400, color: '#10b981' },
  { name: '激活 (Activation)', value: 8500, color: '#0ea5e9' },
  { name: '留存 (Retention)', value: 6200, color: '#6366f1' },
  { name: '变现 (Revenue)', value: 4800, color: '#f59e0b' },
  { name: '推荐 (Referral)', value: 1200, color: '#ec4899' },
];

// Churn Prediction List
const CHURN_RISKS = [
  { id: 'C-9921', name: 'Nanjing Logistics Co.', health: 35, risk: 'Critical', reason: 'Usage dropped 40% in 30d', arr: '¥ 450k' },
  { id: 'C-8832', name: 'Blue Sky Energy', health: 42, risk: 'High', reason: 'Late payment > 60 days', arr: '¥ 1.2M' },
  { id: 'C-7741', name: 'TechConstruct Ltd.', health: 48, risk: 'High', reason: 'Support ticket escalation', arr: '¥ 280k' },
  { id: 'C-6650', name: 'Global Shipping Inc.', health: 55, risk: 'Medium', reason: 'Contract expiry in 30d', arr: '¥ 850k' },
];

// Upsell Opportunities
const UPSELL_OPPS = [
  { id: 'C-1022', name: 'Shanghai Heavy Ind.', score: 92, opp: 'Premium Support Upgrade', value: '+ ¥ 200k' },
  { id: 'C-3044', name: 'Pacific Power Group', score: 88, opp: 'IoT Module Add-on', value: '+ ¥ 150k' },
  { id: 'C-5011', name: 'AutoWorks GmbH', score: 85, opp: 'Multi-site License', value: '+ ¥ 500k' },
];

// LTV vs CAC Trend
const LTV_CAC_TREND = [
  { month: 'Oct', ltv: 3200, cac: 800 },
  { month: 'Nov', ltv: 3300, cac: 780 },
  { month: 'Dec', ltv: 3250, cac: 850 },
  { month: 'Jan', ltv: 3400, cac: 750 },
  { month: 'Feb', ltv: 3550, cac: 720 },
  { month: 'Mar', ltv: 3600, cac: 700 },
];

// Cohort Retention (Simplified)
const COHORT_DATA = [
  { month: 'M0', ret: 100 },
  { month: 'M1', ret: 85 },
  { month: 'M2', ret: 78 },
  { month: 'M3', ret: 75 },
  { month: 'M4', ret: 72 },
  { month: 'M5', ret: 70 },
  { month: 'M6', ret: 68 },
  { month: 'M7', ret: 67 },
  { month: 'M8', ret: 66 },
  { month: 'M9', ret: 65 },
  { month: 'M10', ret: 64 },
  { month: 'M11', ret: 63 },
  { month: 'M12', ret: 62 },
];

// --- Components ---

const KPITile = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="relative overflow-hidden bg-[#080b16] border border-slate-800 p-4 rounded-lg group hover:border-slate-600 transition-all">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={48} />
    </div>
    <div className="flex items-center gap-2 mb-2 text-slate-400">
      <Icon size={16} style={{ color: color }} />
      <span className="text-xs uppercase font-bold tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-mono font-bold text-white mb-1">{value}</div>
    <div className={`text-xs font-bold ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
      {trend} <span className="text-slate-600 font-normal">vs last month</span>
    </div>
  </div>
);

const StageCard = ({ stage, index, total }: { stage: any, index: number, total: number }) => {
  const percent = ((stage.value / total) * 100).toFixed(1);
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      {/* Visual Ring */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle 
            cx="48" cy="48" r="40" fill="none" stroke={stage.color} strokeWidth="6"
            strokeDasharray="251" strokeDashoffset={251 - (251 * Number(percent)) / 100}
            strokeLinecap="round" className="opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{percent}%</span>
          <span className="text-[9px] text-slate-500 uppercase">Conv.</span>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{stage.name.split(' ')[0]}</div>
        <div className="text-xs text-slate-500 font-mono mt-1" style={{color: stage.color}}>{stage.value.toLocaleString()}</div>
      </div>

      {/* Connector (except last) */}
      {index < 4 && (
        <div className="hidden md:block absolute right-[-20px] top-10 transform -translate-y-1/2 z-10 text-slate-700">
          <ArrowRight size={16} />
        </div>
      )}
    </div>
  );
};

export const CustomerLifecycleView: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalUsers = STAGE_DATA[0].value; // Assuming Acquisition is base

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 overflow-y-auto custom-scrollbar pr-2">
      
      {/* 1. Top HUD: Global Lifecycle Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile label="CLV (客户终值)" value="¥ 3,600" trend="+4.2%" icon={DollarSign} color="#f59e0b" />
        <KPITile label="CAC (获客成本)" value="¥ 700" trend="-2.1%" icon={Target} color="#ef4444" />
        <KPITile label="Churn Rate (流失率)" value="1.8%" trend="-0.5%" icon={UserMinus} color="#6366f1" />
        <KPITile label="NPS (净推荐值)" value="58" trend="+3" icon={Heart} color="#ec4899" />
      </div>

      {/* 2. Central Stage: Lifecycle Funnel Visualization */}
      <SciFiCard className="border-indigo-500/20 bg-gradient-to-b from-[#0b0f1e] to-[#05070a]" noPadding>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-indigo-500" /> 客户全生命周期流转图谱
            </h2>
            <div className="flex gap-2">
               <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 border border-slate-700 transition-colors">Last 30 Days</button>
               <button className="px-3 py-1 bg-indigo-900/30 text-indigo-300 rounded text-xs border border-indigo-500/30">Quarter to Date</button>
            </div>
          </div>

          {/* The Flow Visualization */}
          <div className="flex flex-wrap justify-between items-start gap-4 relative px-8 py-4">
             {/* Connecting Line Background */}
             <div className="absolute top-[48px] left-16 right-16 h-0.5 bg-slate-800 -z-0 hidden md:block"></div>
             
             {STAGE_DATA.map((stage, i) => (
                <div key={i} className="relative z-10 bg-[#0b0f1e] p-2 rounded-full">
                   <StageCard stage={stage} index={i} total={totalUsers} />
                </div>
             ))}
          </div>

          {/* Deep Dive Metrics for Active Stage (Acquisition default) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
             <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase font-bold">Top Channels</div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-300">Organic Search</span>
                   <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[65%]"></div>
                   </div>
                   <span className="text-slate-400">65%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-300">Referral</span>
                   <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[20%]"></div>
                   </div>
                   <span className="text-slate-400">20%</span>
                </div>
             </div>

             <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase font-bold">Conversion Speed</div>
                <div className="flex items-center gap-4">
                   <div className="text-center">
                      <div className="text-lg font-bold text-white">12d</div>
                      <div className="text-[10px] text-slate-500">Lead -&gt; Deal</div>
                   </div>
                   <div className="h-8 w-px bg-slate-700"></div>
                   <div className="text-center">
                      <div className="text-lg font-bold text-white">45d</div>
                      <div className="text-[10px] text-slate-500">Break-even</div>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase font-bold">Health Distribution</div>
                <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden">
                   <div className="bg-green-500 w-[60%]" title="Healthy"></div>
                   <div className="bg-yellow-500 w-[30%]" title="At Risk"></div>
                   <div className="bg-red-500 w-[10%]" title="Critical"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                   <span>Healthy 60%</span>
                   <span>Risk 30%</span>
                   <span>Crit 10%</span>
                </div>
             </div>
          </div>
        </div>
      </SciFiCard>

      {/* 3. Middle Section: Value & Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* LTV vs CAC Analysis */}
         <SciFiCard title="经济模型 (LTV / CAC)" subtitle="UNIT ECONOMICS" className="border-indigo-900/30">
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={LTV_CAC_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                     <defs>
                        <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                     <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                     <Tooltip contentStyle={{backgroundColor: '#080b16', borderColor: '#8b5cf6', color: '#fff'}} />
                     <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                     <Area type="monotone" dataKey="ltv" name="LTV (Value)" stroke="#8b5cf6" fill="url(#colorLtv)" strokeWidth={2} />
                     <Line type="monotone" dataKey="cac" name="CAC (Cost)" stroke="#ef4444" strokeWidth={2} dot={true} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center px-4 mt-2">
               <span className="text-xs text-slate-400">Ratio: <strong className="text-green-400">5.1x</strong> (Healthy &gt; 3.0)</span>
               <span className="text-xs text-slate-400">Payback: <strong className="text-white">5.2 Months</strong></span>
            </div>
         </SciFiCard>

         {/* Cohort Retention */}
         <SciFiCard title="留存曲线 (Cohort Analysis)" subtitle="12 MONTHS" className="border-indigo-900/30">
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={COHORT_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                     <defs>
                        <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                     <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                     <Tooltip contentStyle={{backgroundColor: '#080b16', borderColor: '#0ea5e9', color: '#fff'}} formatter={(val: number) => `${val}%`} />
                     <Area type="monotone" dataKey="ret" name="Retention %" stroke="#0ea5e9" fill="url(#colorRet)" strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center px-4 mt-2">
               <span className="text-xs text-slate-400">MoM Retention: <strong className="text-white">98.5%</strong></span>
               <span className="text-xs text-slate-400">Annual Churn: <strong className="text-yellow-400">~15%</strong></span>
            </div>
         </SciFiCard>

      </div>

      {/* 4. Bottom: Actionable Intelligence (Split Lists) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
         
         {/* Churn Predictions */}
         <SciFiCard title="流失风险预警 (Churn Prediction)" subtitle="AI DETECTED" className="border-red-900/30">
            <div className="flex flex-col gap-2 h-64 overflow-y-auto custom-scrollbar pr-1">
               {CHURN_RISKS.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-950/10 border border-red-900/30 rounded hover:bg-red-950/20 transition-colors group">
                     <div>
                        <div className="flex items-center gap-2">
                           <ShieldAlert size={14} className="text-red-500" />
                           <span className="text-sm font-bold text-slate-200">{item.name}</span>
                        </div>
                        <div className="text-xs text-red-300 mt-1">{item.reason}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Health Score</div>
                        <div className="text-lg font-bold text-red-500">{item.health}</div>
                     </div>
                     <button className="opacity-0 group-hover:opacity-100 p-2 bg-red-900/50 hover:bg-red-900 text-white rounded transition-all">
                        <ArrowRight size={14} />
                     </button>
                  </div>
               ))}
            </div>
         </SciFiCard>

         {/* Upsell Opportunities */}
         <SciFiCard title="增购机会挖掘 (Upsell Opportunities)" subtitle="RECOMMENDATIONS" className="border-green-900/30">
            <div className="flex flex-col gap-2 h-64 overflow-y-auto custom-scrollbar pr-1">
               {UPSELL_OPPS.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-green-950/10 border border-green-900/30 rounded hover:bg-green-950/20 transition-colors group">
                     <div>
                        <div className="flex items-center gap-2">
                           <Gift size={14} className="text-green-500" />
                           <span className="text-sm font-bold text-slate-200">{item.name}</span>
                        </div>
                        <div className="text-xs text-green-300 mt-1">Suggest: {item.opp}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Est. Value</div>
                        <div className="text-lg font-bold text-white">{item.value}</div>
                     </div>
                     <button className="opacity-0 group-hover:opacity-100 p-2 bg-green-900/50 hover:bg-green-900 text-white rounded transition-all">
                        <Zap size={14} />
                     </button>
                  </div>
               ))}
            </div>
         </SciFiCard>

      </div>

    </div>
  );
};