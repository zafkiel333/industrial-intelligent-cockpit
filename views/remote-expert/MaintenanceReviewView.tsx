
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileText, CheckSquare, AlertTriangle, Users, 
  Clock, ShieldCheck, Hammer, Scale, 
  MessageSquare, ThumbsUp, ThumbsDown, Gavel,
  History, FileSignature, AlertOctagon, Zap,
  GitPullRequest, LayoutList, Calendar, Bookmark,
  PenTool, Download, Search, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, CartesianGrid, ReferenceLine, Legend,
  AreaChart, Area
} from 'recharts';

// --- Types ---

interface PlanSection {
  id: string;
  title: string;
  status: 'Pass' | 'Flagged' | 'Reviewing';
  riskLevel: 'High' | 'Med' | 'Low';
  owner: string;
}

interface ReviewComment {
  id: string;
  expert: string;
  role: string;
  avatarColor: string;
  section: string;
  type: 'Question' | 'Defect' | 'Approval';
  content: string;
  time: string;
}

interface RiskPoint {
  id: string;
  name: string;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
  status: 'Open' | 'Mitigated';
}

// --- Mock Data ---

const PLAN_META = {
  id: 'MP-2024-TUR-A',
  title: '#3 燃气轮机 A级检修标准作业方案',
  version: 'v2.4 (Draft)',
  submitter: 'Plant Operations Team',
  date: '2024-03-22',
  deadline: '2024-03-25',
  duration: '28 Days',
  budget: '¥ 4,500,000'
};

const PLAN_SECTIONS: PlanSection[] = [
  { id: 'S1', title: '作业前准备与安全隔离 (LOTO)', status: 'Pass', riskLevel: 'High', owner: 'Safety Dept' },
  { id: 'S2', title: '燃机本体拆解与吊装', status: 'Flagged', riskLevel: 'High', owner: 'Mech Team' },
  { id: 'S3', title: '热通道部件探伤检测', status: 'Reviewing', riskLevel: 'Med', owner: 'QA Team' },
  { id: 'S4', title: '控制系统逻辑校验', status: 'Pass', riskLevel: 'Low', owner: 'I&C Team' },
  { id: 'S5', title: '回装与冷态调试', status: 'Reviewing', riskLevel: 'Med', owner: 'Mech Team' },
];

const RISK_MATRIX: RiskPoint[] = [
  { id: 'R1', name: '重物吊装失稳', probability: 30, impact: 95, mitigation: '专用吊具+双人指挥', status: 'Open' },
  { id: 'R2', name: '高温部件烫伤', probability: 45, impact: 60, mitigation: '冷却24h+红外测温', status: 'Mitigated' },
  { id: 'R3', name: '异物遗留 (FME)', probability: 60, impact: 85, mitigation: '全流程清点登记', status: 'Open' }, // High risk
  { id: 'R4', name: '工期延误', probability: 70, impact: 40, mitigation: '备件提前预置', status: 'Mitigated' },
  { id: 'R5', name: '受限空间作业', probability: 50, impact: 90, mitigation: '气体监测+监护人', status: 'Open' },
];

const EXPERT_COMMENTS: ReviewComment[] = [
  { id: 'C1', expert: 'Dr. Zhang', role: 'Chief Engineer', avatarColor: '#0ea5e9', section: 'S2', type: 'Defect', content: '吊装方案中未包含转子重力弯曲的支撑措施，建议补充专用托架设计图。', time: '10:42' },
  { id: 'C2', expert: 'Sarah Li', role: 'Safety Director', avatarColor: '#ef4444', section: 'S1', type: 'Approval', content: 'LOTO 锁定点清单完整，符合 ISO 45001 标准。', time: '10:30' },
  { id: 'C3', expert: 'Mike Chen', role: 'OEM Rep', avatarColor: '#f59e0b', section: 'S3', type: 'Question', content: '探伤标准引用的是 2018 版，是否确认适用当前合金材料？', time: '10:15' },
];

const RESOURCE_RADAR = [
  { subject: '人力配置', Plan: 90, Available: 80, fullMark: 100 },
  { subject: '专用工具', Plan: 85, Available: 95, fullMark: 100 },
  { subject: '备件库存', Plan: 100, Available: 60, fullMark: 100 }, // Gap
  { subject: '耗材准备', Plan: 80, Available: 85, fullMark: 100 },
  { subject: '技术资料', Plan: 95, Available: 100, fullMark: 100 },
  { subject: '外协支持', Plan: 70, Available: 70, fullMark: 100 },
];

