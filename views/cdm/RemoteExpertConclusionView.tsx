
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  FileCheck, ShieldCheck, AlertTriangle, Search, 
  Filter, CheckCircle2, XCircle, FileSignature, 
  History, BarChart3, PieChart as PieIcon, 
  BrainCircuit, Download, Share2, Printer,
  Thermometer, Activity, Zap, Layers,
  ArrowRight, ThumbsUp, ThumbsDown,
  Clock, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area
} from 'recharts';

// --- Types ---

type VerdictStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Archived';
type Severity = 'Critical' | 'Major' | 'Minor';

interface DiagnosisRecord {
  id: string;
  caseId: string;
  title: string;
  asset: string;
  expertName: string;
  date: string;
  status: VerdictStatus;
  severity: Severity;
  confidence: number; // 0-100%
  rootCause: string;
  summary: string;
  tags: string[];
  feedbackScore?: number; // 1-5
}

interface AnalyticsData {
  category: string;
  count: number;
  color: string;
}

// --- Mock Data ---

const DIAGNOSIS_RECORDS: DiagnosisRecord[] = [
  { 
    id: 'REP-2024-089', caseId: 'CASE-8821', title: '燃机压气机喘振故障终审', 
    asset: 'Gas Turbine GT-101', expertName: 'Dr. Zhang', date: '2024-03-20', 
    status: 'Approved', severity: 'Critical', confidence: 98,
    rootCause: '入口导叶 (IGV) 角度传感器漂移导致控制逻辑误判。',
    summary: '经频谱分析及现场拆解验证，IGV 实际角度与反馈值偏差 5°。导致压缩比失调，引发低频喘振。',
    tags: ['Sensor Failure', 'Control Logic', 'Vibration'],
    feedbackScore: 5
  },
  { 
    id: 'REP-2024-085', caseId: 'CASE-8815', title: '主变压器油温异常升高', 
    asset: 'Transformer T-02', expertName: 'Sarah Li', date: '2024-03-18', 
    status: 'Pending Review', severity: 'Major', confidence: 85,
    rootCause: '冷却器风扇组#3 电机轴承损坏停转。',
    summary: '红外热像显示冷却器局部热点。声学诊断确认#3风扇异响。建议更换风扇电机并清洗散热片。',
    tags: ['Cooling System', 'Thermal', 'Motor'],
    feedbackScore: 0
  },
  { 
    id: 'REP-2024-072', caseId: 'CASE-8790', title: '输送带跑偏原因分析', 
    asset: 'Conveyor CV-500', expertName: 'Mike Chen', date: '2024-03-15', 
    status: 'Archived', severity: 'Minor', confidence: 92,
    rootCause: '张紧装置液压缸内泄导致张力不均。',
    summary: '现场检查发现左侧张紧油缸压力无法保持。需更换油缸密封件。',
    tags: ['Mechanical', 'Hydraulics'],
    feedbackScore: 4
  },
  { 
    id: 'REP-2024-068', caseId: 'CASE-8755', title: 'PLC 通讯间歇性中断', 
    asset: 'Control Cab X-5', expertName: 'Wang Eng.', date: '2024-03-10', 
    status: 'Rejected', severity: 'Major', confidence: 60,
    rootCause: '疑似电磁干扰 (EMI)，建议进一步测试。',
    summary: '初步排查接线正常。怀疑变频器谐波干扰，但缺乏频谱数据支持。需补充接地电阻测试数据。',
    tags: ['Electrical', 'Network'],
    feedbackScore: 0
  },
];

const FAULT_DISTRIBUTION: AnalyticsData[] = [
  { category: 'Mechanical', count: 45, color: '#f59e0b' },
  { category: 'Electrical', count: 32, color: '#3b82f6' },
  { category: 'Control', count: 18, color: '#8b5cf6' },
  { category: 'Process', count: 12, color: '#10b981' },
  { category: 'Other', count: 8, color: '#64748b' },
];

const ACCURACY_TREND = [
  { month: 'Oct', accuracy: 88, closed: 120 },
  { month: 'Nov', accuracy: 89, closed: 135 },
  { month: 'Dec', accuracy: 92, closed: 150 },
  { month: 'Jan', accuracy: 91, closed: 140 },
  { month: 'Feb', accuracy: 94, closed: 160 },
  { month: 'Mar', accuracy: 95, closed: 180 },
];

