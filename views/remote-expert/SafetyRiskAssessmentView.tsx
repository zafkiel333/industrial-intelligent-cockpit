
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, 
  FileText, Search, Activity, Lock, Unlock,
  Eye, Siren, Target, TrendingUp, Layers,
  ClipboardCheck, HardHat, Flame, Biohazard,
  Zap, Wind, Radiation, Shield, RefreshCw
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine
} from 'recharts';

// --- Types ---

interface RiskItem {
  id: string;
  hazard: string;
  category: string; // Chemical, Electrical, Mechanical, etc.
  probability: number; // 1-5
  severity: number; // 1-5
  riskScore: number; // prob * sev
  status: 'Open' | 'Mitigated' | 'Acceptable';
  location: string;
}

interface SafetyBarrier {
  id: string;
  name: string;
  type: 'Physical' | 'Technical' | 'Procedural';
  status: 'Intact' | 'Degraded' | 'Failed';
  efficiency: number; // %
}

interface AuditLog {
  id: string;
  time: string;
  auditor: string;
  finding: string;
  rating: 'Compliant' | 'Non-Compliant' | 'Observation';
}

// --- Mock Data ---

const RISK_REGISTER: RiskItem[] = [
  { id: 'R-101', hazard: '高压管道法兰泄漏 (H2S)', category: 'Chemical', probability: 3, severity: 5, riskScore: 15, status: 'Open', location: 'Zone A' },
  { id: 'R-102', hazard: '配电室电弧闪光', category: 'Electrical', probability: 2, severity: 5, riskScore: 10, status: 'Mitigated', location: 'Zone B' },
  { id: 'R-103', hazard: '旋转设备防护罩缺失', category: 'Mechanical', probability: 4, severity: 4, riskScore: 16, status: 'Open', location: 'Zone C' },
  { id: 'R-104', hazard: '受限空间缺氧', category: 'Confined Space', probability: 2, severity: 5, riskScore: 10, status: 'Open', location: 'Tank 4' },
  { id: 'R-105', hazard: '高处作业坠落', category: 'Physical', probability: 3, severity: 4, riskScore: 12, status: 'Mitigated', location: 'Platform 2' },
  { id: 'R-106', hazard: '噪音超标', category: 'Environmental', probability: 5, severity: 2, riskScore: 10, status: 'Acceptable', location: 'Zone A' },
];

const SAFETY_BARRIERS: SafetyBarrier[] = [
  { id: 'B-01', name: '气体检测报警器', type: 'Technical', status: 'Intact', efficiency: 98 },
  { id: 'B-02', name: '紧急切断阀 (ESD)', type: 'Technical', status: 'Intact', efficiency: 100 },
  { id: 'B-03', name: '安全围栏与警示牌', type: 'Physical', status: 'Degraded', efficiency: 75 },
  { id: 'B-04', name: '作业许可制度 (PTW)', type: 'Procedural', status: 'Intact', efficiency: 95 },
  { id: 'B-05', name: '个人防护装备 (PPE)', type: 'Physical', status: 'Failed', efficiency: 40 }, // Simulated failure
];

const COMPLIANCE_RADAR = [
  { subject: 'ISO 45001', A: 92, fullMark: 100 },
  { subject: 'Process Safety', A: 85, fullMark: 100 },
  { subject: 'Fire Safety', A: 90, fullMark: 100 },
  { subject: 'Occ. Health', A: 78, fullMark: 100 },
  { subject: 'Env Protection', A: 88, fullMark: 100 },
  { subject: 'Emergency Prep', A: 95, fullMark: 100 },
];

const LIVE_AUDIT_LOGS: AuditLog[] = [
  { id: 'L-01', time: '10:45:20', auditor: 'Dr. Zhang', finding: 'Zone A: Gas detector calibration overdue.', rating: 'Non-Compliant' },
  { id: 'L-02', time: '10:42:15', auditor: 'AI Vision', finding: 'Worker detected without hard hat in Zone C.', rating: 'Non-Compliant' },
  { id: 'L-03', time: '10:38:00', auditor: 'System', finding: 'Fire suppression system pressure normal.', rating: 'Compliant' },
  { id: 'L-04', time: '10:30:10', auditor: 'Dr. Zhang', finding: 'Emergency exit clear of obstructions.', rating: 'Compliant' },
];

// --- Components ---

