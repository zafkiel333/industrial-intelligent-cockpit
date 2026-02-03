
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Activity, Heart, Thermometer, Zap, 
  Stethoscope, ClipboardCheck, AlertOctagon, 
  TrendingUp, TrendingDown, Clock, 
  Dna, Scan, Microscope, FileText,
  CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- Types ---

interface HealthMetric {
  name: string;
  score: number; // 0-100
  trend: 'Up' | 'Down' | 'Stable';
  status: 'Good' | 'Warning' | 'Critical';
}

interface ComponentHealth {
  id: string;
  name: string;
  health: number;
  temperature: number;
  vibration: number;
  rul: number; // Remaining Useful Life (days)
}

interface DiagnosisReport {
  id: string;
  date: string;
  type: 'Routine' | 'AI-Triggered' | 'Manual';
  summary: string;
  confidence: number;
}

// --- Mock Data ---

const ASSET_LIST = [
  { id: 'EQ-GT-001', name: '#1 燃气轮机组', type: 'Rotating', health: 92, status: 'Good' },
  { id: 'EQ-PMP-204', name: '高压给水泵 B', type: 'Hydraulic', health: 45, status: 'Warning' },
  { id: 'EQ-CMP-102', name: '离心压缩机组', type: 'Pneumatic', health: 88, status: 'Good' },
  { id: 'EQ-GEN-05', name: '备用发电机', type: 'Electrical', health: 30, status: 'Critical' },
  { id: 'EQ-FAN-A1', name: '主排风机', type: 'Rotating', health: 95, status: 'Good' },
];

const HEALTH_RADAR = [
  { subject: '机械强度', A: 85, fullMark: 100 },
  { subject: '热工性能', A: 60, fullMark: 100 }, // Weakness
  { subject: '电气绝缘', A: 95, fullMark: 100 },
  { subject: '润滑状态', A: 90, fullMark: 100 },
  { subject: '控制响应', A: 88, fullMark: 100 },
  { subject: '能效水平', A: 82, fullMark: 100 },
];

const DEGRADATION_TREND = Array.from({length: 30}, (_, i) => ({
  day: `T-${30-i}`,
  health: 100 - (i * 0.5) - (Math.random() * 2), // Slow degradation
  limit: 40
}));

const SUB_COMPONENTS: ComponentHealth[] = [
  { id: 'C1', name: '主轴承 (Drive End)', health: 88, temperature: 72, vibration: 2.4, rul: 450 },
  { id: 'C2', name: '叶轮 (Impeller)', health: 42, temperature: 85, vibration: 6.8, rul: 45 },
  { id: 'C3', name: '定子绕组 (Stator)', health: 95, temperature: 65, vibration: 1.2, rul: 1200 },
  { id: 'C4', name: '冷却回路 (Cooling)', health: 78, temperature: 55, vibration: 0.5, rul: 300 },
];

const RECENT_DIAGNOSES: DiagnosisReport[] = [
  { id: 'RPT-240322', date: '2024-03-22 08:00', type: 'AI-Triggered', summary: 'Detected abnormal thermal signature in Stage 2 nozzles.', confidence: 92 },
  { id: 'RPT-240320', date: '2024-03-20 09:00', type: 'Routine', summary: 'Quarterly health check passed. Efficiency -1.2%.', confidence: 100 },
];

// --- Components ---

const HealthPulse = ({ score }: { score: number }) => {
  const color = score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Background Pulse */}
      <div className="absolute inset-0 rounded-full border-4 opacity-20 animate-ping" style={{borderColor: color}}></div>
      
      {/* Static Ring */}
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle 
          cx="64" cy="64" r="56" 
          fill="none" 
          stroke={color} 
          strokeWidth="8" 
          strokeDasharray="351" 
          strokeDashoffset={351 - (351 * score) / 100}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center">
         <span className="text-3xl font-bold font-mono text-white">{score}</span>
         <span className="text-[10px] uppercase text-slate-500 font-bold">Health Score</span>
      </div>
    </div>
  );
};

const DnaHelix = () => (
  <div className="flex gap-1 h-8 items-center opacity-50">
     {Array.from({length: 20}).map((_, i) => (
       <div 
         key={i} 
         className="w-1 bg-emerald-500 rounded-full animate-[bounce_1.5s_infinite_ease-in-out]" 
         style={{
           height: `${Math.sin(i)*10 + 15}px`, 
           animationDelay: `${i * 0.1}s`,
           opacity: 0.3 + (i/20) * 0.7
         }}
       ></div>
     ))}
  </div>
);

