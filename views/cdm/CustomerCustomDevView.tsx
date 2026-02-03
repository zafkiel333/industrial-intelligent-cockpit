
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitBranch, GitCommit, GitMerge, Terminal, 
  Package, CheckCircle, XCircle, PlayCircle, 
  Server, Code, FileCode, Bug, 
  Cpu, Database, Layout, Globe,
  ArrowRight, Download, ShieldCheck, Clock,
  RefreshCw, User
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ReferenceLine, Legend
} from 'recharts';

// --- Types ---

interface Project {
  id: string;
  name: string;
  customer: string;
  version: string;
  status: 'Dev' | 'Testing' | 'UAT' | 'Delivered';
  progress: number;
  branch: string;
}

interface DevTask {
  id: string;
  feature: string;
  dev: string;
  status: 'Committed' | 'In Progress' | 'Pending';
  time: string;
  hash: string;
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'Success' | 'Running' | 'Failed' | 'Pending';
  duration: string;
}

// --- Mock Data ---

const PROJECTS: Project[] = [
  { id: 'PRJ-24-001', name: 'Custom MES Integration', customer: 'Shanghai Heavy Ind.', version: 'v2.1.0-custom.4', status: 'UAT', progress: 88, branch: 'feat/sh-heavy-mes' },
  { id: 'PRJ-24-005', name: 'Hi-Speed Data Adapter', customer: 'Pacific Power', version: 'v1.0.2-beta', status: 'Dev', progress: 45, branch: 'feat/pacific-iot' },
  { id: 'PRJ-23-099', name: 'Legacy ERP Connector', customer: 'AutoWorks GmbH', version: 'v3.0.0-final', status: 'Delivered', progress: 100, branch: 'release/v3.0.0-auto' },
];

const CUSTOMIZATION_MATRIX = [
  { module: 'User Interface', std: 40, custom: 60, type: 'Frontend' },
  { module: 'Business Logic', std: 80, custom: 20, type: 'Backend' },
  { module: 'Data Schema', std: 90, custom: 10, type: 'Database' },
  { module: 'Integration API', std: 20, custom: 80, type: 'Interface' },
  { module: 'Reporting', std: 50, custom: 50, type: 'BI' },
];

const PIPELINE_STEPS: PipelineStage[] = [
  { id: '1', name: 'Code Analysis', status: 'Success', duration: '2m 14s' },
  { id: '2', name: 'Unit Tests', status: 'Success', duration: '5m 30s' },
  { id: '3', name: 'Build Artifact', status: 'Success', duration: '4m 10s' },
  { id: '4', name: 'Integ. Tests', status: 'Running', duration: 'Running...' },
  { id: '5', name: 'Deploy Staging', status: 'Pending', duration: '-' },
];

const COMMIT_LOG: DevTask[] = [
  { id: '1', feature: 'Added SAP SOAP endpoint', dev: 'Li Wei', status: 'Committed', time: '10:42', hash: '8a2b3c' },
  { id: '2', feature: 'Fixed latency in data buffer', dev: 'Chen H.', status: 'Committed', time: '09:15', hash: '99c12d' },
  { id: '3', feature: 'Custom report template V2', dev: 'Sarah J.', status: 'In Progress', time: 'Now', hash: '-----' },
  { id: '4', feature: 'Updated localization map', dev: 'Wang D.', status: 'Committed', time: 'Yesterday', hash: '7b2a11' },
];

const BUG_TREND = [
  { day: 'Mon', open: 12, closed: 10 },
  { day: 'Tue', open: 15, closed: 12 },
  { day: 'Wed', open: 18, closed: 20 },
  { day: 'Thu', open: 10, closed: 15 },
  { day: 'Fri', open: 8, closed: 18 },
  { day: 'Sat', open: 4, closed: 5 },
  { day: 'Sun', open: 2, closed: 2 },
];

const DELIVERABLES = [
  { name: 'Installation_Package.tar.gz', size: '450 MB', type: 'Binary' },
  { name: 'API_Reference_v2.pdf', size: '2.4 MB', type: 'Doc' },
  { name: 'User_Manual_CN.pdf', size: '15 MB', type: 'Doc' },
  { name: 'Test_Report_Final.xlsx', size: '0.8 MB', type: 'Report' },
];

// --- Sub-Components ---

const TechIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'Frontend': return <Layout size={12} className="text-pink-400"/>;
    case 'Backend': return <Server size={12} className="text-blue-400"/>;
    case 'Database': return <Database size={12} className="text-yellow-400"/>;
    case 'Interface': return <Globe size={12} className="text-green-400"/>;
    default: return <Cpu size={12} className="text-slate-400"/>;
  }
};