const RiskMatrixChart = ({ data }: { data: RiskItem[] }) => {
  return (
    <div className="w-full h-full relative p-4">
       <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-20 pointer-events-none">
          {/* Background Grid Cells for Risk Zones */}
          {/* Row 5 (Severity 5) */}
          <div className="bg-yellow-500/20 border border-slate-700"></div><div className="bg-orange-500/20 border border-slate-700"></div><div className="bg-red-500/20 border border-slate-700"></div><div className="bg-red-600/20 border border-slate-700"></div><div className="bg-red-700/20 border border-slate-700"></div>
          {/* Row 4 */}
          <div className="bg-green-500/20 border border-slate-700"></div><div className="bg-yellow-500/20 border border-slate-700"></div><div className="bg-orange-500/20 border border-slate-700"></div><div className="bg-red-500/20 border border-slate-700"></div><div className="bg-red-600/20 border border-slate-700"></div>
          {/* Row 3 */}
          <div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-yellow-500/20 border border-slate-700"></div><div className="bg-orange-500/20 border border-slate-700"></div><div className="bg-red-500/20 border border-slate-700"></div>
          {/* Row 2 */}
          <div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-yellow-500/20 border border-slate-700"></div><div className="bg-orange-500/20 border border-slate-700"></div>
          {/* Row 1 */}
          <div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-green-500/20 border border-slate-700"></div><div className="bg-yellow-500/20 border border-slate-700"></div>
       </div>
       
       <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
             <XAxis type="number" dataKey="probability" name="Probability" domain={[0, 6]} tickCount={6} label={{ value: '发生概率 (Likelihood)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#94a3b8' }} />
             <YAxis type="number" dataKey="severity" name="Severity" domain={[0, 6]} tickCount={6} label={{ value: '后果严重性 (Severity)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
             <ZAxis type="number" dataKey="riskScore" range={[50, 400]} />
             <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f172a', borderColor: '#f97316', color: '#fff'}} />
             <Scatter name="Risks" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.riskScore >= 15 ? '#ef4444' : entry.riskScore >= 8 ? '#f59e0b' : '#10b981'} stroke="#fff" strokeWidth={1} />
                ))}
             </Scatter>
          </ScatterChart>
       </ResponsiveContainer>
    </div>
  );
};

