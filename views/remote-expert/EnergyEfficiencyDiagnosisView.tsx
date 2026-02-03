
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Leaf, TrendingDown, AlertCircle, 
  BarChart3, PieChart as PieIcon, ArrowRight, 
  CheckCircle2, DollarSign, Activity, 
  Gauge, Lightbulb, Thermometer, Wind, 
  Target, Filter, Download, Calculator,
  Flame, Droplets, Layers, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart
} from 'recharts';

// --- Types ---

interface EnergyKPI {
  label: string;
  value: string;
  unit: string;
  trend: number;
  status: 'Good' | 'Warning' | 'Critical';
}

interface SavingOpportunity {
  id: string;
  system: string;
  measure: string;
  investment: number;
  savingPerYear: number;
  roi: number; // Months
  co2Reduction: number; // tons/year
  status: 'Identified' | 'Proposed' | 'Accepted' | 'Implemented';
}

interface SystemEfficiency {
  system: string;
  efficiency: number; // %
  benchmark: number; // %
  status: 'Optimal' | 'Sub-optimal' | 'Poor';
}

// --- Mock Data ---

const GLOBAL_KPIS: EnergyKPI[] = [
  { label: '综合能效指数 (EEI)', value: '82.4', unit: 'Pts', trend: 1.2, status: 'Warning' },
  { label: '单位产品能耗 (SEC)', value: '145.2', unit: 'kWh/t', trend: -2.5, status: 'Good' },
  { label: '总碳排放量', value: '8,450', unit: 'tCO2e', trend: -0.8, status: 'Good' },
  { label: '节能潜力估算', value: '12.5', unit: '%', trend: 0, status: 'Warning' },
];

const EFFICIENCY_RADAR = [
  { subject: '空压系统 (Air)', Current: 65, Benchmark: 85, fullMark: 100 },
  { subject: '暖通空调 (HVAC)', Current: 72, Benchmark: 80, fullMark: 100 },
  { subject: '电机拖动 (Motor)', Current: 88, Benchmark: 92, fullMark: 100 },
  { subject: '工业锅炉 (Boiler)', Current: 78, Benchmark: 85, fullMark: 100 },
  { subject: '照明系统 (Light)', Current: 60, Benchmark: 90, fullMark: 100 },
  { subject: '余热回收 (Heat)', Current: 40, Benchmark: 70, fullMark: 100 },
];

const SAVING_OPPS: SavingOpportunity[] = [
  { id: 'ESM-01', system: 'Compressed Air', measure: '修复管网泄漏 (Leakage Repair)', investment: 5000, savingPerYear: 45000, roi: 1.3, co2Reduction: 32, status: 'Proposed' },
  { id: 'ESM-02', system: 'HVAC', measure: '安装变频驱动 (VFD Upgrade)', investment: 120000, savingPerYear: 85000, roi: 16.9, co2Reduction: 65, status: 'Identified' },
  { id: 'ESM-03', system: 'Boiler', measure: '烟气余热回收 (Flue Gas)', investment: 250000, savingPerYear: 110000, roi: 27.2, co2Reduction: 95, status: 'Accepted' },
  { id: 'ESM-04', system: 'Lighting', measure: 'LED 智能调光改造', investment: 30000, savingPerYear: 18000, roi: 20.0, co2Reduction: 12, status: 'Proposed' },
];

const CONSUMPTION_TREND = Array.from({ length: 24 }, (_, i) => {
  const isWorkHours = i >= 8 && i <= 18;
  const baseLoad = 200;
  const workLoad = isWorkHours ? 500 : 0;
  const actual = baseLoad + workLoad + Math.random() * 50;
  const baseline = baseLoad + workLoad; // Theoretical efficient baseline
  return {
    time: `${i}:00`,
    actual: actual,
    baseline: baseline,
    waste: Math.max(0, actual - baseline - 10) // Noise threshold
  };
});

const LOAD_DURATION = Array.from({length: 100}, (_, i) => ({
  percent: i,
  load: 1000 * Math.pow((100-i)/100, 3) + 200 // Typical LDC curve
}));

// --- Sub-Components ---

