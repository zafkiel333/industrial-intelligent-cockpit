
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Book, Search, FileText, Bookmark, 
  Share2, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronRight, Scale, 
  PenTool, GraduationCap, History,
  GitBranch, Link as LinkIcon, FileCheck,
  Calculator, ArrowRight, Lightbulb,
  UserCheck, Shield, Filter,
  Calendar, Globe, MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- Types ---

interface StandardDoc {
  id: string;
  code: string;
  title: string;
  category: 'Safety' | 'Quality' | 'Environment' | 'Digital';
  status: 'Active' | 'Draft' | 'Superseded';
  publishDate: string;
  expert: string;
  relevance: number; // 0-100
}

interface Clause {
  id: string;
  number: string;
  content: string;
  interpretation: string;
  severity: 'Mandatory' | 'Recommended' | 'Optional';
  tags: string[];
}

interface SimulationParam {
  name: string;
  current: number;
  limit: number;
  unit: string;
  status: 'Pass' | 'Fail';
}

// --- Mock Data ---

const STANDARDS_LIST: StandardDoc[] = [
  { id: 'S1', code: 'ISO 45001:2018', title: '职业健康安全管理体系', category: 'Safety', status: 'Active', publishDate: '2018-03', expert: 'Dr. Zhang', relevance: 98 },
  { id: 'S2', code: 'GB/T 23001-2017', title: '两化融合管理体系要求', category: 'Digital', status: 'Active', publishDate: '2017-06', expert: 'Prof. Li', relevance: 92 },
  { id: 'S3', code: 'IEC 61508', title: '电气/电子/可编程电子安全相关系统', category: 'Safety', status: 'Active', publishDate: '2010-04', expert: 'Eng. Chen', relevance: 88 },
  { id: 'S4', code: 'GB 24155-2020', title: '电动摩托车和电动轻便摩托车安全要求', category: 'Quality', status: 'Draft', publishDate: '2024-Q2', expert: 'Team A', relevance: 65 },
  { id: 'S5', code: 'ISO 14064-1', title: '温室气体排放量化和报告规范', category: 'Environment', status: 'Active', publishDate: '2018-12', expert: 'Env. Wu', relevance: 95 },
];

const ACTIVE_CLAUSES: Clause[] = [
  { 
    id: 'C-4.1', number: '4.1', 
    content: '组织应确定与其宗旨相关并影响其实现职业健康安全管理体系预期结果能力的内部和外部因素。',
    interpretation: '专家解读：不仅要列出因素清单，还需要在管理评审中体现对这些因素的跟踪机制。常见审计陷阱是只有清单无更新记录。',
    severity: 'Mandatory', tags: ['Context', 'Audit']
  },
  { 
    id: 'C-5.2', number: '5.2', 
    content: '最高管理者应建立、实施并保持职业健康安全方针。',
    interpretation: '专家解读：方针必须包含"承诺消除危险源"的具体表述。建议将方针文件挂在工厂显眼位置并进行全员培训。',
    severity: 'Mandatory', tags: ['Leadership', 'Policy']
  },
  { 
    id: 'C-6.1.2', number: '6.1.2', 
    content: '组织应建立、实施和保持危险源辨识过程。',
    interpretation: '实操指南：建议采用 JSA (工作安全分析) 或 HAZOP (危险与可操作性分析) 方法。对于化工场景，HAZOP 是必须的。',
    severity: 'Mandatory', tags: ['Risk', 'HAZOP']
  },
  { 
    id: 'C-8.1.4', number: '8.1.4', 
    content: '采购控制应确保采购的过程、产品和服务符合组织的职业健康安全管理体系要求。',
    interpretation: '注意：对外包商的资质审核不能仅停留在纸面，必须有现场安全交底记录。',
    severity: 'Recommended', tags: ['Procurement', 'Contractor']
  }
];

const SIM_PARAMS: SimulationParam[] = [
  { name: 'Noise Level (dB)', current: 82, limit: 85, unit: 'dB', status: 'Pass' },
  { name: 'Dust Concentration', current: 4.5, limit: 4.0, unit: 'mg/m³', status: 'Fail' },
  { name: 'Training Hours', current: 25, limit: 24, unit: 'h/yr', status: 'Pass' },
  { name: 'Emergency Drills', current: 1, limit: 2, unit: 'times/yr', status: 'Fail' },
];

const MATURITY_RADAR = [
  { subject: 'Policy', score: 90, fullMark: 100 },
  { subject: 'Planning', score: 85, fullMark: 100 },
  { subject: 'Support', score: 70, fullMark: 100 },
  { subject: 'Operation', score: 95, fullMark: 100 },
  { subject: 'Evaluation', score: 60, fullMark: 100 },
  { subject: 'Improvement', score: 75, fullMark: 100 },
];