export const EquipmentHealthEvaluationView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState(ASSET_LIST[1].id); // Default to pump
  const activeAsset = ASSET_LIST.find(a => a.id === selectedAssetId) || ASSET_LIST[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#020502]">
      
      {/* 1. Bio-Medical Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-emerald-900/50 pb-4 bg-gradient-to-r from-[#031c12] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Stethoscope size={14} className="animate-pulse" /> Asset Vitality Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             设备健康 <span className="text-emerald-500">全维评估系统</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <DnaHelix />
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Fleet Average</div>
                <div className="text-xl font-mono font-bold text-white">88.4</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Critical Assets</div>
                <div className="text-xl font-mono font-bold text-red-500 animate-pulse">2</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Patient List (Assets) */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           <SciFiCard title="设备列表 (Asset Fleet)" className="border-emerald-900/30">
               <div className="flex flex-col gap-2">
                   {ASSET_LIST.map(asset => (
                       <div 
                         key={asset.id}
                         onClick={() => setSelectedAssetId(asset.id)}
                         className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden group
                            ${selectedAssetId === asset.id 
                                ? 'bg-emerald-950/40 border-emerald-500/50' 
                                : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                         `}
                       >
                           {selectedAssetId === asset.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
                           
                           <div className="flex justify-between items-start mb-1">
                               <div className="font-bold text-sm text-slate-200">{asset.name}</div>
                               <div className={`w-2 h-2 rounded-full ${asset.status === 'Good' ? 'bg-green-500' : asset.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'} shadow-[0_0_5px_currentColor]`}></div>
                           </div>
                           <div className="flex justify-between items-end">
                               <span className="text-[10px] text-slate-500 font-mono">{asset.id}</span>
                               <span className={`text-xs font-bold ${asset.health > 80 ? 'text-emerald-400' : asset.health > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                   H: {asset.health}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin Body Scanner */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           
           {/* Top Row: Scanner & Radar */}
           <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[400px]">
               
               {/* 3D Body Scanner */}
               <SciFiCard title="全息透视扫描 (Holo-Scan)" subtitle="LIVE TWIN" className="xl:col-span-2 border-emerald-900/50 bg-[#030508]" noPadding>
                   <div className="w-full h-full relative">
                       {/* Overlay Grid */}
                       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                           backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)',
                           backgroundSize: '40px 40px'
                       }}></div>

                       {/* Interactive 3D Model */}
                       <div className="absolute inset-0 z-0">
                           <ThreeScene type="pump" color="#10b981" />
                       </div>

                       {/* Floating Health Tags */}
                       <div className="absolute top-[20%] left-[20%] z-10 pointer-events-none">
                           <div className="flex items-center gap-2">
                               <div className="w-8 h-[1px] bg-emerald-500"></div>
                               <div className="bg-black/60 border border-emerald-500/50 px-2 py-1 rounded text-[10px] text-emerald-300 backdrop-blur">
                                   Stator Temp: 65°C
                               </div>
                           </div>
                       </div>
                       <div className="absolute bottom-[30%] right-[30%] z-10 pointer-events-none">
                           <div className="flex items-center gap-2 flex-row-reverse">
                               <div className="w-8 h-[1px] bg-red-500"></div>
                               <div className="bg-black/60 border border-red-500/50 px-2 py-1 rounded text-[10px] text-red-300 backdrop-blur animate-pulse">
                                   Vibration Alert: 6.8mm/s
                               </div>
                           </div>
                       </div>

                       {/* Legend */}
                       <div className="absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] text-slate-400 bg-black/40 p-2 rounded border border-slate-800">
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Normal</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Warning</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Critical</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Health Score Radar */}
               <div className="flex flex-col gap-6">
                   <SciFiCard title="综合健康评分" className="border-slate-800 flex items-center justify-center">
                       <HealthPulse score={activeAsset.health} />
                   </SciFiCard>
                   
                   <SciFiCard title="六维健康图谱" className="flex-1 border-slate-800">
                       <div className="w-full h-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_RADAR}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Asset Health" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                                   <Tooltip contentStyle={{backgroundColor: '#020502', borderColor: '#10b981', color: '#fff'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                   </SciFiCard>
               </div>
           </div>

           {/* Bottom Row: Prognostics & Sub-components */}
           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
               
               {/* Degradation Curve (Prognostics) */}
               <SciFiCard title="健康度衰退预测 (RUL Prediction)" subtitle="AI FORECAST" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={DEGRADATION_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#020502', borderColor: '#f59e0b', color: '#fff'}} />
                               <ReferenceLine y={40} stroke="red" strokeDasharray="3 3" label={{value:'Failure Threshold', fill:'red', fontSize:10}} />
                               <Area type="monotone" dataKey="health" stroke="#f59e0b" fill="url(#colorHealth)" strokeWidth={2} name="Health Index" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Component Heatmap */}
               <SciFiCard title="子部件健康热图" subtitle="COMPONENT LEVEL" className="border-slate-800">
                   <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-full">
                       {SUB_COMPONENTS.map(comp => (
                           <div key={comp.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                               <div className="flex-1">
                                   <div className="flex justify-between items-center mb-1">
                                       <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                                       <span className={`text-[10px] px-1.5 rounded font-mono ${comp.health < 60 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
                                           HI: {comp.health}
                                       </span>
                                   </div>
                                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div 
                                         className={`h-full ${comp.health < 60 ? 'bg-red-500' : comp.health < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                         style={{width: `${comp.health}%`}}
                                       ></div>
                                   </div>
                               </div>
                               
                               <div className="ml-4 flex flex-col gap-1 text-[9px] text-slate-400 text-right w-24">
                                   <span className="flex justify-between"><span>RUL:</span> <span className="text-white">{comp.rul}d</span></span>
                                   <span className="flex justify-between"><span>Vib:</span> <span className={comp.vibration > 5 ? 'text-red-400' : 'text-white'}>{comp.vibration}</span></span>
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Diagnostic Intelligence */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Expert Diagnosis */}
           <SciFiCard title="智能诊断报告" subtitle="REPORTS" className="border-emerald-900/30">
               <div className="flex flex-col gap-3">
                   {RECENT_DIAGNOSES.map(rpt => (
                       <div key={rpt.id} className="bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-emerald-500/30 group cursor-pointer transition-colors">
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                   <FileText size={12} className="text-emerald-500" />
                                   <span className="text-xs font-bold text-slate-200">{rpt.type} Analysis</span>
                               </div>
                               <span className="text-[9px] text-slate-500">{rpt.date.split(' ')[0]}</span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight mb-2 group-hover:text-slate-300">
                               {rpt.summary}
                           </p>
                           <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                               <span className="text-[9px] text-slate-500">{rpt.id}</span>
                               <span className="text-[9px] text-emerald-400">Conf: {rpt.confidence}%</span>
                           </div>
                       </div>
                   ))}
                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                       Generate New Report <ArrowRight size={10} />
                   </button>
               </div>
           </SciFiCard>

           {/* Maintenance Advisory */}
           <SciFiCard title="维护建议 (Advisory)" subtitle="AI" className="flex-1 border-slate-800">
               <div className="space-y-4">
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-start gap-3">
                       <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-red-200 mb-1">Immediate Action</div>
                           <p className="text-[10px] text-red-200/70 leading-tight">
                               High vibration in Impeller (C2). Recommend scheduling replacement within 72 hours to prevent shaft damage.
                           </p>
                       </div>
                   </div>

                   <div className="p-3 bg-amber-900/10 border border-amber-900/30 rounded flex items-start gap-3">
                       <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-amber-200 mb-1">Upcoming Service</div>
                           <p className="text-[10px] text-amber-200/70 leading-tight">
                               500h Service due in 15 days. Order lubricant pack #LUB-X99.
                           </p>
                       </div>
                   </div>

                   <div className="p-3 bg-slate-900/50 border border-slate-700 rounded flex items-start gap-3">
                       <Microscope size={16} className="text-blue-400 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-blue-200 mb-1">Deep Dive</div>
                           <p className="text-[10px] text-slate-400 leading-tight">
                               Thermal pattern anomaly detected. Suggest infrared imaging inspection on next round.
                           </p>
                       </div>
                   </div>
               </div>
               
               <div className="mt-auto pt-4">
                   <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-colors">
                       <ClipboardCheck size={14} /> Create Work Order
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
