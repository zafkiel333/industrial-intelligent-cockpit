
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[res-env-compliance]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/res-env-compliance';
import { 
  Leaf, Wind, Droplets, Activity, 
  AlertTriangle, CheckCircle2, FileCheck, 
  TrendingDown, Globe, ShieldCheck, 
  Microscope, Siren, RefreshCw, Send,
  UserCheck, Fingerprint, Calendar, MessageSquare, Scan
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, ReferenceLine, RadialBarChart, RadialBar, Legend,
  LineChart, Line, ComposedChart, PieChart, Pie
} from 'recharts';

// --- Types ---

interface Pollutant {
  id: string;
  name: string;
  value: number;
  unit: string;
  limit: number;
  trend: 'Up' | 'Down' | 'Stable';
  status: 'Normal' | 'Warning' | 'Critical';
}

interface ComplianceEvent {
  time: string;
  source: string;
  event: string;
  type: 'Auto' | 'Expert' | 'System';
  result: 'Pass' | 'Fail' | 'Flagged';
}

// --- Mock Data ---

const POLLUTANTS: Pollutant[] = [
  { id: 'p1', name: '二氧化硫 (SO₂)', value: 12.5, unit: 'mg/m³', limit: 35, trend: 'Down', status: 'Normal' },
  { id: 'p2', name: '氮氧化物 (NOx)', value: 42.8, unit: 'mg/m³', limit: 50, trend: 'Up', status: 'Warning' },
  { id: 'p3', name: '颗粒物 (PM)', value: 4.2, unit: 'mg/m³', limit: 10, trend: 'Stable', status: 'Normal' },
  { id: 'p4', name: '化学需氧量 (COD)', value: 38.5, unit: 'mg/L', limit: 50, trend: 'Down', status: 'Normal' },
  { id: 'p5', name: '氨氮 (NH3-N)', value: 0.8, unit: 'mg/L', limit: 5.0, trend: 'Stable', status: 'Normal' },
  { id: 'p6', name: 'pH 值', value: 7.2, unit: '', limit: 9.0, trend: 'Stable', status: 'Normal' },
];

const EMISSION_TREND = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  so2: Math.random() * 10 + 10,
  nox: Math.random() * 15 + 35, // Near limit
  pm: Math.random() * 5 + 2,
  limit: 50
}));

const QUOTA_DATA = [
  { name: '已排放', value: 65, fill: '#ef4444' },
  { name: '剩余配额', value: 35, fill: '#10b981' },
];

const AUDIT_LOGS: ComplianceEvent[] = [
  { time: '10:45:00', source: 'CEMS-01', event: 'Hourly Data Upload', type: 'System', result: 'Pass' },
  { time: '10:42:15', source: 'Dr. Zhang', event: 'NOx Spike Analysis', type: 'Expert', result: 'Flagged' },
  { time: '10:30:00', source: 'AI Monitor', event: 'Flow Rate Anomaly', type: 'Auto', result: 'Pass' },
  { time: '09:00:00', source: 'Env Bureau', event: 'Remote Sampling', type: 'System', result: 'Pass' },
];

const EXPERT_NOTES = [
  "NOx 浓度在 10:00-10:30 期间出现波动，建议检查脱硝催化剂活性。",
  "COD 在线监测仪需在 24 小时内进行标定，以此确保合规数据上传准确性。",
  "当前排放总量已达年度配额的 65%，建议启动三级节能减排预案。"
];

// --- Components ---