const BarrierShield = ({ barrier }: { barrier: SafetyBarrier }) => {
  const color = barrier.status === 'Intact' ? 'text-green-500 border-green-500/50' : 
                barrier.status === 'Degraded' ? 'text-yellow-500 border-yellow-500/50' : 'text-red-500 border-red-500/50';
  
  return (
    <div className={`flex items-center justify-between p-3 bg-slate-900/40 border rounded mb-2 ${color} border-opacity-30`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full border bg-opacity-10 ${color.split(' ')[0].replace('text', 'bg')}`}>
                <Shield size={16} />
            </div>
            <div>
                <div className="text-xs font-bold text-slate-200">{barrier.name}</div>
                <div className="text-[10px] text-slate-500">{barrier.type} Barrier</div>
            </div>
        </div>
        <div className="text-right">
            <div className={`text-sm font-bold font-mono ${color.split(' ')[0]}`}>{barrier.efficiency}%</div>
            <div className="text-[9px] text-slate-500 uppercase">{barrier.status}</div>
        </div>
    </div>
  );
};

const HazardZoneMap = () => {
  return (
    <div className="relative w-full h-full bg-[#080b14] border border-slate-800 rounded overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}></div>

        {/* Map Elements (SVG) */}
        <svg className="w-full h-full absolute inset-0">
            {/* Zones */}
            <rect x="50" y="50" width="120" height="200" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" />
            <text x="60" y="70" fill="#64748b" fontSize="10">Zone A (Process)</text>
            
            <rect x="200" y="50" width="150" height="120" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" />
            <text x="210" y="70" fill="#64748b" fontSize="10">Zone B (Elec)</text>

            <circle cx="280" cy="250" r="60" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" />
            <text x="280" y="250" fill="#64748b" fontSize="10" textAnchor="middle">Zone C (Storage)</text>

            {/* Hazards */}
            <g transform="translate(110, 150)" className="cursor-pointer group">
                <circle r="15" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                <circle r="5" fill="#ef4444" />
                <text x="10" y="-10" fill="#ef4444" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">H2S Leak</text>
            </g>

            <g transform="translate(250, 100)" className="cursor-pointer group">
                <circle r="5" fill="#f59e0b" />
                <text x="10" y="-10" fill="#f59e0b" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">Arc Risk</text>
            </g>

            <g transform="translate(280, 250)" className="cursor-pointer group">
                <circle r="5" fill="#ef4444" />
                <text x="10" y="-10" fill="#ef4444" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">Guarding Missing</text>
            </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 bg-black/60 p-2 rounded border border-slate-700">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Hazard
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Warning
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full border border-slate-500"></div> Safe Zone
            </div>
        </div>
    </div>
  );
};

export const SafetyRiskAssessmentView: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020305]">
      
      {/* 1. Header: Command Center */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-orange-900/50 pb-4 bg-gradient-to-r from-[#1a0a05] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} className="animate-pulse" /> HSE Risk Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程安全风险 <span className="text-orange-500">评估与管控中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Overall Risk Level</div>
                <div className="text-xl font-mono font-bold text-orange-400 flex items-center gap-2 justify-end">
                    <AlertTriangle size={18} /> ELEVATED
                </div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Active Hazards</div>
                <div className="text-xl font-mono font-bold text-white">6</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Compliance Score</div>
                <div className="text-xl font-mono font-bold text-green-400">92.5%</div>
             </div>
             <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                <ClipboardCheck size={16} /> 启动合规审计
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
         
         {/* LEFT COLUMN: Risk Visualization */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             
             {/* Risk Matrix */}
             <SciFiCard title="风险评估矩阵 (Risk Matrix)" subtitle="P vs S" className="flex-[3] border-orange-900/30 bg-[#0c0a08]" noPadding>
                 <RiskMatrixChart data={RISK_REGISTER} />
             </SciFiCard>

             {/* Hazard Distribution */}
             <SciFiCard title="危害源分布" subtitle="CATEGORIES" className="flex-[2] border-slate-800">
                 <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
                     {RISK_REGISTER.map(risk => (
                         <div 
                            key={risk.id} 
                            onClick={() => setSelectedRisk(risk.id)}
                            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all
                                ${selectedRisk === risk.id ? 'bg-orange-900/20 border-orange-500' : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800'}
                            `}
                         >
                             <div className="flex items-center gap-3">
                                 <div className={`p-1.5 rounded bg-slate-950 border border-slate-700 ${risk.riskScore > 12 ? 'text-red-500' : 'text-yellow-500'}`}>
                                     {risk.category === 'Chemical' ? <Biohazard size={14}/> : 
                                      risk.category === 'Electrical' ? <Zap size={14}/> : 
                                      risk.category === 'Mechanical' ? <RefreshCw size={14}/> : <AlertTriangle size={14}/>}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-xs font-bold text-slate-200">{risk.hazard}</span>
                                     <span className="text-[10px] text-slate-500">{risk.location}</span>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-sm font-mono font-bold text-white">{risk.riskScore}</div>
                                 <div className={`text-[9px] uppercase font-bold ${risk.status === 'Open' ? 'text-red-400' : 'text-green-400'}`}>{risk.status}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER COLUMN: Digital Twin & Barriers */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             
             {/* Map / Layout */}
             <SciFiCard title="现场风险全景图 (Site Map)" subtitle="ZONES" className="h-[350px] border-orange-900/50 bg-[#05060a]" noPadding>
                 <div className="w-full h-full p-2">
                     <HazardZoneMap />
                 </div>
             </SciFiCard>

             {/* Safety Barriers (LOPA) */}
             <SciFiCard title="安全屏障监控 (LOPA)" subtitle="BARRIERS" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-1">
                     <div className="text-[10px] text-slate-500 mb-2">Defense in Depth Status</div>
                     {SAFETY_BARRIERS.map(barrier => (
                         <BarrierShield key={barrier.id} barrier={barrier} />
                     ))}
                 </div>
             </SciFiCard>
         </div>

         {/* RIGHT COLUMN: Expert & Compliance */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Expert Console */}
             <SciFiCard title="专家审计工作台" subtitle="AUDIT" className="border-indigo-900/50">
                 <div className="flex flex-col gap-4">
                     <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded">
                         <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-white">
                             Dr.Z
                         </div>
                         <div className="flex-1">
                             <div className="text-xs font-bold text-white">Dr. Zhang (Chief Safety Officer)</div>
                             <div className="text-[10px] text-green-400 flex items-center gap-1"><Activity size={10}/> Monitoring Live Feed</div>
                         </div>
                         <div className="flex gap-1">
                             <button className="p-1.5 bg-slate-800 rounded hover:text-white text-slate-400"><Eye size={14}/></button>
                             <button className="p-1.5 bg-slate-800 rounded hover:text-white text-slate-400"><FileText size={14}/></button>
                         </div>
                     </div>

                     <div className="space-y-2">
                         <div className="text-[10px] text-slate-500 uppercase font-bold">New Finding Input</div>
                         <textarea 
                             className="w-full bg-black/40 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-orange-500 outline-none resize-none h-20"
                             placeholder="Record safety observation or violation..."
                         ></textarea>
                         <button className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded transition-colors">
                             Submit Finding
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Live Audit Stream */}
             <SciFiCard title="实时审计日志" subtitle="STREAM" className="h-[250px] border-slate-800">
                 <div className="flex flex-col gap-0 h-full overflow-y-auto custom-scrollbar">
                     {LIVE_AUDIT_LOGS.map((log, i) => (
                         <div key={log.id} className="flex gap-3 p-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-900/30 transition-colors">
                             <div className="flex flex-col items-center">
                                 <div className={`w-2 h-2 rounded-full mt-1.5 ${log.rating === 'Compliant' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                 {i < LIVE_AUDIT_LOGS.length - 1 && <div className="w-px h-full bg-slate-800 my-1"></div>}
                             </div>
                             <div className="flex-1 pb-2">
                                 <div className="flex justify-between items-start">
                                     <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                                     <span className={`text-[9px] px-1.5 py-0.5 rounded ${log.rating === 'Compliant' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>{log.rating}</span>
                                 </div>
                                 <div className="text-xs text-slate-200 font-bold mt-0.5">{log.finding}</div>
                                 <div className="text-[10px] text-slate-500 mt-1">By: {log.auditor}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

             {/* Compliance Radar */}
             <SciFiCard title="合规性综合评估" subtitle="SCORE" className="flex-1 border-slate-800">
                 <div className="w-full h-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPLIANCE_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                             <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', color: '#fff'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