const EnergyFlowSankey = () => {
  return (
    <div className="w-full h-full relative bg-[#080b16] rounded border border-slate-800 overflow-hidden">
        <svg className="w-full h-full absolute inset-0">
            <defs>
                <linearGradient id="flowGood" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="flowBad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                </linearGradient>
            </defs>

            {/* Nodes */}
            <rect x="20" y="100" width="20" height="200" rx="4" fill="#3b82f6" /> {/* Source: Grid */}
            <text x="30" y="90" fill="#3b82f6" fontSize="10" textAnchor="middle">Grid Input</text>

            <rect x="200" y="50" width="20" height="80" rx="4" fill="#0ea5e9" /> {/* Sys: Motors */}
            <rect x="200" y="150" width="20" height="60" rx="4" fill="#0ea5e9" /> {/* Sys: HVAC */}
            <rect x="200" y="230" width="20" height="50" rx="4" fill="#0ea5e9" /> {/* Sys: Air */}
            <rect x="200" y="300" width="20" height="40" rx="4" fill="#0ea5e9" /> {/* Sys: Light */}

            <rect x="450" y="80" width="20" height="150" rx="4" fill="#10b981" /> {/* Useful Work */}
            <text x="460" y="70" fill="#10b981" fontSize="10" textAnchor="middle">Useful Energy</text>

            <rect x="450" y="280" width="20" height="80" rx="4" fill="#ef4444" /> {/* Losses */}
            <text x="460" y="375" fill="#ef4444" fontSize="10" textAnchor="middle">Losses</text>

            {/* Links Source -> Systems */}
            <path d="M40,200 C120,200 120,90 200,90" fill="none" stroke="#3b82f6" strokeWidth="30" opacity="0.3" />
            <path d="M40,200 C120,200 120,180 200,180" fill="none" stroke="#3b82f6" strokeWidth="20" opacity="0.3" />
            <path d="M40,200 C120,200 120,255 200,255" fill="none" stroke="#3b82f6" strokeWidth="15" opacity="0.3" />
            <path d="M40,200 C120,200 120,320 200,320" fill="none" stroke="#3b82f6" strokeWidth="10" opacity="0.3" />

            {/* Links Systems -> Useful */}
            <path d="M220,90 C335,90 335,100 450,100" fill="none" stroke="url(#flowGood)" strokeWidth="20" />
            <path d="M220,180 C335,180 335,150 450,150" fill="none" stroke="url(#flowGood)" strokeWidth="12" />
            <path d="M220,255 C335,255 335,180 450,180" fill="none" stroke="url(#flowGood)" strokeWidth="5" />
            <path d="M220,320 C335,320 335,200 450,200" fill="none" stroke="url(#flowGood)" strokeWidth="5" />

            {/* Links Systems -> Losses */}
            <path d="M220,90 C335,90 335,300 450,300" fill="none" stroke="url(#flowBad)" strokeWidth="10" />
            <path d="M220,180 C335,180 335,320 450,320" fill="none" stroke="url(#flowBad)" strokeWidth="8" />
            <path d="M220,255 C335,255 335,340 450,340" fill="none" stroke="url(#flowBad)" strokeWidth="10" /> {/* High loss for air */}
            <path d="M220,320 C335,320 335,350 450,350" fill="none" stroke="url(#flowBad)" strokeWidth="5" />
            
            {/* Labels */}
            <text x="210" y="80" fill="white" fontSize="9" textAnchor="middle">Motors</text>
            <text x="210" y="145" fill="white" fontSize="9" textAnchor="middle">HVAC</text>
            <text x="210" y="225" fill="white" fontSize="9" textAnchor="middle">Air</text>
            <text x="210" y="295" fill="white" fontSize="9" textAnchor="middle">Light</text>

            <text x="350" y="300" fill="#ef4444" fontSize="10" fontWeight="bold">Heat Loss</text>
            <text x="350" y="340" fill="#ef4444" fontSize="10" fontWeight="bold">Leakage</text>
        </svg>
    </div>
  );
};