const MetricTile = ({ item }: { item: Pollutant }) => (
  <div className={`relative overflow-hidden p-3 rounded border transition-all hover:scale-[1.02] group
      ${item.status === 'Critical' ? 'bg-red-950/20 border-red-500/50' : 
        item.status === 'Warning' ? 'bg-amber-950/20 border-amber-500/50' : 
        'bg-slate-900/40 border-slate-700 hover:border-emerald-500/50'}
  `}>
      <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
              {item.name.includes('SO') || item.name.includes('NO') ? <Wind size={14} className={item.status === 'Normal' ? 'text-slate-400' : 'text-amber-400'}/> : <Droplets size={14} className="text-cyan-400"/>}
              <span className="text-xs font-bold text-slate-200">{item.name}</span>
          </div>
          <span className={`text-[10px] px-1.5 rounded uppercase font-bold
              ${item.status === 'Normal' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}
          `}>{item.status}</span>
      </div>
      
      <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold text-white">{item.value}</span>
          <span className="text-[10px] text-slate-500">{item.unit}</span>
      </div>
      
      {/* Progress Bar relative to Limit */}
      <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
             className={`h-full transition-all duration-1000 ${item.status === 'Critical' ? 'bg-red-500' : item.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
             style={{width: `${Math.min(100, (item.value / item.limit) * 100)}%`}}
          ></div>
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-slate-600">
          <span>0</span>
          <span>Limit: {item.limit}</span>
      </div>
  </div>
);

const ComplianceBadge = ({ score }: { score: number }) => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#064e3b" strokeWidth="12" />
            <circle 
              cx="64" cy="64" r="56" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="12" 
              strokeDasharray="351" 
              strokeDashoffset={351 - (351 * score) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
        </svg>
        <div className="absolute flex flex-col items-center">
             <span className="text-3xl font-bold font-mono text-white">{score}</span>
             <span className="text-[9px] uppercase text-emerald-500 font-bold">Health Score</span>
        </div>
    </div>
);

export const EnvironmentalComplianceView: React.FC = () => {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020304]">
      
      {/* 1. Header: Eco-Guard Command */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#021a12] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Leaf size={14} className="animate-pulse" /> Eco-Guard Remote Service
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程环保排放 <span className="text-emerald-500">合规评估中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Compliance Status</div>
                <div className="text-xl font-bold text-green-400 flex items-center justify-end gap-2">
                    <ShieldCheck size={18}/> COMPLIANT
                </div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Expert Connected</div>
                <div className="text-xl font-bold text-white flex items-center justify-end gap-2">
                    <UserCheck size={18} className="text-cyan-400"/> Dr. Zhang
                </div>
             </div>
             <button className="ml-4 px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2">
                <FileCheck size={16} /> 生成审计报告
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: CEMS Telemetry Matrix */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             <SciFiCard title="CEMS 实时遥测矩阵" subtitle="SENSORS" className="flex-1 border-emerald-900/30">
                 <div className="flex flex-col gap-3">
                     {POLLUTANTS.map((p) => (
                         <MetricTile key={p.id} item={p} />
                     ))}
                 </div>
             </SciFiCard>
             
             <div className="p-3 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-400 flex items-center gap-3">
                 <RefreshCw size={16} className="text-emerald-500 animate-spin-slow" />
                 <div>
                     <div className="font-bold text-white">Data Sync Active</div>
                     <div className="text-[9px]">Last packet: 12ms ago via IoT Gateway</div>
                 </div>
             </div>
         </div>

         {/* CENTER: Digital Twin & Trends */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
             
             {/* 3D Visualizer */}
             <SciFiCard title="排放源数字孪生 (Digital Twin)" subtitle="OUTFALL #04" className="h-[350px] border-emerald-900/50 bg-[#050805]" noPadding>
                 <div className="w-full h-full relative">
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                         backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}></div>

                     {/* 3D Model: Using Outfall as proxy for discharge point */}
                     <div className="absolute inset-0 z-0">
                         <ThreeScene type="outfall" color="#10b981" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
                     </div>

                     {/* AR Data Tags */}
                     <div className="absolute top-[20%] right-[20%] z-10 animate-pulse-slow">
                         <div className="flex items-center gap-2">
                             <div className="bg-black/70 backdrop-blur border border-emerald-500/50 px-2 py-1 rounded text-[10px] text-emerald-300">
                                 Flow: 1250 m³/h
                             </div>
                             <div className="w-8 h-[1px] bg-emerald-500"></div>
                             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                         </div>
                     </div>

                     <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
                         <div className="bg-black/60 px-3 py-1 rounded border border-slate-600 text-xs text-white font-mono flex items-center gap-2">
                             <Scan size={14} className="text-cyan-400"/> REMOTE INSPECTION MODE
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Emission Trend Chart */}
             <SciFiCard title="排放浓度趋势 (24H)" subtitle="VS LIMIT" className="flex-1 border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={EMISSION_TREND} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                             <defs>
                                 <linearGradient id="colorNox" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                             <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                             <Tooltip contentStyle={{backgroundColor: '#020503', borderColor: '#10b981', color: '#fff'}} />
                             <Legend wrapperStyle={{fontSize: '10px'}} verticalAlign="top"/>
                             
                             <Area type="monotone" dataKey="nox" name="NOx (mg/m³)" stroke="#f59e0b" fill="url(#colorNox)" strokeWidth={2} />
                             <Line type="monotone" dataKey="so2" name="SO₂ (mg/m³)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                             
                             <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" label={{value: 'Limit', fill: 'red', fontSize: 10, position: 'insideTopLeft'}} />
                         </ComposedChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

         {/* RIGHT: Expert Audit & Reports */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Compliance Score */}
             <SciFiCard title="合规健康度" subtitle="SCORE" className="border-emerald-900/30">
                 <div className="flex flex-col items-center py-2">
                     <ComplianceBadge score={94} />
                     <div className="grid grid-cols-2 gap-4 w-full mt-4">
                         <div className="text-center p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="text-[9px] text-slate-500 uppercase">Risk Level</div>
                             <div className="text-sm font-bold text-green-400">LOW</div>
                         </div>
                         <div className="text-center p-2 bg-slate-900/50 rounded border border-slate-800">
                             <div className="text-[9px] text-slate-500 uppercase">Cert Status</div>
                             <div className="text-sm font-bold text-white">Valid</div>
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Quota Usage */}
             <SciFiCard title="年度排放配额 (Quota)" className="border-slate-800">
                 <div className="flex items-center h-32">
                     <div className="w-1/2 h-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <Pie 
                                   data={QUOTA_DATA} 
                                   innerRadius={25} 
                                   outerRadius={40} 
                                   dataKey="value"
                                   paddingAngle={5}
                                 >
                                     <Cell fill="#ef4444" />
                                     <Cell fill="#10b981" />
                                 </Pie>
                             </PieChart>
                         </ResponsiveContainer>
                     </div>
                     <div className="flex-1 text-xs">
                         <div className="mb-2">
                             <span className="text-slate-400 block">Total Used</span>
                             <span className="text-lg font-bold text-white">65%</span>
                         </div>
                         <div className="text-[10px] text-yellow-400 flex items-center gap-1">
                             <AlertTriangle size={10} /> Projected to exceed in Q4 if trend continues.
                         </div>
                     </div>
                 </div>
             </SciFiCard>

             {/* Expert Console */}
             <SciFiCard title="专家审计工作台" subtitle="AUDIT LOG" className="flex-1 border-slate-800 bg-[#0a0d14]">
                 <div className="flex flex-col h-full gap-3">
                     {/* Expert Notes */}
                     <div className="bg-amber-900/10 border border-amber-900/30 p-3 rounded">
                         <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold">
                             <MessageSquare size={12} /> Expert Remarks
                         </div>
                         <div className="space-y-2">
                             {EXPERT_NOTES.map((note, i) => (
                                 <div key={i} className="flex gap-2 text-[10px] text-slate-300">
                                     <span className="text-amber-500">•</span> {note}
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Audit Log Stream */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[150px]">
                         {AUDIT_LOGS.map((log, i) => (
                             <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                                 <div className="flex flex-col">
                                     <span className="text-[10px] font-bold text-slate-200">{log.event}</span>
                                     <span className="text-[8px] text-slate-500">{log.time} • {log.source}</span>
                                 </div>
                                 <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                                     ${log.result === 'Pass' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}
                                 `}>
                                     {log.result}
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="mt-auto grid grid-cols-2 gap-2">
                         <button className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-1">
                             <Fingerprint size={12}/> Sign Off
                         </button>
                         <button className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1">
                             <Send size={12}/> Submit
                         </button>
                     </div>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