const PipelineNode: React.FC<{ stage: PipelineStage; index: number; total: number }> = ({ stage, index, total }) => {
  const isLast = index === total - 1;
  const color = stage.status === 'Success' ? 'bg-green-500' : stage.status === 'Running' ? 'bg-blue-500' : stage.status === 'Failed' ? 'bg-red-500' : 'bg-slate-700';
  const glow = stage.status === 'Running' ? 'animate-pulse shadow-[0_0_15px_#3b82f6]' : '';

  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-xs ${color} ${glow} z-10 border-2 border-[#0b1221]`}>
          {stage.status === 'Success' ? <CheckCircle size={14}/> : stage.status === 'Running' ? <RefreshCw size={14} className="animate-spin"/> : index + 1}
        </div>
        <div className="absolute top-9 w-32 text-center">
            <div className="text-[10px] font-bold text-slate-200">{stage.name}</div>
            <div className="text-[9px] font-mono text-slate-500">{stage.duration}</div>
        </div>
      </div>
      {!isLast && (
        <div className={`h-1 flex-1 mx-2 rounded ${stage.status === 'Pending' ? 'bg-slate-800' : 'bg-slate-600'}`}>
            <div className={`h-full ${stage.status === 'Success' ? 'bg-green-500/50' : stage.status === 'Running' ? 'bg-blue-500/50' : 'w-0'}`}></div>
        </div>
      )}
    </div>
  );
};