export const EnergyEfficiencyDiagnosisView: React.FC = () => {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020503]">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#021c10] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Leaf size={14} className="animate-pulse" /> Sustainability & Efficiency
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程能效分析 <span className="text-emerald-500">与节能诊断中心</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Audit Status</div>
                <div className="text-lg font-bold text-white flex items-center justify-end gap-2">
                    <Activity size={16} className="text-green-500"/> In Progress
                </div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <button className="flex items-center gap-2 px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <FileText size={16} /> 生成诊断报告
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-2 pb-2">
         
         {/* LEFT COLUMN: Metrics & Radar */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Key Metrics */}
             <div className="grid grid-cols-2 gap-3">
                 {GLOBAL_KPIS.map((kpi, i) => (
                     <div key={i} className="bg-[#0b1210] border border-emerald-900/30 p-3 rounded hover:border-emerald-500/50 transition-colors">
                         <div className="text-[10px] text-slate-500 uppercase mb-1">{kpi.label}</div>
                         <div className="flex items-baseline gap-1">
                             <span className="text-xl font-mono font-bold text-white">{kpi.value}</span>
                             <span className="text-[10px] text-slate-400">{kpi.unit}</span>
                         </div>
                         <div className={`text-[10px] mt-1 font-bold ${kpi.trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                             {kpi.trend > 0 ? '+' : ''}{kpi.trend}% YoY
                         </div>
                     </div>
                 ))}
             </div>

             {/* Efficiency Radar */}
             <SciFiCard title="子系统能效对标 (Benchmarking)" subtitle="SCORE" className="flex-1 border-emerald-900/50">
                 <div className="h-full flex flex-col">
                     <div className="flex-1 min-h-[200px]">
                         <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={EFFICIENCY_RADAR}>
                                 <PolarGrid stroke="#334155" />
                                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                 <Radar name="Current" dataKey="Current" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} />
                                 <Radar name="Benchmark" dataKey="Benchmark" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                                 <Legend wrapperStyle={{fontSize: '10px'}} />
                                 <Tooltip contentStyle={{backgroundColor: '#020503', borderColor: '#10b981', color: '#fff'}} />
                             </RadarChart>
                         </ResponsiveContainer>
                     </div>
                     <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-200 mt-2">
                         <div className="flex items-center gap-1 font-bold mb-1"><AlertCircle size={12}/> Focus Area</div>
                         Compressed Air system efficiency is 20% below industry benchmark. High leakage suspected.
                     </div>
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER COLUMN: Analysis & Flows */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
             
             {/* Energy Flow Diagram */}
             <SciFiCard title="能源流向桑基图 (Energy Flow)" subtitle="LOSS ANALYSIS" className="h-[350px] border-slate-800 bg-[#020305]" noPadding>
                 <div className="w-full h-full p-4 relative">
                     <EnergyFlowSankey />
                     <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
                         <div className="bg-black/60 px-2 py-1 rounded border border-slate-700 text-[10px] text-slate-300">
                             Total Input: <span className="text-white font-bold">12,500 kWh</span>
                         </div>
                         <div className="bg-black/60 px-2 py-1 rounded border border-red-900/50 text-[10px] text-red-300">
                             Total Loss: <span className="font-bold">2,100 kWh (16.8%)</span>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Time Series Analysis */}
             <SciFiCard title="用能负荷曲线 (Load Profile)" subtitle="24H" className="flex-1 border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={CONSUMPTION_TREND} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} unit="kW" />
                             <Tooltip contentStyle={{backgroundColor: '#020503', borderColor: '#333', color: '#fff'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} verticalAlign="top" />
                             <Area type="step" dataKey="actual" stroke="#0ea5e9" fill="url(#colorActual)" name="Actual Load" strokeWidth={2} />
                             <Line type="step" dataKey="baseline" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal Baseline" />
                             <Area type="monotone" dataKey="waste" stroke="none" fill="url(#colorWaste)" name="Potential Waste" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT COLUMN: Opportunities & Calculator */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Load Duration Curve (Mini) */}
             <SciFiCard title="负荷持续曲线 (LDC)" subtitle="UTILIZATION" className="h-48 border-slate-800">
                 <div className="w-full h-full p-1">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={LOAD_DURATION}>
                             <XAxis dataKey="percent" type="number" hide />
                             <YAxis hide />
                             <Tooltip contentStyle={{backgroundColor: '#020503', borderColor: '#333'}} />
                             <Area type="monotone" dataKey="load" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                         </AreaChart>
                     </ResponsiveContainer>
                     <div className="text-[10px] text-center text-slate-500 mt-[-20px]">Base Load vs Peak Load</div>
                 </div>
             </SciFiCard>

             {/* Savings Opportunities */}
             <SciFiCard title="节能机会清单 (ESMs)" subtitle="OPPORTUNITIES" className="flex-1 border-emerald-900/50">
                 <div className="flex flex-col gap-3">
                     {SAVING_OPPS.map((opp) => (
                         <div 
                           key={opp.id} 
                           onClick={() => setSelectedOppId(opp.id === selectedOppId ? null : opp.id)}
                           className={`p-3 rounded border cursor-pointer transition-all duration-300 relative overflow-hidden group
                              ${selectedOppId === opp.id 
                                  ? 'bg-emerald-900/20 border-emerald-500' 
                                  : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                           `}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-1 rounded">{opp.system}</span>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded border ${opp.status === 'Accepted' ? 'text-green-400 border-green-800' : 'text-slate-400 border-slate-700'}`}>{opp.status}</span>
                             </div>
                             
                             <div className="text-sm font-bold text-white mb-2">{opp.measure}</div>
                             
                             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                 <div className="flex flex-col">
                                     <span>Invest:</span>
                                     <span className="text-slate-200">¥{opp.investment.toLocaleString()}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span>Saving/Yr:</span>
                                     <span className="text-emerald-400 font-bold">¥{opp.savingPerYear.toLocaleString()}</span>
                                 </div>
                             </div>

                             {selectedOppId === opp.id && (
                                 <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                                     <div className="flex justify-between items-center mb-2">
                                         <span className="text-xs text-slate-400 flex items-center gap-1"><Target size={12}/> ROI (Months)</span>
                                         <span className="text-sm font-mono font-bold text-yellow-400">{opp.roi}</span>
                                     </div>
                                     <div className="flex justify-between items-center mb-3">
                                         <span className="text-xs text-slate-400 flex items-center gap-1"><Leaf size={12}/> CO2 Reduction</span>
                                         <span className="text-sm font-mono font-bold text-green-400">{opp.co2Reduction} t</span>
                                     </div>
                                     <button className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                                         <Calculator size={12} /> Add to Plan
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