const KNOWLEDGE_GRAPH_NODES = [
  { x: 50, y: 50, z: 500, name: 'ISO 45001' },
  { x: 30, y: 30, z: 200, name: 'GB/T 28001' }, // Old
  { x: 70, y: 30, z: 300, name: 'ILO-OSH' },
  { x: 20, y: 70, z: 150, name: 'Risk Mgmt' },
  { x: 80, y: 70, z: 250, name: 'Compliance' },
  { x: 50, y: 80, z: 100, name: 'Audit' },
];

// --- Sub-Components ---

const StandardCard = ({ std, active, onClick }: { std: StandardDoc, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group overflow-hidden
       ${active 
         ? 'bg-cyan-950/40 border-cyan-500 shadow-[inset_4px_0_0_#0ea5e9]' 
         : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
    `}
  >
    <div className="flex justify-between items-start mb-2">
       <span className={`text-[10px] px-1.5 py-0.5 rounded border 
          ${std.category === 'Safety' ? 'text-red-400 border-red-900/50 bg-red-900/10' : 
            std.category === 'Quality' ? 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10' :
            std.category === 'Environment' ? 'text-green-400 border-green-900/50 bg-green-900/10' :
            'text-blue-400 border-blue-900/50 bg-blue-900/10'}
       `}>{std.category}</span>
       <span className={`text-[10px] ${std.status === 'Active' ? 'text-green-500' : 'text-slate-500'}`}>{std.status}</span>
    </div>
    
    <div className="font-mono text-xs text-cyan-300 mb-0.5">{std.code}</div>
    <div className={`text-sm font-bold leading-tight mb-2 ${active ? 'text-white' : 'text-slate-300'}`}>
        {std.title}
    </div>
    
    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800 pt-2 mt-2">
       <span className="flex items-center gap-1"><UserCheck size={10}/> {std.expert}</span>
       <span>Rel: {std.relevance}%</span>
    </div>
  </div>
);

const ClauseViewer = ({ clause }: { clause: Clause }) => (
  <div className="flex flex-col gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-cyan-500/30 transition-all group">
     <div className="flex justify-between items-start">
         <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-cyan-400 font-mono">{clause.number}</span>
             <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold
                 ${clause.severity === 'Mandatory' ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 
                   clause.severity === 'Recommended' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/50' : 
                   'bg-blue-900/20 text-blue-400 border border-blue-900/50'}
             `}>{clause.severity}</span>
         </div>
         <div className="flex gap-2">
             <button className="text-slate-500 hover:text-white"><Bookmark size={14}/></button>
             <button className="text-slate-500 hover:text-white"><Share2 size={14}/></button>
         </div>
     </div>
     
     <div className="text-sm text-slate-200 leading-relaxed font-serif">
         {clause.content}
     </div>

     <div className="relative mt-2 pl-4 border-l-2 border-indigo-500/50">
         <div className="text-xs text-indigo-300 mb-1 flex items-center gap-1 font-bold">
             <Lightbulb size={12} className="text-yellow-400" /> Expert Insight
         </div>
         <p className="text-xs text-slate-400 leading-relaxed">
             {clause.interpretation}
         </p>
     </div>

     <div className="flex gap-2 mt-1">
         {clause.tags.map(tag => (
             <span key={tag} className="text-[9px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">#{tag}</span>
         ))}
     </div>
  </div>
);

const StandardsGraph = () => (
  <div className="w-full h-full relative">
     <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
           <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
           <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
           <ZAxis type="number" dataKey="z" range={[100, 1000]} />
           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#3b82f6', fontSize: '12px'}} />
           <Scatter name="Standards" data={KNOWLEDGE_GRAPH_NODES} fill="#8884d8">
              {KNOWLEDGE_GRAPH_NODES.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#64748b'} />
              ))}
           </Scatter>
        </ScatterChart>
     </ResponsiveContainer>
     
     {/* Overlay SVG Lines for manual connections visualization */}
     <svg className="absolute inset-0 pointer-events-none w-full h-full">
         <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="50%" x2="70%" y2="70%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
         <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#334155" strokeWidth="1" />
     </svg>
  </div>
);

