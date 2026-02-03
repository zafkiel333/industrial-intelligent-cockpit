
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Trophy, TrendingUp, Clock, Target, 
  Users, Zap, BarChart2, Award, 
  AlertTriangle, ArrowUpRight, Search, 
  Filter, Download, BrainCircuit, Timer,
  PieChart as PieIcon, LineChart as LineChartIcon
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';

// --- Types ---

interface ExpertMetric {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  csat: number; // 0-5
  resolutionTime: number; // mins
  volume: number;
  complexityScore: number; // 0-100
  badges: string[];
}

interface StatTileProps {
  stat: {
    label: string;
    value: string;
    unit: string;
    trend: string;
    status: string;
    icon: any;
  };
}

// --- Mock Data ---

const GLOBAL_STATS = [
  { label: '平均响应时间 (MTTR)', value: '18.5', unit: 'min', trend: '-12%', status: 'good', icon: Timer },
  { label: '一次性解决率 (FCR)', value: '94.2', unit: '%', trend: '+2.5%', status: 'good', icon: Target },
  { label: '客户满意度 (CSAT)', value: '4.92', unit: '/5.0', trend: 'Stable', status: 'neutral', icon: Trophy },
  { label: '服务成本节省 (Savings)', value: '¥2.4M', unit: 'YTD', trend: '+18%', status: 'good', icon: TrendingUp },
];

const EXPERT_LEADERBOARD: ExpertMetric[] = [
  { id: 'E1', name: 'Dr. Zhang Wei', role: 'Propulsion Expert', avatarColor: '#0ea5e9', csat: 4.98, resolutionTime: 25, volume: 142, complexityScore: 95, badges: ['Top Rated', 'Complex Solver'] },
  { id: 'E2', name: 'Sarah Li', role: 'Automation Lead', avatarColor: '#8b5cf6', csat: 4.85, resolutionTime: 15, volume: 210, complexityScore: 70, badges: ['Speed Demon'] },
  { id: 'E3', name: 'Mike Chen', role: 'Hydraulics Eng.', avatarColor: '#f59e0b', csat: 4.72, resolutionTime: 35, volume: 98, complexityScore: 88, badges: [] },
  { id: 'E4', name: 'Elena Wu', role: 'Electrical Spec.', avatarColor: '#10b981', csat: 4.90, resolutionTime: 20, volume: 165, complexityScore: 82, badges: ['Customer Favorite'] },
  { id: 'E5', name: 'Tom Wang', role: 'Junior Tech', avatarColor: '#64748b', csat: 4.20, resolutionTime: 45, volume: 50, complexityScore: 40, badges: ['Rookie'] },
];

const EFFICIENCY_TREND = [
  { month: 'W1', volume: 120, time: 45, satisfaction: 4.2 },
  { month: 'W2', volume: 135, time: 42, satisfaction: 4.3 },
  { month: 'W3', volume: 150, time: 38, satisfaction: 4.5 },
  { month: 'W4', volume: 180, time: 30, satisfaction: 4.6 },
  { month: 'W5', volume: 160, time: 25, satisfaction: 4.8 },
  { month: 'W6', volume: 210, time: 22, satisfaction: 4.9 },
];

// Scatter: X=Time, Y=Complexity, Z=Satisfaction (Size)
const SCATTER_MATRIX = EXPERT_LEADERBOARD.flatMap(exp => 
  Array.from({length: 10}, () => ({
    x: exp.resolutionTime + (Math.random() - 0.5) * 10,
    y: exp.complexityScore + (Math.random() - 0.5) * 10,
    z: exp.csat * 20,
    name: exp.name,
    fill: exp.avatarColor
  }))
);

const SKILL_GAP_DATA = [
  { subject: 'Vibration Analysis', Demand: 90, Supply: 85, fullMark: 100 },
  { subject: 'PLC Programming', Demand: 80, Supply: 95, fullMark: 100 }, // Oversupply
  { subject: 'Thermal Imaging', Demand: 70, Supply: 60, fullMark: 100 },
  { subject: 'Hydraulics', Demand: 85, Supply: 70, fullMark: 100 }, // Gap
  { subject: 'Cybersecurity', Demand: 60, Supply: 40, fullMark: 100 }, // Gap
  { subject: 'Remote AR Ops', Demand: 95, Supply: 90, fullMark: 100 },
];

