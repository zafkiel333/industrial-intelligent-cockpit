
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BrainCircuit, Activity, Target, Zap, 
  GitBranch, Users, Clock, ShoppingCart,
  ArrowUpRight, AlertTriangle, Fingerprint,
  MessageSquare, MousePointer, Eye
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, Cell
} from 'recharts';

// --- Mock Data ---

// Customer Segments (RFM Clustering Simulation)
// X: Recency (Days since last action, inverted for chart), Y: Frequency, Z: Monetary
const SEGMENT_CLUSTERS = [
  { x: 90, y: 80, z: 5000, cluster: 'Champions', fill: '#10b981' }, // High Freq, Recent
  { x: 85, y: 60, z: 3000, cluster: 'Loyal', fill: '#3b82f6' },
  { x: 70, y: 90, z: 1000, cluster: 'Promising', fill: '#0ea5e9' },
  { x: 40, y: 20, z: 500, cluster: 'At Risk', fill: '#f59e0b' },
  { x: 20, y: 10, z: 200, cluster: 'Hibernating', fill: '#64748b' },
  { x: 10, y: 5, z: 100, cluster: 'Lost', fill: '#ef4444' },
];

// Generate scatter points around clusters
const generateScatterData = () => {
  let data = [];
  SEGMENT_CLUSTERS.forEach(center => {
    for (let i = 0; i < 20; i++) {
      data.push({
        x: center.x + (Math.random() - 0.5) * 15,
        y: center.y + (Math.random() - 0.5) * 15,
        z: center.z + (Math.random() - 0.5) * 500,
        cluster: center.cluster,
        fill: center.fill
      });
    }
  });
  return data;
};

const SCATTER_DATA = generateScatterData();

// Behavioral DNA (Radar)
const BEHAVIOR_DNA = [
  { subject: '价格敏感度', A: 85, fullMark: 100 },
  { subject: '品牌忠诚度', A: 65, fullMark: 100 },
  { subject: '互动频率', A: 90, fullMark: 100 },
  { subject: '新品尝鲜', A: 40, fullMark: 100 },
  { subject: '社交分享', A: 55, fullMark: 100 },
  { subject: '服务依赖', A: 70, fullMark: 100 },
];

// Activity Heatmap (24h)
const ACTIVITY_HEATMAP = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: Math.floor(Math.random() * 100) + (i > 9 && i < 18 ? 50 : 0) // Peak during day
}));

// Real-time Event Stream
const LIVE_EVENTS = [
  { id: 1, time: '10:42:05', user: 'User_9921', action: 'Cart Abandoned', score: 0.85, prediction: 'High Churn Risk' },
  { id: 2, time: '10:41:58', user: 'User_8832', action: 'Pricing Viewed', score: 0.65, prediction: 'Comparison Shopping' },
  { id: 3, time: '10:41:45', user: 'User_1022', action: 'Feature Used: Export', score: 0.92, prediction: 'Engaged / Upsell' },
  { id: 4, time: '10:41:12', user: 'User_5541', action: 'Ticket Created', score: 0.45, prediction: 'Frustration Detected' },
  { id: 5, time: '10:40:30', user: 'User_3399', action: 'Login (Mobile)', score: 0.78, prediction: 'Routine Check' },
];

// --- Components ---

const HeatmapBar: React.FC<{ index: number, value: number }> = ({ index, value }) => {
  // Color scale based on value
  const opacity = 0.2 + (value / 150) * 0.8;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full bg-purple-500 rounded-sm transition-all duration-500 hover:bg-purple-400" 
           style={{ height: `${value / 2}px`, opacity }} 
           title={`Hour ${index}: ${value} events`}>
      </div>
      <div className="text-[9px] text-slate-600 font-mono">{index}</div>
    </div>
  );
};