const COST_ESTIMATION = [
  { phase: '拆解', labor: 120, material: 20 },
  { phase: '检测', labor: 80, material: 50 },
  { phase: '维修', labor: 200, material: 350 },
  { phase: '回装', labor: 150, material: 30 },
  { phase: '调试', labor: 100, material: 10 },
];

// --- Components ---

const RiskScatterChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" dataKey="probability" name="Probability" unit="%" stroke="#64748b" label={{ value: '发生概率 (Probability)', position: 'insideBottom', offset: -10, fontSize: 10 }} domain={[0, 100]} />
      <YAxis type="number" dataKey="impact" name="Impact" unit="" stroke="#64748b" label={{ value: '后果严重性 (Impact)', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 100]} />
      <ZAxis type="number" dataKey="impact" range={[50, 400]} />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#fff'}} />
      
      {/* Risk Zones Background */}
      <ReferenceLine x={50} stroke="#475569" strokeDasharray="3 3" />
      <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
      
      <Scatter name="Risks" data={RISK_MATRIX}>
        {RISK_MATRIX.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.impact * entry.probability > 4000 ? '#ef4444' : entry.impact * entry.probability > 2000 ? '#f59e0b' : '#10b981'} />
        ))}
      </Scatter>
    </ScatterChart>
  </ResponsiveContainer>
);

