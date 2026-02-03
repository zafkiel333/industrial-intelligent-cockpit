
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Swords, Target, TrendingUp, ShieldAlert, 
  Search, Users, Crosshair, Zap, 
  Globe, BarChart2, PieChart as PieIcon, 
  ArrowUpRight, ArrowDownRight, Scale, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis, CartesianGrid, ReferenceLine
} from 'recharts';

// --- Types ---

interface Competitor {
  id: string;
  name: string;
  marketShare: number; // %
  growth: number; // % YoY
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  strength: string;
  weakness: string;
  color: string;
}

interface CapabilityScore {
  subject: string;
  Us: number;
  Competitor: number;
  fullMark: number;
}

// --- Mock Data ---

const COMPETITORS: Competitor[] = [
  { id: 'C-01', name: 'Global Tech Inc.', marketShare: 32, growth: 5.2, threatLevel: 'Critical', strength: 'Product Ecosystem', weakness: 'High Price', color: '#ef4444' },
  { id: 'C-02', name: 'Nano Dynamics', marketShare: 18, growth: 12.5, threatLevel: 'High', strength: 'Innovation Speed', weakness: 'Service Coverage', color: '#f97316' },
  { id: 'C-03', name: 'Legacy Systems', marketShare: 15, growth: -2.1, threatLevel: 'Low', strength: 'Install Base', weakness: 'Outdated Tech', color: '#64748b' },
  { id: 'C-04', name: 'EcoSolutions', marketShare: 8, growth: 8.4, threatLevel: 'Medium', strength: 'Sustainability', weakness: 'Brand Awareness', color: '#10b981' },
];

const OUR_SHARE = 22; // Our market share

const MARKET_SEGMENTS = [
  { name: 'Our Company', value: 22, fill: '#0ea5e9' },
  { name: 'Global Tech', value: 32, fill: '#ef4444' },
  { name: 'Nano Dyn', value: 18, fill: '#f97316' },
  { name: 'Legacy Sys', value: 15, fill: '#64748b' },
  { name: 'Others', value: 13, fill: '#334155' },
];

const POSITIONING_DATA = [
  { x: 85, y: 80, z: 200, name: 'Our Company', fill: '#0ea5e9' }, // High Price, High Perf
  { x: 95, y: 70, z: 300, name: 'Global Tech', fill: '#ef4444' }, // Very High Price, Good Perf
  { x: 60, y: 90, z: 150, name: 'Nano Dynamics', fill: '#f97316' }, // Med Price, High Perf (Disruptor)
  { x: 50, y: 40, z: 180, name: 'Legacy Systems', fill: '#64748b' }, // Low Price, Low Perf
  { x: 70, y: 60, z: 80, name: 'EcoSolutions', fill: '#10b981' }, 
];

const CAPABILITY_DATA: Record<string, CapabilityScore[]> = {
  'C-01': [ // vs Global Tech
    { subject: '产品性能', Us: 85, Competitor: 90, fullMark: 100 },
    { subject: '价格优势', Us: 70, Competitor: 40, fullMark: 100 }, // We are cheaper
    { subject: '服务网络', Us: 90, Competitor: 95, fullMark: 100 },
    { subject: '品牌影响', Us: 80, Competitor: 100, fullMark: 100 },
    { subject: '交付速度', Us: 95, Competitor: 75, fullMark: 100 },
    { subject: '定制能力', Us: 90, Competitor: 60, fullMark: 100 },
  ],
  'C-02': [ // vs Nano Dynamics
    { subject: '产品性能', Us: 85, Competitor: 95, fullMark: 100 },
    { subject: '价格优势', Us: 70, Competitor: 80, fullMark: 100 },
    { subject: '服务网络', Us: 90, Competitor: 50, fullMark: 100 },
    { subject: '品牌影响', Us: 80, Competitor: 60, fullMark: 100 },
    { subject: '交付速度', Us: 95, Competitor: 90, fullMark: 100 },
    { subject: '定制能力', Us: 90, Competitor: 85, fullMark: 100 },
  ],
  // Default fallback
  'default': [
    { subject: '产品性能', Us: 85, Competitor: 70, fullMark: 100 },
    { subject: '价格优势', Us: 70, Competitor: 70, fullMark: 100 },
    { subject: '服务网络', Us: 90, Competitor: 70, fullMark: 100 },
    { subject: '品牌影响', Us: 80, Competitor: 70, fullMark: 100 },
    { subject: '交付速度', Us: 95, Competitor: 70, fullMark: 100 },
    { subject: '定制能力', Us: 90, Competitor: 70, fullMark: 100 },
  ]
};