const EXPERT_PERFORMANCE = [
  { subject: '响应速度', A: 95, fullMark: 100 },
  { subject: '诊断准确率', A: 92, fullMark: 100 },
  { subject: '报告质量', A: 88, fullMark: 100 },
  { subject: '客户满意度', A: 96, fullMark: 100 },
  { subject: '案例复用性', A: 80, fullMark: 100 },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Approved': 'bg-green-900/30 text-green-400 border-green-600',
    'Pending Review': 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
    'Draft': 'bg-slate-800 text-slate-400 border-slate-600',
    'Rejected': 'bg-red-900/30 text-red-400 border-red-600',
    'Archived': 'bg-blue-900/30 text-blue-400 border-blue-600',
  }[status] || 'bg-slate-800 text-slate-400 border-slate-600';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${styles}`}>
      {status === 'Approved' && <CheckCircle2 size={10} />}
      {status === 'Rejected' && <XCircle size={10} />}
      {status === 'Pending Review' && <Clock size={10} />}
      {status}
    </span>
  );
};

const SeverityIndicator = ({ level }: { level: string }) => {
  const color = level === 'Critical' ? 'bg-red-500' : level === 'Major' ? 'bg-orange-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`}></div>
      <span className={`text-xs ${level === 'Critical' ? 'text-red-400 font-bold' : 'text-slate-400'}`}>{level}</span>
    </div>
  );
};