const GanttPreview = () => (
  <div className="flex flex-col gap-2 w-full h-full justify-center">
      {['P1. 停机冷却', 'P2. 揭缸拆解', 'P3. 核心检修', 'P4. 回装复测', 'P5. 启动试验'].map((step, i) => {
          const start = i * 15;
          const duration = [10, 20, 35, 25, 10][i];
          const color = ['#64748b', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'][i];
          
          return (
              <div key={i} className="flex items-center gap-4 text-xs">
                  <div className="w-20 text-slate-400 text-right">{step}</div>
                  <div className="flex-1 bg-slate-900/50 h-6 rounded relative overflow-hidden">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex">
                          <div className="flex-1 border-r border-slate-800/30"></div>
                          <div className="flex-1 border-r border-slate-800/30"></div>
                          <div className="flex-1 border-r border-slate-800/30"></div>
                          <div className="flex-1"></div>
                      </div>
                      {/* Bar */}
                      <div 
                        className="absolute h-4 top-1 rounded" 
                        style={{left: `${start}%`, width: `${duration}%`, backgroundColor: color, opacity: 0.8}}
                      ></div>
                  </div>
              </div>
          )
      })}
      <div className="flex justify-end text-[10px] text-slate-500 gap-12 mt-1 px-4">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
      </div>
  </div>
);

export const MaintenanceReviewView: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState('S2');
  const [approvalStatus, setApprovalStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#04060b]">
      
      {/* 1. Header: Command Bar */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0d0921] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <FileSignature size={14} /> Remote Expert Review
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             远程检修方案 <span className="text-indigo-500">数字评审中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Plan Status</div>
                <div className="text-xl font-mono font-bold text-yellow-400">UNDER REVIEW</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Expert Consensus</div>
                <div className="text-xl font-mono font-bold text-white">65%</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Deadline</div>
                <div className="text-xl font-mono font-bold text-red-400">3 Days Left</div>
            </div>
        </div>
      </div>

      {/* Main Grid: 3 Columns Layout */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT COLUMN: Plan Architecture (3 Cols) */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Plan Meta Card */}
             <SciFiCard title="方案概览 (Overview)" className="border-indigo-900/30">
                 <div className="space-y-3">
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-xs text-slate-400">Plan ID</span>
                         <span className="text-xs font-mono text-cyan-300">{PLAN_META.id}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-xs text-slate-400">Title</span>
                         <span className="text-xs text-white font-bold truncate max-w-[140px]">{PLAN_META.title}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-xs text-slate-400">Duration</span>
                         <span className="text-xs text-white">{PLAN_META.duration}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-xs text-slate-400">Budget Est.</span>
                         <span className="text-xs text-yellow-400 font-mono">{PLAN_META.budget}</span>
                     </div>
                 </div>
                 <div className="mt-4 flex gap-2">
                     <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded flex items-center justify-center gap-2 transition-colors">
                         <Download size={12} /> Full PDF
                     </button>
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition-colors">
                         Version History
                     </button>
                 </div>
             </SciFiCard>

             {/* Structure Tree */}
             <SciFiCard title="方案结构分解 (WBS)" subtitle="SECTIONS" className="flex-1 border-slate-800">
                 <div className="flex flex-col gap-2">
                     {PLAN_SECTIONS.map((sec, i) => (
                         <div 
                           key={sec.id}
                           onClick={() => setActiveSectionId(sec.id)}
                           className={`p-3 rounded border cursor-pointer transition-all duration-300 group
                              ${activeSectionId === sec.id 
                                  ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[inset_2px_0_0_#6366f1]' 
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                           `}
                         >
                             <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] text-slate-500 font-mono">0{i+1}. {sec.id}</span>
                                 {sec.status === 'Pass' ? <CheckCircle2 size={12} className="text-green-500"/> : 
                                  sec.status === 'Flagged' ? <AlertTriangle size={12} className="text-red-500"/> : 
                                  <Clock size={12} className="text-yellow-500"/>}
                             </div>
                             <div className={`text-xs font-bold ${activeSectionId === sec.id ? 'text-white' : 'text-slate-300'}`}>
                                 {sec.title}
                             </div>
                             <div className="flex justify-between items-center mt-2">
                                 <span className="text-[9px] text-slate-500">{sec.owner}</span>
                                 <span className={`text-[8px] px-1.5 rounded uppercase border 
                                     ${sec.riskLevel === 'High' ? 'text-red-400 border-red-900 bg-red-900/10' : 
                                       sec.riskLevel === 'Med' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' : 
                                       'text-green-400 border-green-900 bg-green-900/10'}
                                 `}>{sec.riskLevel} Risk</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </SciFiCard>

         </div>

         {/* CENTER COLUMN: Deep Analysis (5 Cols) */}
         <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
             
             {/* 1. Risk Matrix Visualizer */}
             <SciFiCard title="风险矩阵透视 (Risk Heatmap)" subtitle="SAFETY & QUALITY" className="h-[300px] border-red-900/30 bg-[#080505]" noPadding>
                 <div className="w-full h-full p-2 relative flex flex-col">
                     <div className="flex justify-between px-2 pt-2">
                         <div className="text-[10px] text-slate-500">
                             Detected <strong className="text-red-500">{RISK_MATRIX.filter(r => r.status === 'Open').length}</strong> Open Risks
                         </div>
                         <div className="flex gap-2 text-[10px]">
                             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Critical</span>
                             <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500"></div> Acceptable</span>
                         </div>
                     </div>
                     <div className="flex-1">
                         <RiskScatterChart />
                     </div>
                 </div>
             </SciFiCard>

             {/* 2. Timeline & Cost Simulation */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[250px]">
                 
                 <SciFiCard title="工期逻辑推演 (Schedule)" className="border-slate-800">
                     <div className="h-full flex flex-col">
                         <div className="flex-1">
                             <GanttPreview />
                         </div>
                         <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-500/20 rounded text-[10px] text-yellow-200/80 flex items-start gap-2">
                             <AlertOctagon size={12} className="shrink-0 mt-0.5" />
                             <span>Critical Path Alert: "Rotor Lift" overlaps with "Crane Maintenance". Conflict detected on Day 12.</span>
                         </div>
                     </div>
                 </SciFiCard>

                 <SciFiCard title="资源与成本估算" className="border-slate-800">
                     <div className="w-full h-full flex flex-col">
                         <div className="flex-1">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={COST_ESTIMATION} layout="vertical" margin={{left: 0}}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="phase" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#333'}} />
                                     <Legend wrapperStyle={{fontSize: '10px'}} />
                                     <Bar dataKey="labor" stackId="a" fill="#3b82f6" name="Labor" radius={[0, 4, 4, 0]} />
                                     <Bar dataKey="material" stackId="a" fill="#f59e0b" name="Parts" radius={[0, 4, 4, 0]} />
                                 </BarChart>
                             </ResponsiveContainer>
                         </div>
                         
                         {/* Radar for Resource Readiness */}
                         <div className="h-24 w-full border-t border-slate-800 mt-2 pt-1 relative">
                             <div className="absolute top-1 left-0 text-[9px] text-slate-500 uppercase">Resource Gap Analysis</div>
                             <ResponsiveContainer width="100%" height="100%">
                                 <RadarChart cx="50%" cy="60%" outerRadius="80%" data={RESOURCE_RADAR}>
                                     <PolarGrid stroke="#334155" />
                                     <PolarAngleAxis dataKey="subject" tick={{fontSize: 0}} /> {/* Hide labels for mini view */}
                                     <Radar name="Plan" dataKey="Plan" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                                     <Radar name="Avail" dataKey="Available" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                 </RadarChart>
                             </ResponsiveContainer>
                             <div className="absolute bottom-1 right-1 text-[9px] text-red-400 font-bold bg-black/50 px-1 rounded">Missing Spares!</div>
                         </div>
                     </div>
                 </SciFiCard>

             </div>

         </div>

         {/* RIGHT COLUMN: Expert Collaboration (4 Cols) */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
             
             {/* Expert Roster */}
             <SciFiCard title="评审专家组 (Review Board)" subtitle="ONLINE" className="border-indigo-900/30">
                 <div className="flex -space-x-2 mb-4 overflow-x-auto pb-2">
                     {['Dr.Z', 'S.Li', 'M.C', 'W.E'].map((initial, i) => (
                         <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border-2 border-[#0b1221] shadow-lg
                             ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-cyan-600' : i === 2 ? 'bg-amber-600' : 'bg-slate-600'}
                         `}>
                             {initial}
                         </div>
                     ))}
                     <button className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
                         <Users size={16} />
                     </button>
                 </div>
                 
                 <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                     <span>Consensus Progress</span>
                     <span className="text-white font-bold">65%</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 w-[65%]"></div>
                 </div>
             </SciFiCard>

             {/* Review Stream */}
             <SciFiCard title="实时评审意见流" subtitle="LIVE FEED" className="flex-1 border-slate-800">
                 <div className="flex flex-col h-full">
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-4" style={{maxHeight: '350px'}}>
                         {EXPERT_COMMENTS.map((comment) => (
                             <div key={comment.id} className="flex gap-3 group">
                                 <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm mt-1" style={{backgroundColor: comment.avatarColor}}>
                                     {comment.expert.charAt(0)}
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-baseline mb-1">
                                         <span className="text-xs font-bold text-slate-200">{comment.expert}</span>
                                         <span className="text-[10px] text-slate-500">{comment.time}</span>
                                     </div>
                                     <div className={`p-3 rounded-lg text-xs border relative
                                         ${comment.type === 'Defect' ? 'bg-red-900/20 border-red-900/50 text-red-100' : 
                                           comment.type === 'Approval' ? 'bg-green-900/20 border-green-900/50 text-green-100' : 
                                           'bg-slate-800 border-slate-700 text-slate-300'}
                                     `}>
                                         <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] uppercase font-bold">
                                             {comment.type === 'Defect' ? <XCircle size={10}/> : 
                                              comment.type === 'Approval' ? <CheckCircle2 size={10}/> : <MessageSquare size={10}/>}
                                             {comment.type} • Section {comment.section}
                                         </div>
                                         {comment.content}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>

                     {/* Input Area */}
                     <div className="mt-auto relative">
                         <input 
                           type="text" 
                           placeholder="Add comment or raise defect..." 
                           className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-xs text-white focus:border-indigo-500 outline-none"
                         />
                         <button className="absolute right-2 top-1.5 p-1 bg-indigo-600 rounded-full text-white hover:bg-indigo-500">
                             <ArrowRight size={12} />
                         </button>
                     </div>
                 </div>
             </SciFiCard>

             {/* Decision Console */}
             <SciFiCard title="评审裁决 (Verdict)" className="border-indigo-900/50 bg-[#0b0e14]">
                 <div className="flex flex-col gap-3">
                     <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => setApprovalStatus('Approved')}
                           className={`py-3 rounded border flex flex-col items-center justify-center gap-1 transition-all
                              ${approvalStatus === 'Approved' ? 'bg-green-600 text-white border-green-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}
                           `}
                         >
                             <ThumbsUp size={16} />
                             <span className="text-xs font-bold">APPROVE</span>
                         </button>
                         <button 
                           onClick={() => setApprovalStatus('Rejected')}
                           className={`py-3 rounded border flex flex-col items-center justify-center gap-1 transition-all
                              ${approvalStatus === 'Rejected' ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}
                           `}
                         >
                             <ThumbsDown size={16} />
                             <span className="text-xs font-bold">REJECT</span>
                         </button>
                     </div>
                     
                     <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-900/50 rounded text-yellow-200 text-[10px]">
                         <AlertTriangle size={12} />
                         <span>Warning: 3 High Risks still open in Section S2.</span>
                     </div>

                     <button className="w-full py-2 border border-dashed border-slate-600 text-slate-400 text-xs rounded hover:text-white hover:border-indigo-500 transition-colors flex items-center justify-center gap-2">
                         <Gavel size={14} /> Generate Resolution Report
                     </button>
                 </div>
             </SciFiCard>

         </div>

      </div>
    </div>
  );
};