const WIN_LOSS_DATA = [
  { factor: 'Price', Won: 40, Lost: 60 },
  { factor: 'Features', Won: 70, Lost: 30 },
  { factor: 'Service', Won: 80, Lost: 20 },
  { factor: 'Relation', Won: 50, Lost: 50 },
  { factor: 'Timing', Won: 60, Lost: 40 },
];

// --- Components ---

const ThreatBadge = ({ level }: { level: string }) => {
  const color = {
    'Critical': 'bg-red-500 text-white shadow-[0_0_10px_#ef4444]',
    'High': 'bg-orange-500 text-white',
    'Medium': 'bg-yellow-500 text-black',
    'Low': 'bg-slate-600 text-slate-300',
  }[level];
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>{level}</span>;
};

export const CustomerCompetitorAnalysisView: React.FC = () => {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(COMPETITORS[0].id);
  const activeCompetitor = COMPETITORS.find(c => c.id === selectedCompetitorId) || COMPETITORS[0];
  const radarData = CAPABILITY_DATA[selectedCompetitorId] || CAPABILITY_DATA['default'];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Strategic KPIs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
           <div>
             <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
                <Swords size={14} /> Competitive Intelligence
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                竞对态势 <span className="text-indigo-500">与市场份额分析</span>
             </h1>
           </div>
           
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-indigo-900/20 border border-indigo-500/30 rounded flex items-center gap-3">
                 <div className="text-right">
                    <div className="text-[10px] text-indigo-300 uppercase">Our Market Share</div>
                    <div className="text-xl font-mono font-bold text-white">22.0%</div>
                 </div>
                 <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="px-4 py-2 bg-slate-900/40 border border-slate-700 rounded flex items-center gap-3">
                 <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Growth YoY</div>
                    <div className="text-xl font-mono font-bold text-green-400">+4.5%</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Competitor Roster */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 overflow-y-auto pr-1">
           <SciFiCard title="主要竞争对手 (Roster)" subtitle="THREAT MATRIX" className="h-full border-slate-800">
              <div className="flex flex-col gap-3">
                 {COMPETITORS.map(comp => (
                    <div 
                      key={comp.id}
                      onClick={() => setSelectedCompetitorId(comp.id)}
                      className={`p-3 rounded border cursor-pointer transition-all duration-300 relative overflow-hidden group
                         ${selectedCompetitorId === comp.id 
                             ? 'bg-indigo-950/40 border-indigo-500 shadow-[inset_4px_0_0_#6366f1]' 
                             : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
                      `}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-sm ${selectedCompetitorId === comp.id ? 'text-white' : 'text-slate-300'}`}>
                                {comp.name}
                            </span>
                            <ThreatBadge level={comp.threatLevel} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-2">
                            <div>Share: <span className="text-white font-mono">{comp.marketShare}%</span></div>
                            <div>Growth: <span className={`${comp.growth > 0 ? 'text-green-400' : 'text-red-400'} font-mono`}>{comp.growth > 0 ? '+' : ''}{comp.growth}%</span></div>
                        </div>

                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full" style={{width: `${comp.marketShare}%`, backgroundColor: comp.color}}></div>
                        </div>
                        
                        {/* Expandable details on hover or selection */}
                        {(selectedCompetitorId === comp.id) && (
                            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                                <div>
                                    <div className="text-slate-500 uppercase text-[9px]">Strength</div>
                                    <div className="text-green-400">{comp.strength}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 uppercase text-[9px]">Weakness</div>
                                    <div className="text-red-400">{comp.weakness}</div>
                                </div>
                            </div>
                        )}
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Market Landscape */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Market Share Chart */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
               <SciFiCard title="市场份额分布" subtitle="MARKET SHARE" className="border-indigo-900/50">
                   <div className="flex items-center h-full">
                       <div className="w-1/2 h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie 
                                     data={MARKET_SEGMENTS} 
                                     innerRadius={60} 
                                     outerRadius={80} 
                                     paddingAngle={5} 
                                     dataKey="value"
                                   >
                                       {MARKET_SEGMENTS.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                       ))}
                                   </Pie>
                                   <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                               </PieChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 flex flex-col justify-center gap-3 pr-4">
                           {MARKET_SEGMENTS.map((seg, i) => (
                               <div key={i} className="flex justify-between items-center text-xs">
                                   <div className="flex items-center gap-2">
                                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: seg.fill}}></div>
                                       <span className="text-slate-300">{seg.name}</span>
                                   </div>
                                   <span className="font-mono font-bold text-white">{seg.value}%</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </SciFiCard>

               <SciFiCard title="竞争定位矩阵 (Price vs Perf)" subtitle="POSITIONING" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 10}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                               <XAxis type="number" dataKey="x" name="Price" unit="$" stroke="#64748b" label={{ value: 'Price Index', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                               <YAxis type="number" dataKey="y" name="Performance" unit="" stroke="#64748b" label={{ value: 'Performance', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                               <ZAxis type="number" dataKey="z" range={[100, 500]} name="Market Size" />
                               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#6366f1', color: '#fff'}} />
                               <Scatter name="Competitors" data={POSITIONING_DATA}>
                                   {POSITIONING_DATA.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.6} stroke={entry.fill} strokeWidth={2} />
                                   ))}
                               </Scatter>
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

           {/* Intelligence Feed */}
           <SciFiCard title="最新市场情报 (Intelligence Feed)" subtitle="AI MONITOR" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                   {[
                       { time: 'Today 10:00', type: 'Product', msg: `${activeCompetitor.name} launched new modular series.`, impact: 'High' },
                       { time: 'Yesterday', type: 'Pricing', msg: 'Global Tech increased service fees by 5%.', impact: 'Medium' },
                       { time: 'Mar 18', type: 'Personnel', msg: 'Nano Dynamics appointed new CTO from Tesla.', impact: 'Low' },
                   ].map((news, i) => (
                       <div key={i} className="flex gap-3 p-3 bg-slate-900/30 border-b border-slate-800 last:border-0 hover:bg-slate-800 transition-colors rounded">
                           <div className="flex flex-col items-center min-w-[60px]">
                               <span className="text-[10px] text-slate-500">{news.time}</span>
                               <span className={`text-[9px] px-1.5 rounded mt-1 ${news.impact === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                   {news.type}
                               </span>
                           </div>
                           <div className="flex-1 text-xs text-slate-300">
                               {news.msg}
                           </div>
                           <div className="text-[10px] text-slate-500">
                               Imp: {news.impact}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Head-to-Head */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Header for Comparison */}
           <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex items-center justify-between">
               <div className="text-center">
                   <div className="text-xs text-cyan-400 font-bold">US</div>
                   <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold mx-auto mt-1 border-2 border-cyan-400 shadow-[0_0_10px_cyan]">IT</div>
               </div>
               <div className="text-2xl font-bold text-slate-500">VS</div>
               <div className="text-center">
                   <div className="text-xs text-red-400 font-bold">THEM</div>
                   <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold mx-auto mt-1 border-2 border-red-400 shadow-[0_0_10px_red]">
                       {activeCompetitor.name.substring(0, 2).toUpperCase()}
                   </div>
               </div>
           </div>

           {/* Radar Chart */}
           <SciFiCard title="能力对比雷达" subtitle="HEAD-TO-HEAD" className="border-indigo-900/50">
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Us" dataKey="Us" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                           <Radar name="Them" dataKey="Competitor" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                           <Legend wrapperStyle={{fontSize: '12px'}}/>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Win/Loss Bar Chart */}
           <SciFiCard title="胜负手分析 (Win/Loss)" subtitle="BY FACTOR" className="flex-1 border-slate-800">
               <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={WIN_LOSS_DATA} layout="vertical" margin={{top: 5, right: 30, left: 10, bottom: 5}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                           <XAxis type="number" domain={[0, 100]} hide />
                           <YAxis dataKey="factor" type="category" stroke="#94a3b8" width={50} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                           <Legend wrapperStyle={{fontSize: '10px'}}/>
                           <Bar dataKey="Won" name="Win %" stackId="a" fill="#10b981" barSize={15} />
                           <Bar dataKey="Lost" name="Loss %" stackId="a" fill="#ef4444" barSize={15} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
               
               <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700 text-[10px] text-slate-300">
                   <div className="flex items-start gap-2">
                       <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                       <p>We consistently outperform {activeCompetitor.name} on <strong>Service</strong>, but lose on <strong>Price</strong> sensitivity.</p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