export const StandardInterpretationView: React.FC = () => {
  const [selectedStandardId, setSelectedStandardId] = useState(STANDARDS_LIST[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeStandard = STANDARDS_LIST.find(s => s.id === selectedStandardId) || STANDARDS_LIST[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200 bg-[#040609]">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0d1b26] to-transparent px-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Scale size={14} className="animate-pulse" /> Regulatory Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             行业标准 <span className="text-cyan-500">解读与应用指导</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Applicable Stds</span>
                <span className="text-xl font-mono font-bold text-white">42 Active</span>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">Compliance Score</span>
                <span className="text-xl font-mono font-bold text-green-400">94.5%</span>
             </div>
             <button className="ml-4 flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                <GraduationCap size={16} /> 专家咨询
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden px-4 pb-4">
         
         {/* LEFT: Standard Navigator */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="GB/T, ISO, IEC..." 
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                 {['All', 'Safety', 'Quality', 'Env', 'Digital'].map(filter => (
                     <button key={filter} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap">
                         {filter}
                     </button>
                 ))}
             </div>
             
             <div className="flex flex-col gap-3">
                 {STANDARDS_LIST.map(std => (
                     <StandardCard 
                       key={std.id} 
                       std={std} 
                       active={selectedStandardId === std.id} 
                       onClick={() => setSelectedStandardId(std.id)} 
                     />
                 ))}
             </div>

             {/* Graph Mini */}
             <SciFiCard title="标准关联图谱" className="flex-1 border-slate-800 bg-[#080a10]" noPadding>
                 <div className="w-full h-full p-2 relative">
                     <StandardsGraph />
                     <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 bg-black/60 px-2 rounded">
                         Click to Explore
                     </div>
                 </div>
             </SciFiCard>
         </div>

         {/* CENTER: Clause Workbench */}
         <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
             
             {/* Main Content Viewer */}
             <SciFiCard 
               title={`${activeStandard.code} 条款解读`} 
               subtitle={activeStandard.title} 
               className="border-cyan-900/50 bg-[#080b14]"
             >
                 <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                         <span className="flex items-center gap-1"><Calendar size={12}/> Effective: {activeStandard.publishDate}</span>
                         <span className="flex items-center gap-1"><Globe size={12}/> Region: International</span>
                         <span className="flex items-center gap-1"><GitBranch size={12}/> Version: 2.0</span>
                     </div>
                     
                     <div className="space-y-4">
                         {ACTIVE_CLAUSES.map(clause => (
                             <ClauseViewer key={clause.id} clause={clause} />
                         ))}
                     </div>
                     
                     <button className="w-full py-3 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:bg-slate-800 hover:text-white transition-colors">
                         Load More Clauses...
                     </button>
                 </div>
             </SciFiCard>

             {/* Evolution Timeline (Mini) */}
             <SciFiCard title="标准演进路线 (Evolution)" className="h-40 border-slate-800">
                 <div className="flex items-center h-full relative px-4">
                     <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700 -translate-y-1/2"></div>
                     {['2007 (v1)', '2012 (v2)', '2018 (v3)', '2024 (Draft)'].map((ver, i) => (
                         <div key={i} className="relative z-10 flex flex-col items-center flex-1">
                             <div className={`w-3 h-3 rounded-full border-2 ${i===2 ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-500'}`}></div>
                             <span className={`text-[10px] mt-2 font-mono ${i===2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>{ver}</span>
                         </div>
                     ))}
                 </div>
             </SciFiCard>
         </div>

         {/* RIGHT: Tools & Simulator */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
             
             {/* Compliance Simulator */}
             <SciFiCard title="合规性模拟器 (Simulator)" subtitle="CHECK" className="border-indigo-900/30">
                 <div className="flex flex-col gap-3">
                     <div className="text-xs text-slate-400 mb-2">
                         Input current operational parameters to verify compliance against {activeStandard.code}.
                     </div>
                     
                     {SIM_PARAMS.map((param, i) => (
                         <div key={i} className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col gap-1">
                             <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-300">{param.name}</span>
                                 <span className={`text-[9px] px-1.5 rounded font-bold uppercase
                                     ${param.status === 'Pass' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}
                                 `}>{param.status}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <input 
                                   type="range" 
                                   className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                   value={(param.current / (param.limit * 1.5)) * 100}
                                   readOnly
                                 />
                                 <div className="text-xs font-mono text-white w-12 text-right">{param.current}</div>
                             </div>
                             <div className="text-[8px] text-slate-500 text-right">Limit: {param.limit} {param.unit}</div>
                         </div>
                     ))}
                     
                     <button className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                         <Calculator size={12} /> Run Simulation
                     </button>
                 </div>
             </SciFiCard>

             {/* Maturity Assessment */}
             <SciFiCard title="管理成熟度评估" subtitle="RADAR" className="h-64 border-slate-800">
                 <div className="w-full h-full p-2">
                     <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MATURITY_RADAR}>
                             <PolarGrid stroke="#334155" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                             <Radar name="Score" dataKey="score" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                             <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#10b981', fontSize: '12px'}} />
                         </RadarChart>
                     </ResponsiveContainer>
                 </div>
             </SciFiCard>

             {/* Expert Help */}
             <div className="bg-slate-900/60 p-4 rounded border border-slate-700 flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                         <UserCheck size={20} className="text-slate-400" />
                     </div>
                     <div>
                         <div className="text-xs font-bold text-white">Need Clarification?</div>
                         <div className="text-[10px] text-slate-400">Ask {activeStandard.expert}</div>
                     </div>
                 </div>
                 <button className="w-full py-2 border border-slate-600 text-slate-300 text-xs rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                     <MessageSquare size={12} /> Start Chat
                 </button>
             </div>
         </div>

      </div>
    </div>
  );
};