const SAVINGS_DATA = [
  { category: 'Travel Costs', remote: 50, onsite: 450 },
  { category: 'Downtime Loss', remote: 200, onsite: 1200 },
  { category: 'Personnel Hrs', remote: 100, onsite: 300 },
  { category: 'Logistics', remote: 20, onsite: 150 },
];

// --- Components ---

const StatTile: React.FC<StatTileProps> = ({ stat }) => (
  <div className="bg-[#0b101e] border border-slate-800 p-4 rounded-lg flex items-center justify-between group hover:border-indigo-500/50 transition-all shadow-lg relative overflow-hidden">
    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
      <stat.icon size={64} />
    </div>
    <div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
        {stat.label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-mono font-bold text-white">{stat.value}</span>
        <span className="text-xs text-slate-400">{stat.unit}</span>
      </div>
    </div>
    <div className={`text-xs font-bold px-2 py-1 rounded border ${
      stat.status === 'good' ? 'text-green-400 border-green-900/50 bg-green-900/20' : 
      stat.status === 'bad' ? 'text-red-400 border-red-900/50 bg-red-900/20' : 
      'text-yellow-400 border-yellow-900/50 bg-yellow-900/20'
    }`}>
      {stat.trend}
    </div>
  </div>
);

export const RemoteExpertEvaluationView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Month');

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
               <BarChart2 size={14} /> Service Intelligence
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               专家服务 <span className="text-indigo-500">效能评估驾驶舱</span>
            </h1>
          </div>
          
          <div className="flex gap-2">
             <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                {['Week', 'Month', 'Quarter', 'Year'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setTimeRange(t)}
                     className={`px-3 py-1.5 rounded text-xs font-bold transition-all
                        ${timeRange === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                     `}
                   >
                     {t}
                   </button>
                ))}
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded border border-slate-600 transition-colors">
                <Download size={14} /> Export Report
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {GLOBAL_STATS.map((stat, i) => <StatTile key={i} stat={stat} />)}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Trends & Analysis */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Efficiency Trend Chart */}
           <SciFiCard title="服务效能综合趋势 (Efficiency Trend)" subtitle="VOLUME vs TIME" className="h-[320px] border-indigo-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={EFFICIENCY_TREND} margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                           <defs>
                               <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Tickets', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (min)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#3b82f6', color: '#fff'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                           <Area yAxisId="left" type="monotone" dataKey="volume" name="Ticket Volume" fill="url(#colorVol)" stroke="#3b82f6" />
                           <Line yAxisId="right" type="monotone" dataKey="time" name="Avg Resolution Time" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                           <Line yAxisId="right" type="monotone" dataKey="satisfaction" name="CSAT (x10)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Row 2: Value & Skills */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
               
               {/* Cost Savings */}
               <SciFiCard title="远程服务价值分析 (ROI)" subtitle="REMOTE vs ONSITE" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={SAVINGS_DATA} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                               <XAxis type="number" stroke="#64748b" hide />
                               <YAxis dataKey="category" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 10}} />
                               <Tooltip 
                                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                   contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#333', color: '#fff'}} 
                               />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Bar dataKey="remote" name="Remote Cost" stackId="a" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} />
                               <Bar dataKey="onsite" name="Savings (Avoided Cost)" stackId="a" fill="#334155" barSize={20} radius={[0, 4, 4, 0]}>
                                   {SAVINGS_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fillOpacity={0.5} stroke="#64748b" strokeDasharray="2 2" />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Skill Gap Analysis */}
               <SciFiCard title="技能供需匹配度 (Skill Gap)" subtitle="DEMAND vs SUPPLY" className="border-slate-800">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_GAP_DATA}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Market Demand" dataKey="Demand" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.2} />
                               <Radar name="Expert Supply" dataKey="Supply" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                               <Legend wrapperStyle={{fontSize: '10px'}}/>
                               <Tooltip contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#333'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>
           
           {/* Matrix: Complexity vs Time */}
           <SciFiCard title="专家效能矩阵 (The Matrix)" subtitle="COMPLEXITY vs TIME" className="h-[300px] border-indigo-900/30 bg-[#080514]" noPadding>
               <div className="w-full h-full p-4 relative">
                   {/* Quadrant Labels */}
                   <div className="absolute top-4 left-4 text-[9px] text-yellow-500 font-bold bg-black/50 px-2 py-1 rounded">High Value (Difficult but Fast)</div>
                   <div className="absolute bottom-4 right-4 text-[9px] text-red-500 font-bold bg-black/50 px-2 py-1 rounded">Low Efficiency (Simple but Slow)</div>
                   
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="x" name="Resolution Time" unit="min" stroke="#64748b" label={{ value: 'Resolution Time (min)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }} />
                           <YAxis type="number" dataKey="y" name="Complexity" stroke="#64748b" label={{ value: 'Task Complexity', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <ZAxis type="number" dataKey="z" range={[50, 400]} name="CSAT Score" />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0c1d', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Scatter name="Cases" data={SCATTER_MATRIX}>
                               {SCATTER_MATRIX.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.6} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Leaderboard & Insights */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Expert Hall of Fame */}
           <SciFiCard title="专家荣誉榜 (Hall of Fame)" subtitle="TOP PERFORMERS" className="flex-1 border-indigo-900/50">
               <div className="flex flex-col gap-3">
                   {EXPERT_LEADERBOARD.map((expert, i) => (
                       <div key={expert.id} className="relative p-3 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-800 transition-all group overflow-hidden">
                           {/* Rank Indicator */}
                           <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl text-[10px] font-bold
                               ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-500'}
                           `}>
                               #{i+1}
                           </div>
                           
                           <div className="flex items-center gap-3 mb-2">
                               <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{backgroundColor: expert.avatarColor}}>
                                   {expert.name.charAt(0)}
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-white">{expert.name}</div>
                                   <div className="text-[10px] text-slate-400">{expert.role}</div>
                               </div>
                           </div>

                           {/* Stats Grid */}
                           <div className="grid grid-cols-3 gap-2 text-center my-2 bg-black/20 p-1 rounded">
                               <div>
                                   <div className="text-[9px] text-slate-500 uppercase">CSAT</div>
                                   <div className="text-xs font-bold text-green-400">{expert.csat}</div>
                               </div>
                               <div>
                                   <div className="text-[9px] text-slate-500 uppercase">Time</div>
                                   <div className="text-xs font-bold text-white">{expert.resolutionTime}m</div>
                               </div>
                               <div>
                                   <div className="text-[9px] text-slate-500 uppercase">Vol</div>
                                   <div className="text-xs font-bold text-indigo-400">{expert.volume}</div>
                               </div>
                           </div>

                           {/* Badges */}
                           <div className="flex flex-wrap gap-1 mt-2">
                               {expert.badges.map(b => (
                                   <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                       <Award size={8} /> {b}
                                   </span>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* AI Insight Feed */}
           <SciFiCard title="AI 效能洞察" subtitle="RECOMMENDATIONS" className="h-[250px] border-slate-800">
               <div className="space-y-3 overflow-y-auto h-full pr-1 custom-scrollbar">
                   <div className="p-3 bg-red-900/10 border border-red-500/20 rounded flex items-start gap-3">
                       <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-red-200">Skill Shortage Alert</div>
                           <p className="text-[10px] text-slate-400 mt-1">High demand for "Hydraulics" exceeds current expert availability by 15%. Recommend cross-training or recruiting.</p>
                       </div>
                   </div>
                   <div className="p-3 bg-green-900/10 border border-green-500/20 rounded flex items-start gap-3">
                       <BrainCircuit size={16} className="text-green-400 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-green-200">Efficiency Spike</div>
                           <p className="text-[10px] text-slate-400 mt-1">Dr. Zhang's use of "AR Annotation" reduced resolution time by 30% in complex vibration cases.</p>
                       </div>
                   </div>
                   <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded flex items-start gap-3">
                       <Zap size={16} className="text-blue-400 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-blue-200">Knowledge Reuse</div>
                           <p className="text-[10px] text-slate-400 mt-1">45% of L1 tickets were solved via Knowledge Base articles this week, freeing up L3 experts.</p>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
