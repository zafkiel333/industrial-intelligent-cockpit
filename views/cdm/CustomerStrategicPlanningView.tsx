
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Target, Flag, TrendingUp, AlertTriangle, 
  CheckCircle2, Calendar, DollarSign, Briefcase, 
  Swords, Shield, Zap, Rocket,
  Lightbulb, ArrowRight, Layout, PieChart, Users
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, Cell, ReferenceLine, BarChart
} from 'recharts';

// --- Types ---

interface Account {
  id: string;
  name: string;
  tier: 'Strategic' | 'Key' | 'Growth';
  theme: string; // Annual Theme
  manager: string;
}

interface StrategyMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
}

interface SwotItem {
  id: string;
  type: 'Strength' | 'Weakness' | 'Opportunity' | 'Threat';
  content: string;
  impact: 'High' | 'Medium' | 'Low';
}

interface Initiative {
  id: string;
  name: string;
  owner: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'Done' | 'On Track' | 'Risk' | 'Planned';
  progress: number;
}

// --- Mock Data ---

const ACCOUNTS: Account[] = [
  { id: 'KA-001', name: 'Shanghai Heavy Industries', tier: 'Strategic', theme: 'Digital Transformation Partner', manager: 'Alex Zhang' },
  { id: 'KA-002', name: 'Pacific Power Group', tier: 'Strategic', theme: 'Green Energy Transition', manager: 'Sarah Li' },
  { id: 'KA-003', name: 'AutoWorks Global', tier: 'Key', theme: 'Supply Chain Integration', manager: 'Mike Wang' },
];

const STRATEGY_METRICS: StrategyMetric[] = [
  { label: 'Share of Wallet', current: 35, target: 45, unit: '%' },
  { label: 'Joint Innovation', current: 1, target: 3, unit: 'PoCs' },
  { label: 'Exec Engagement', current: 4, target: 6, unit: 'Meetings' },
];

const SWOT_DATA: SwotItem[] = [
  { id: 'S1', type: 'Strength', content: 'Embedded in core production workflow', impact: 'High' },
  { id: 'S2', type: 'Strength', content: 'Strong relationship with CTO', impact: 'Medium' },
  { id: 'W1', type: 'Weakness', content: 'Higher pricing vs local competitors', impact: 'High' },
  { id: 'O1', type: 'Opportunity', content: 'New plant expansion in Vietnam', impact: 'High' },
  { id: 'O2', type: 'Opportunity', content: 'AI predictive maintenance pilot', impact: 'Medium' },
  { id: 'T1', type: 'Threat', content: 'Budget cuts in Q3 expected', impact: 'High' },
];

const INITIATIVES: Initiative[] = [
  { id: 'I1', name: 'Executive Business Review', owner: 'Alex Z.', quarter: 'Q1', status: 'Done', progress: 100 },
  { id: 'I2', name: 'IoT Data Integration Pilot', owner: 'Tech Team', quarter: 'Q2', status: 'On Track', progress: 65 },
  { id: 'I3', name: 'Contract Renewal Negotiation', owner: 'Sales', quarter: 'Q3', status: 'Planned', progress: 0 },
  { id: 'I4', name: 'Global Framework Agreement', owner: 'VP Sales', quarter: 'Q4', status: 'Planned', progress: 0 },
  { id: 'I5', name: 'User Training Workshop', owner: 'Service', quarter: 'Q2', status: 'Risk', progress: 30 },
];

const REVENUE_BRIDGE = [
  { name: 'Last Year', value: 12.5, type: 'base' },
  { name: 'Churn', value: -1.2, type: 'neg' },
  { name: 'Base', value: 11.3, type: 'total' }, // 12.5 - 1.2
  { name: 'Upsell', value: 2.5, type: 'pos' },
  { name: 'New LOB', value: 1.8, type: 'pos' },
  { name: 'Target', value: 15.6, type: 'target' }, // 11.3 + 2.5 + 1.8
];

// --- Components ---