export const CustomerBehaviorView: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState('Champions');
  const [modelAccuracy, setModelAccuracy] = useState(94.2);

  // Simulate model accuracy fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setModelAccuracy(prev => 94 + (Math.random() - 0.5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. AI Command Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-purple-900/50 pb-4 bg-gradient-to-r from-[#130b26] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1 uppercase tracking-wider">
             <BrainCircuit size={14} className="animate-pulse" /> Predictive AI Engine v4.0
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户行为分析 <span className="text-purple-500">与预测模型</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Model Accuracy</div>
                <div className="text-2xl font-mono font-bold text-green-400">{modelAccuracy.toFixed(1)}%</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Predictions Today</div>
                <div className="text-2xl font-mono font-bold text-white">12,405</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Active Signals</div>
                <div className="text-2xl font-mono font-bold text-purple-400">854</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Behavioral DNA & Heatmap */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Behavior Radar */}
           <SciFiCard title="行为基因图谱 (DNA)" subtitle="SEGMENT TRAITS" className="border-purple-900/50">
               <div className="h-56 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={BEHAVIOR_DNA}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Traits" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-0 right-0 text-[10px] text-purple-400 font-bold border border-purple-500/30 px-2 py-1 rounded bg-purple-900/20">
                       {selectedCluster}
                   </div>
               </div>
               <div className="mt-2 space-y-2">
                   <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                       <span className="text-slate-400">Primary Motivation</span>
                       <span className="text-white font-bold">Efficiency</span>
                   </div>
                   <div className="flex justify-between text-xs border-b border-slate-800 pb-1">
                       <span className="text-slate-400">Risk Tolerance</span>
                       <span className="text-yellow-400 font-bold">Medium</span>
                   </div>
                   <div className="flex justify-between text-xs">
                       <span className="text-slate-400">Engagement Channel</span>
                       <span className="text-cyan-400 font-bold">Mobile App</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Activity Heatmap */}
           <SciFiCard title="活跃时段分布 (24H)" subtitle="HEATMAP" className="flex-1 border-slate-800">
               <div className="flex items-end gap-0.5 h-32 mt-4 border-b border-slate-700">
                   {ACTIVITY_HEATMAP.map(h => (
                       <HeatmapBar key={h.hour} index={h.hour} value={h.value} />
                   ))}
               </div>
               <div className="mt-4 flex gap-2 justify-center">
                   <div className="flex items-center gap-1 text-[10px] text-slate-500">
                       <Clock size={10} /> Peak: 14:00 - 16:00
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Matrix (Clustering) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* RFM 3D Visualization Placeholder */}
           <SciFiCard title="RFM 客户价值分层 (3D Clustering)" subtitle="INTERACTIVE MATRIX" className="flex-1 border-purple-900/50 bg-[#080514]" noPadding>
               <div className="w-full h-full p-4 relative flex flex-col">
                   
                   {/* Legend */}
                   <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-black/60 p-2 rounded border border-slate-800">
                       {SEGMENT_CLUSTERS.map(c => (
                           <div 
                             key={c.cluster} 
                             className={`flex items-center gap-2 text-[10px] cursor-pointer hover:bg-white/10 px-1 rounded ${selectedCluster === c.cluster ? 'text-white font-bold' : 'text-slate-400'}`}
                             onClick={() => setSelectedCluster(c.cluster)}
                           >
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: c.fill}}></div>
                               {c.cluster}
                           </div>
                       ))}
                   </div>

                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                           <XAxis type="number" dataKey="x" name="Recency" stroke="#64748b" label={{ value: 'Recency (Score)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }} />
                           <YAxis type="number" dataKey="y" name="Frequency" stroke="#64748b" label={{ value: 'Frequency (Score)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <ZAxis type="number" dataKey="z" range={[50, 400]} name="Monetary" />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#8b5cf6', color: '#fff'}} />
                           <Scatter name="Customers" data={SCATTER_DATA} fill="#8884d8">
                               {SCATTER_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={selectedCluster === entry.cluster ? 1 : 0.2} />
                               ))}
                           </Scatter>
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Prediction & Forecasting */}
           <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-6">
               
               <SciFiCard title="流失风险预测" subtitle="FORECAST" className="border-slate-800">
                   <div className="h-full w-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length: 12}, (_,i) => ({ month: i+1, risk: 20 + Math.random()*10 - i*0.5 }))}>
                               <defs>
                                   <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#ef4444', color: '#fff'}} />
                               <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#colorRisk)" name="Avg Risk Score" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="购买意向趋势" subtitle="PROPENSITY" className="border-slate-800">
                   <div className="h-full w-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={Array.from({length: 12}, (_,i) => ({ month: i+1, prob: 40 + i*2 + Math.random()*5 }))}>
                               <defs>
                                   <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#10b981', color: '#fff'}} />
                               <Area type="monotone" dataKey="prob" stroke="#10b981" fill="url(#colorProb)" name="Purchase Prob" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Event Stream & Next Best Action */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Real-time Signal Feed */}
           <SciFiCard title="实时行为信号流" subtitle="LIVE STREAM" className="flex-1 border-purple-900/50">
               <div className="flex flex-col gap-0 relative">
                   {/* Timeline Line */}
                   <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-800"></div>
                   
                   {LIVE_EVENTS.map((event, i) => (
                       <div key={i} className="relative pl-8 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                           {/* Dot */}
                           <div className={`absolute left-[9px] top-4 w-1.5 h-1.5 rounded-full z-10 
                               ${event.score > 0.8 ? 'bg-green-500 shadow-[0_0_8px_lime]' : event.score < 0.5 ? 'bg-red-500' : 'bg-purple-500'}
                           `}></div>
                           
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                               <span className="text-[10px] font-bold text-cyan-300">{event.user}</span>
                           </div>
                           <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
                               {event.action.includes('Cart') ? <ShoppingCart size={12}/> : 
                                event.action.includes('Ticket') ? <MessageSquare size={12}/> : 
                                event.action.includes('View') ? <Eye size={12}/> : <MousePointer size={12}/>}
                               {event.action}
                           </div>
                           <div className="text-[10px] text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800/50 flex items-center gap-1 group-hover:border-purple-500/30 transition-colors">
                               <Fingerprint size={10} className="text-purple-500" />
                               AI: {event.prediction}
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Next Best Action (NBA) */}
           <SciFiCard title="智能推荐决策 (NBA)" subtitle="ACTIONABLE" className="border-slate-800">
               <div className="space-y-3">
                   <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded relative overflow-hidden group hover:bg-indigo-900/30 transition-colors cursor-pointer">
                       <div className="absolute top-0 right-0 p-1">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                       </div>
                       <div className="text-xs text-indigo-300 font-bold mb-1 flex items-center gap-2">
                           <Zap size={14} /> Send Promotion
                       </div>
                       <p className="text-[10px] text-slate-400 leading-tight">
                           Cluster "Promising" showing high interest in Model X. Send 10% discount coupon now.
                       </p>
                   </div>

                   <div className="p-3 bg-red-900/20 border border-red-500/30 rounded hover:bg-red-900/30 transition-colors cursor-pointer">
                       <div className="text-xs text-red-300 font-bold mb-1 flex items-center gap-2">
                           <AlertTriangle size={14} /> Retention Call
                       </div>
                       <p className="text-[10px] text-slate-400 leading-tight">
                           "At Risk" customer User_9921 abandoned cart. Schedule proactive support call.
                       </p>
                   </div>

                   <div className="p-3 bg-green-900/20 border border-green-500/30 rounded hover:bg-green-900/30 transition-colors cursor-pointer">
                       <div className="text-xs text-green-300 font-bold mb-1 flex items-center gap-2">
                           <ArrowUpRight size={14} /> Upsell Opportunity
                       </div>
                       <p className="text-[10px] text-slate-400 leading-tight">
                           "Loyal" segment usage spike. Suggest Enterprise Plan upgrade.
                       </p>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