export const RemoteExpertConclusionView: React.FC = () => {
  const [selectedReportId, setSelectedReportId] = useState(DIAGNOSIS_RECORDS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeReport = DIAGNOSIS_RECORDS.find(r => r.id === selectedReportId) || DIAGNOSIS_RECORDS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-teal-900/50 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
               <FileSignature size={14} /> Diagnostic Records
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               专家诊断 <span className="text-teal-500">结论管理中心</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Avg Accuracy</span>
                <span className="text-xl font-mono font-bold text-green-400">95.2%</span>
             </div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Closed Cases</span>
                <span className="text-xl font-mono font-bold text-white">1,204</span>
             </div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Pending Review</span>
                <span className="text-xl font-mono font-bold text-yellow-500">8</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Report Registry */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search ID, Asset, Expert..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-teal-500 text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {DIAGNOSIS_RECORDS.map(report => (
                   <div 
                     key={report.id}
                     onClick={() => setSelectedReportId(report.id)}
                     className={`p-4 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedReportId === report.id 
                            ? 'bg-teal-950/30 border-teal-500/50 shadow-[inset_4px_0_0_#14b8a6]' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{report.id}</span>
                           <StatusBadge status={report.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 leading-snug ${selectedReportId === report.id ? 'text-white' : 'text-slate-300'}`}>
                           {report.title}
                       </h3>
                       <div className="text-[10px] text-slate-400 mb-3 truncate">{report.asset}</div>

                       <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                           <div className="flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                   {report.expertName.charAt(0)}
                               </div>
                               <span className="text-[10px] text-slate-400">{report.expertName}</span>
                           </div>
                           <span className="text-[10px] text-slate-500">{report.date}</span>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: The Verdict (Report View) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           <SciFiCard className="border-teal-900/50 bg-[#06080e]" noPadding>
               <div className="p-6 flex flex-col h-full gap-6">
                   
                   {/* Report Header */}
                   <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h2 className="text-2xl font-bold text-white">{activeReport.title}</h2>
                               <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">
                                   {activeReport.caseId}
                               </span>
                           </div>
                           <div className="flex gap-6 text-sm text-slate-400">
                               <div className="flex items-center gap-2">
                                   <Activity size={14} className="text-teal-400"/> {activeReport.asset}
                               </div>
                               <SeverityIndicator level={activeReport.severity} />
                           </div>
                       </div>
                       
                       <div className="flex flex-col items-end">
                           <div className="flex items-center gap-2 mb-1">
                               <span className="text-xs text-slate-500 uppercase">Confidence Score</span>
                               <span className={`text-xl font-mono font-bold ${activeReport.confidence > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                                   {activeReport.confidence}%
                               </span>
                           </div>
                           {/* Mini Bar */}
                           <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-teal-600 to-green-400" style={{width: `${activeReport.confidence}%`}}></div>
                           </div>
                       </div>
                   </div>

                   {/* Main Content Area */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       
                       {/* Left: Cause & Effect */}
                       <div className="space-y-4">
                           <div className="p-4 bg-red-950/10 border border-red-900/30 rounded">
                               <h4 className="text-sm font-bold text-red-200 mb-2 flex items-center gap-2">
                                   <AlertTriangle size={14} /> 根本原因 (Root Cause)
                               </h4>
                               <p className="text-xs text-slate-300 leading-relaxed">
                                   {activeReport.rootCause}
                               </p>
                           </div>

                           <div className="p-4 bg-slate-900/50 border border-slate-700 rounded">
                               <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                   <FileText size={14} /> 诊断摘要 (Summary)
                               </h4>
                               <p className="text-xs text-slate-400 leading-relaxed">
                                   {activeReport.summary}
                               </p>
                           </div>

                           <div className="flex flex-wrap gap-2 pt-2">
                               {activeReport.tags.map((tag, i) => (
                                   <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                                       <ArrowRight size={8} /> {tag}
                                   </span>
                               ))}
                           </div>
                       </div>

                       {/* Right: Evidence & Digital Signature */}
                       <div className="flex flex-col gap-4">
                           {/* Evidence Charts Placeholder */}
                           <div className="flex-1 bg-black rounded border border-slate-800 p-2 relative overflow-hidden group">
                               <div className="absolute top-2 left-2 text-[10px] text-teal-500 font-bold bg-black/60 px-2 rounded">
                                   SIGNAL EVIDENCE
                               </div>
                               <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={Array.from({length:20}, (_,i)=>({val: Math.random()*100}))}>
                                       <defs>
                                           <linearGradient id="colorEvid" x1="0" y1="0" x2="0" y2="1">
                                               <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                               <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                           </linearGradient>
                                       </defs>
                                       <Area type="monotone" dataKey="val" stroke="#14b8a6" strokeWidth={2} fill="url(#colorEvid)" />
                                   </AreaChart>
                               </ResponsiveContainer>
                           </div>

                           {/* Signature Block */}
                           <div className="p-3 border-2 border-dashed border-slate-700 rounded bg-slate-900/30 flex items-center justify-between">
                               <div>
                                   <div className="text-[10px] text-slate-500 uppercase">Expert Signature</div>
                                   <div className="font-serif italic text-lg text-white">{activeReport.expertName}</div>
                               </div>
                               <ShieldCheck size={24} className="text-teal-500 opacity-50" />
                           </div>
                       </div>
                   </div>

                   {/* Footer Actions */}
                   <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                       <div className="flex gap-2">
                           <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors shadow-lg">
                               <CheckCircle2 size={14} /> Approve & Publish
                           </button>
                           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors">
                               Request Revision
                           </button>
                       </div>
                       <div className="flex gap-2">
                           <button className="p-2 text-slate-400 hover:text-white transition-colors"><Printer size={16}/></button>
                           <button className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 size={16}/></button>
                           <button className="p-2 text-slate-400 hover:text-white transition-colors"><Download size={16}/></button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Analytics & Trends */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Accuracy Trend */}
           <SciFiCard title="诊断准确率趋势" subtitle="6 MONTHS" className="border-slate-800">
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ACCURACY_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                           <defs>
                               <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#10b981', color: '#fff'}} />
                           <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#colorAcc)" strokeWidth={2} name="Accuracy %" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Fault Distribution */}
           <SciFiCard title="故障类型分布" subtitle="PARETO" className="border-slate-800">
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie 
                             data={FAULT_DISTRIBUTION} 
                             innerRadius={30} 
                             outerRadius={50} 
                             paddingAngle={5} 
                             dataKey="count"
                           >
                               {FAULT_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Pie>
                           <Tooltip contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#333'}} />
                           <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}} iconSize={8}/>
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Expert Radar */}
           <SciFiCard title="专家能力评估" subtitle="PERFORMANCE" className="flex-1 border-slate-800">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="60%" data={EXPERT_PERFORMANCE}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Expert" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a0a', borderColor: '#8b5cf6'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
                   
                   {/* User Feedback */}
                   <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase mb-1">User Feedback Score</div>
                       <div className="flex items-center justify-center gap-1 text-yellow-400">
                           {Array.from({length: 5}).map((_, i) => (
                               <ThumbsUp key={i} size={12} fill={i < (activeReport.feedbackScore || 0) ? "currentColor" : "none"} className={i < (activeReport.feedbackScore || 0) ? "" : "text-slate-600"} />
                           ))}
                           <span className="text-xs font-bold ml-2 text-white">{activeReport.feedbackScore || '-'}/5</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