const SwotCard = ({ type, items }: { type: string, items: SwotItem[] }) => {
  const colors = {
    'Strength': { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: Swords },
    'Weakness': { bg: 'bg-orange-900/20', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle },
    'Opportunity': { bg: 'bg-blue-900/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: Lightbulb },
    'Threat': { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400', icon: Shield },
  }[type] || { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400', icon: Target };

  const Icon = colors.icon;

  return (
    <div className={`flex-1 flex flex-col p-3 rounded border ${colors.bg} ${colors.border}`}>
      <div className={`flex items-center gap-2 mb-2 font-bold uppercase text-xs ${colors.text}`}>
        <Icon size={14} /> {type}
      </div>
      <div className="flex-1 space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-start gap-2 text-xs bg-[#0b1221]/50 p-2 rounded">
            <span className="text-slate-300 leading-tight">{item.content}</span>
            {item.impact === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" title="High Impact"></div>}
          </div>
        ))}
        {items.length === 0 && <div className="text-[10px] text-slate-500 italic">None identified</div>}
      </div>
    </div>
  );
};

const RevenueWaterfall = () => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={REVENUE_BRIDGE}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} />
          <YAxis stroke="#64748b" tick={{fontSize: 10}} unit="M" />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}} 
            contentStyle={{backgroundColor: '#0f172a', borderColor: '#64748b', color: '#e2e8f0'}}
          />
          <Bar dataKey="value" barSize={30}>
            {REVENUE_BRIDGE.map((entry, index) => {
              let fill = '#94a3b8';
              if (entry.type === 'pos') fill = '#10b981';
              if (entry.type === 'neg') fill = '#ef4444';
              if (entry.type === 'target') fill = '#f59e0b';
              if (entry.type === 'base') fill = '#3b82f6';
              if (entry.type === 'total') fill = '#6366f1';
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CustomerStrategicPlanningView: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState(ACCOUNTS[0].id);
  const activeAccount = ACCOUNTS.find(a => a.id === selectedAccountId) || ACCOUNTS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & North Star */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-amber-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
               <Target size={14} /> Strategic Planning 2024
            </div>
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                   大客户年度 <span className="text-amber-500">战略规划</span>
                </h1>
                <select 
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-slate-300 focus:border-amber-500 outline-none"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                    {ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Account Manager</span>
                <span className="text-sm font-bold text-slate-300">{activeAccount.manager}</span>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase">Status</span>
                 <span className="text-sm font-bold text-green-400 flex items-center gap-1">
                     <CheckCircle2 size={12}/> On Track
                 </span>
             </div>
             <button className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Rocket size={14} /> Launch Initiative
             </button>
          </div>
        </div>

        {/* North Star Banner */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#1f1605] to-[#0a0f1e] p-6 flex justify-between items-center shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Flag size={120} className="text-amber-500" />
            </div>
            
            <div className="z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider">Annual Theme</span>
                    <span className="w-16 h-[1px] bg-amber-500/50"></span>
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight text-shadow-glow">"{activeAccount.theme}"</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                    Focus on deepening technical integration and expanding into their new overseas manufacturing hubs.
                </p>
            </div>

            <div className="z-10 flex gap-8 pr-10">
                {STRATEGY_METRICS.map((metric, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">{metric.label}</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{metric.current}</span>
                            <span className="text-xs text-slate-500">/ {metric.target} {metric.unit}</span>
                        </div>
                        {/* Mini Progress Bar */}
                        <div className="w-20 h-1 bg-slate-800 rounded-full mt-1">
                            <div className="h-full bg-amber-500" style={{width: `${(metric.current/metric.target)*100}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: SWOT & Analysis */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="SWOT 战略分析矩阵" subtitle="ANALYSIS" className="flex-1 border-amber-900/50 bg-[#080a14]" noPadding>
               <div className="w-full h-full p-4 grid grid-cols-2 gap-4">
                   <SwotCard type="Strength" items={SWOT_DATA.filter(i => i.type === 'Strength')} />
                   <SwotCard type="Weakness" items={SWOT_DATA.filter(i => i.type === 'Weakness')} />
                   <SwotCard type="Opportunity" items={SWOT_DATA.filter(i => i.type === 'Opportunity')} />
                   <SwotCard type="Threat" items={SWOT_DATA.filter(i => i.type === 'Threat')} />
               </div>
           </SciFiCard>

           <div className="h-64">
               <SciFiCard title="营收增长桥 (Revenue Bridge)" subtitle="FORECAST" className="h-full border-slate-800">
                   <div className="w-full h-full p-2">
                       <RevenueWaterfall />
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Roadmap & Execution */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
           
           {/* Strategic Roadmap */}
           <SciFiCard title="年度执行路线图 (Roadmap)" subtitle="2024" className="flex-1 border-slate-800">
               <div className="flex flex-col h-full gap-4">
                   {/* Timeline Header */}
                   <div className="flex border-b border-slate-700 pb-2 text-xs text-slate-500 uppercase font-bold">
                       <div className="flex-1 text-center">Q1</div>
                       <div className="flex-1 text-center">Q2</div>
                       <div className="flex-1 text-center">Q3</div>
                       <div className="flex-1 text-center">Q4</div>
                   </div>
                   
                   {/* Initiatives */}
                   <div className="flex-1 space-y-4 relative">
                       {/* Vertical Grid Lines */}
                       <div className="absolute inset-0 flex pointer-events-none">
                           <div className="flex-1 border-r border-slate-800/50 border-dashed"></div>
                           <div className="flex-1 border-r border-slate-800/50 border-dashed"></div>
                           <div className="flex-1 border-r border-slate-800/50 border-dashed"></div>
                           <div className="flex-1"></div>
                       </div>

                       {INITIATIVES.map(init => {
                           const qIdx = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(init.quarter);
                           const leftPos = qIdx * 25;
                           const statusColor = 
                             init.status === 'Done' ? 'bg-emerald-600' :
                             init.status === 'On Track' ? 'bg-blue-600' :
                             init.status === 'Risk' ? 'bg-red-600' : 'bg-slate-700';
                           
                           return (
                               <div key={init.id} className="relative h-12 flex items-center">
                                   <div 
                                     className={`absolute h-8 rounded px-3 py-1 flex items-center justify-between text-xs text-white shadow-lg border border-white/10 transition-all hover:scale-105 cursor-pointer ${statusColor}`}
                                     style={{ left: `${leftPos}%`, width: '24%' }}
                                   >
                                       <span className="font-bold truncate">{init.name}</span>
                                       <span className="text-[10px] opacity-80 bg-black/20 px-1 rounded">{init.progress}%</span>
                                   </div>
                               </div>
                           );
                       })}
                   </div>

                   {/* Legend */}
                   <div className="flex justify-end gap-4 text-[10px] text-slate-400 mt-auto pt-2 border-t border-slate-800">
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-600 rounded-full"></div> Done</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> On Track</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Risk</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-700 rounded-full"></div> Planned</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Risk & Action List */}
           <div className="h-64 grid grid-cols-2 gap-6">
               <SciFiCard title="重点行动项" className="border-slate-800">
                   <div className="space-y-2 overflow-y-auto h-full pr-1 custom-scrollbar">
                       <div className="p-2 bg-slate-900/50 border-l-2 border-green-500 flex items-center justify-between">
                           <div className="text-xs text-slate-300">Q1 Review Meeting</div>
                           <CheckCircle2 size={12} className="text-green-500"/>
                       </div>
                       <div className="p-2 bg-slate-900/50 border-l-2 border-amber-500 flex items-center justify-between">
                           <div className="text-xs text-slate-300">Finalize Pilot Specs</div>
                           <span className="text-[10px] text-amber-500">Due in 5d</span>
                       </div>
                       <div className="p-2 bg-slate-900/50 border-l-2 border-slate-500 flex items-center justify-between opacity-60">
                           <div className="text-xs text-slate-300">Sign NDA for Q3</div>
                           <span className="text-[10px]">Pending</span>
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="高风险警示" className="border-slate-800">
                   <div className="flex flex-col gap-2">
                       <div className="p-2 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-200">
                           <div className="flex items-center gap-1 font-bold mb-1 text-red-400">
                               <AlertTriangle size={12}/> Budget Freeze
                           </div>
                           Rumors of Q3 budget cuts. Need to lock in renewal early.
                       </div>
                       <div className="p-2 bg-yellow-900/10 border border-yellow-900/30 rounded text-xs text-yellow-200">
                           <div className="flex items-center gap-1 font-bold mb-1 text-yellow-400">
                               <Users size={12}/> Champion Change
                           </div>
                           Current champion leaving in May. Need to build new relationships.
                       </div>
                   </div>
               </SciFiCard>
           </div>

        </div>

      </div>
    </div>
  );
};