export const CustomerCustomDevView: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0].id);
  const activeProject = PROJECTS.find(p => p.id === selectedProjectId) || PROJECTS[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header & Project Selector */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0e0a1f] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <GitBranch size={14} /> Custom Engineering
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户定制化开发 <span className="text-indigo-500">与交付档案</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-1.5">
                <span className="text-xs text-slate-400">Active Project:</span>
                <select 
                  className="bg-transparent text-sm font-bold text-white outline-none"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                    {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.customer})</option>)}
                </select>
            </div>
            
            <div className="text-right border-l border-slate-700 pl-4">
                <div className="text-[10px] text-slate-500 uppercase">Version Tag</div>
                <div className="text-sm font-mono text-cyan-400 bg-cyan-900/20 px-2 rounded">{activeProject.version}</div>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
                <div className="text-[10px] text-slate-500 uppercase">Status</div>
                <div className={`text-sm font-bold ${activeProject.status === 'Delivered' ? 'text-green-400' : 'text-indigo-400'}`}>
                    {activeProject.status}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Requirements & Scope */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <SciFiCard title="定制化范围分析" subtitle="GAP ANALYSIS" className="border-indigo-900/50">
               <div className="flex flex-col gap-4">
                   {CUSTOMIZATION_MATRIX.map((item, i) => (
                       <div key={i}>
                           <div className="flex justify-between items-center mb-1 text-xs">
                               <span className="flex items-center gap-2 text-slate-300">
                                   <TechIcon type={item.type} /> {item.module}
                               </span>
                               <span className="font-mono text-indigo-300">{item.custom}% Custom</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full flex overflow-hidden">
                               <div className="bg-slate-600 h-full" style={{width: `${item.std}%`}} title="Standard"></div>
                               <div className="bg-indigo-500 h-full" style={{width: `${item.custom}%`}} title="Custom"></div>
                           </div>
                       </div>
                   ))}
                   <div className="mt-2 flex gap-4 justify-center text-[10px] text-slate-500">
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded-full"></div> Standard Core</span>
                       <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Bespoke Dev</span>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="技术栈依赖" subtitle="DEPENDENCIES" className="flex-1 border-slate-800">
               <div className="space-y-3">
                   <div className="p-2 bg-slate-900/50 border border-slate-700 rounded text-xs flex justify-between items-center">
                       <span className="text-slate-400">Core Framework</span>
                       <span className="font-mono text-white">React 18 / Node.js</span>
                   </div>
                   <div className="p-2 bg-slate-900/50 border border-slate-700 rounded text-xs flex justify-between items-center">
                       <span className="text-slate-400">Protocol</span>
                       <span className="font-mono text-cyan-300">OPC UA / MQTT</span>
                   </div>
                   <div className="p-2 bg-slate-900/50 border border-slate-700 rounded text-xs flex justify-between items-center">
                       <span className="text-slate-400">Database</span>
                       <span className="font-mono text-yellow-300">PostgreSQL + TimeScale</span>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="text-xs text-slate-500 uppercase mb-2">Dev Branch</div>
                       <div className="flex items-center gap-2 font-mono text-xs text-green-400 bg-green-900/10 p-2 rounded border border-green-900/30">
                           <GitBranch size={12} /> {activeProject.branch}
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: The Factory (CI/CD) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Pipeline Visualizer */}
           <SciFiCard title="交付流水线 (CI/CD Pipeline)" subtitle="BUILD #8824" className="h-[220px] border-indigo-900/50 bg-[#080b16]" noPadding>
               <div className="w-full h-full p-6 flex flex-col justify-center">
                   <div className="flex items-center w-full px-4">
                       {PIPELINE_STEPS.map((step, i) => (
                           <PipelineNode key={step.id} stage={step} index={i} total={PIPELINE_STEPS.length} />
                       ))}
                   </div>
               </div>
           </SciFiCard>

           {/* Code Stream & Activity */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
               
               {/* Commit Log */}
               <SciFiCard title="代码提交记录 (Commit Log)" subtitle="GIT HISTORY" className="border-slate-800 bg-black/40">
                   <div className="font-mono text-xs h-full flex flex-col gap-3 overflow-hidden">
                       {COMMIT_LOG.map((commit, i) => (
                           <div key={commit.id} className="flex gap-3 relative pl-4 group">
                               {/* Timeline line */}
                               <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800 group-last:bottom-auto group-last:h-2"></div>
                               <div className="absolute left-[-3px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-black"></div>
                               
                               <div className="flex-1 pb-3 border-b border-slate-800/50 last:border-0">
                                   <div className="flex justify-between text-slate-500 mb-1">
                                       <span>{commit.hash}</span>
                                       <span>{commit.time}</span>
                                   </div>
                                   <div className="text-slate-200 font-bold mb-0.5">{commit.feature}</div>
                                   <div className="text-slate-400 text-[10px] flex items-center gap-1">
                                       <User size={10} /> {commit.dev}
                                   </div>
                               </div>
                           </div>
                       ))}
                       <div className="text-[10px] text-green-400 animate-pulse mt-auto pt-2">
                           &gt; Waiting for new commits...
                       </div>
                   </div>
               </SciFiCard>

               {/* Quality Metrics */}
               <SciFiCard title="代码质量与缺陷趋势" subtitle="QA METRICS" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={BUG_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#333'}} />
                               <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize:'10px'}}/>
                               <Area type="monotone" dataKey="open" name="Open Bugs" stroke="#ef4444" fill="url(#colorOpen)" />
                               <Line type="monotone" dataKey="closed" name="Fixed" stroke="#10b981" strokeWidth={2} dot={false} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Delivery & UAT */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* UAT Status */}
           <SciFiCard title="用户验收测试 (UAT)" subtitle="STATUS" className="border-indigo-900/50">
               <div className="flex flex-col items-center py-4">
                   <div className="relative w-32 h-32">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie 
                                 data={[{name:'Pass', value: 85}, {name:'Fail', value: 5}, {name:'Pending', value: 10}]} 
                                 innerRadius={25} 
                                 outerRadius={35} 
                                 dataKey="value"
                               >
                                   <Cell fill="#10b981" />
                                   <Cell fill="#ef4444" />
                                   <Cell fill="#64748b" />
                               </Pie>
                           </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                           <span className="text-2xl font-bold text-white">85%</span>
                           <span className="text-[8px] text-slate-500 uppercase">Passed</span>
                       </div>
                   </div>
                   
                   <div className="w-full space-y-2 px-2 mt-2">
                       <div className="flex justify-between text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                           <span className="text-slate-400">Critical Issues</span>
                           <span className="text-red-400 font-bold">0</span>
                       </div>
                       <div className="flex justify-between text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                           <span className="text-slate-400">Test Cases Executed</span>
                           <span className="text-white font-bold">142/160</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Digital Vault (Deliverables) */}
           <SciFiCard title="交付物数字金库" subtitle="SECURE VAULT" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2">
                   {DELIVERABLES.map((file, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-indigo-500/30 transition-colors group cursor-pointer">
                           <div className="flex items-center gap-3 overflow-hidden">
                               <div className="p-2 bg-slate-800 rounded text-slate-400 group-hover:text-white transition-colors">
                                   {file.type === 'Binary' ? <Package size={16}/> : <FileCode size={16}/>}
                               </div>
                               <div className="min-w-0">
                                   <div className="text-xs font-bold text-slate-200 truncate">{file.name}</div>
                                   <div className="text-[9px] text-slate-500">{file.size} • {file.type}</div>
                               </div>
                           </div>
                           <Download size={14} className="text-slate-600 group-hover:text-indigo-400" />
                       </div>
                   ))}
               </div>
               
               <div className="mt-auto pt-4">
                   <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-lg">
                       <ShieldCheck size={14} /> Sign-off & Release
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
