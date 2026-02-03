
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, ShieldCheck, Lock, Unlock, 
  Search, Filter, AlertTriangle, FileText, 
  Network, Share2, Eye, UserX, Gavel, 
  CheckCircle2, XCircle, Scan, Siren,
  Fingerprint, Globe, Landmark
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- Types ---

interface RiskEntity {
  id: string;
  name: string;
  type: 'Enterprise' | 'Person';
  riskScore: number; // 0-100 (100 is high risk)
  status: 'Safe' | 'Watchlist' | 'Blacklisted';
  issues: number;
  lastAudit: string;
  region: string;
}

interface ComplianceCheck {
  id: string;
  category: string;
  name: string;
  status: 'Pass' | 'Fail' | 'Flagged' | 'Pending';
  score: number;
  detail: string;
}

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'Target' | 'Shareholder' | 'Subsidiary' | 'Related';
  risk: 'High' | 'Med' | 'Low';
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

// --- Mock Data ---

const RISK_ENTITIES: RiskEntity[] = [
  { id: 'R-001', name: 'Titanium Holdings Ltd.', type: 'Enterprise', riskScore: 85, status: 'Blacklisted', issues: 4, lastAudit: '2024-03-20', region: 'Overseas' },
  { id: 'R-002', name: 'Pacific Power Group', type: 'Enterprise', riskScore: 42, status: 'Watchlist', issues: 2, lastAudit: '2024-03-18', region: 'North China' },
  { id: 'R-003', name: 'Shanghai Heavy Ind.', type: 'Enterprise', riskScore: 12, status: 'Safe', issues: 0, lastAudit: '2024-02-15', region: 'East China' },
  { id: 'R-004', name: 'Zhang Wei (Legal Rep)', type: 'Person', riskScore: 65, status: 'Watchlist', issues: 1, lastAudit: '2024-03-19', region: 'East China' },
  { id: 'R-005', name: 'Oceanic Trade Corp.', type: 'Enterprise', riskScore: 92, status: 'Blacklisted', issues: 6, lastAudit: '2023-12-10', region: 'Overseas' },
];

const CHECKLIST: ComplianceCheck[] = [
  { id: 'C1', category: 'Identity', name: 'Basic Registration (AIC)', status: 'Pass', score: 100, detail: 'Verified via Govt Database' },
  { id: 'C2', category: 'Sanctions', name: 'Global Sanctions List', status: 'Fail', score: 0, detail: 'Match found in SDN List (98% confidence)' },
  { id: 'C3', category: 'Legal', name: 'Litigation History', status: 'Flagged', score: 45, detail: '3 active contract disputes detected' },
  { id: 'C4', category: 'Finance', name: 'Tax Compliance', status: 'Pass', score: 95, detail: 'Grade A Taxpayer' },
  { id: 'C5', category: 'Reputation', name: 'Adverse Media', status: 'Flagged', score: 60, detail: 'Negative news report found (2023)' },
];

// Knowledge Graph Nodes for the Visualization
const GRAPH_NODES: GraphNode[] = [
  { id: 'main', label: 'Titanium Holdings', x: 400, y: 300, type: 'Target', risk: 'High' },
  { id: 'sh1', label: 'Global Shell Co.', x: 250, y: 150, type: 'Shareholder', risk: 'High' }, // Risky parent
  { id: 'sh2', label: 'Tech Ventures', x: 550, y: 150, type: 'Shareholder', risk: 'Low' },
  { id: 'sub1', label: 'Titanium Sales', x: 300, y: 450, type: 'Subsidiary', risk: 'Med' },
  { id: 'sub2', label: 'Titanium R&D', x: 500, y: 450, type: 'Subsidiary', risk: 'Low' },
  { id: 'rel1', label: 'Li Qiang (CEO)', x: 150, y: 300, type: 'Related', risk: 'Med' }, // Risky person
  { id: 'rel2', label: 'MegaCorp (Supplier)', x: 650, y: 300, type: 'Related', risk: 'Low' },
];

const GRAPH_LINKS: GraphLink[] = [
  { source: 'sh1', target: 'main', label: 'Holds 60%' },
  { source: 'sh2', target: 'main', label: 'Holds 40%' },
  { source: 'main', target: 'sub1', label: 'Owns 100%' },
  { source: 'main', target: 'sub2', label: 'Owns 100%' },
  { source: 'rel1', target: 'main', label: 'Legal Rep' },
  { source: 'rel1', target: 'sh1', label: 'Director' }, // Cross link showing risk contagion
  { source: 'main', target: 'rel2', label: 'Trade' },
];

const RISK_HISTORY = [
  { month: 'Sep', score: 20 },
  { month: 'Oct', score: 25 },
  { month: 'Nov', score: 45 },
  { month: 'Dec', score: 60 },
  { month: 'Jan', score: 82 },
  { month: 'Feb', score: 85 },
];

const RISK_RADAR = [
  { subject: 'Sanctions', A: 95, fullMark: 100 }, // High risk
  { subject: 'Legal', A: 70, fullMark: 100 },
  { subject: 'Financial', A: 60, fullMark: 100 },
  { subject: 'Operational', A: 30, fullMark: 100 },
  { subject: 'ESG', A: 40, fullMark: 100 },
];

// --- Components ---

const RiskBadge = ({ level }: { level: string }) => {
  const styles = {
    'Safe': 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    'Watchlist': 'bg-amber-900/40 text-amber-400 border-amber-800',
    'Blacklisted': 'bg-red-900/40 text-red-400 border-red-800 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse',
  }[level] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles} flex items-center gap-1`}>
      {level === 'Blacklisted' && <AlertTriangle size={10} />}
      {level}
    </span>
  );
};

const InteractiveGraph = ({ activeNode, onSelect }: { activeNode: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#050810] overflow-hidden rounded border border-slate-800 group">
      {/* Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
        </defs>
        
        {/* Links */}
        {GRAPH_LINKS.map((link, i) => {
          const source = GRAPH_NODES.find(n => n.id === link.source);
          const target = GRAPH_NODES.find(n => n.id === link.target);
          if(!source || !target) return null;
          
          return (
            <g key={i}>
              <line 
                x1={source.x} y1={source.y} 
                x2={target.x} y2={target.y} 
                stroke={source.risk === 'High' || target.risk === 'High' ? '#ef4444' : '#475569'} 
                strokeWidth="1" 
                strokeOpacity="0.5"
                markerEnd="url(#arrowhead)"
              />
              <text x={(source.x+target.x)/2} y={(source.y+target.y)/2} fill="#64748b" fontSize="9" textAnchor="middle" dy="-5">
                {link.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Nodes (HTML for interaction) */}
      {GRAPH_NODES.map(node => (
        <div
          key={node.id}
          onClick={() => onSelect(node.id)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-2
             ${activeNode === node.id ? 'scale-110 z-20' : 'scale-100 z-10 hover:scale-105'}
          `}
          style={{ left: node.x, top: node.y }}
        >
          {/* Node Circle */}
          <div className={`
            w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg bg-[#0b1221]
            ${node.risk === 'High' ? 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 
              node.risk === 'Med' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'}
          `}>
             {node.type === 'Target' ? <ShieldAlert size={20} /> : 
              node.type === 'Shareholder' ? <Landmark size={18} /> : 
              node.type === 'Subsidiary' ? <Network size={18} /> : <UserX size={18} />}
          </div>
          
          {/* Label */}
          <div className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap
             ${node.risk === 'High' ? 'bg-red-950/80 border-red-800 text-red-200' : 
               node.risk === 'Med' ? 'bg-amber-950/80 border-amber-800 text-amber-200' : 'bg-slate-900/80 border-slate-700 text-slate-300'}
          `}>
            {node.label}
          </div>
        </div>
      ))}

      {/* Graph Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
         <div className="bg-black/60 px-3 py-1 rounded border border-slate-700 text-[10px] text-slate-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> High Risk
            <div className="w-2 h-2 rounded-full bg-amber-500"></div> Med Risk
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Low Risk
         </div>
      </div>
    </div>
  );
};

export const CustomerRiskComplianceView: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState(RISK_ENTITIES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeEntity = RISK_ENTITIES.find(e => e.id === selectedEntityId) || RISK_ENTITIES[0];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/50 pb-4 bg-gradient-to-r from-[#1a0505] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-wider">
             <ShieldAlert size={14} className="animate-pulse" /> Risk Intelligence Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户风险评估与 <span className="text-red-500">合规性审查</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Global Threat Level</div>
                <div className="text-xl font-mono font-bold text-amber-400">ELEVATED</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Sanction Hits (24h)</div>
                <div className="text-xl font-mono font-bold text-white">3</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Pending Audits</div>
                <div className="text-xl font-mono font-bold text-red-500 animate-pulse">12</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Risk Entities List */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search risky entities..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-red-500 text-slate-200 placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           <div className="flex flex-col gap-3">
               {RISK_ENTITIES.map(entity => (
                   <div 
                     key={entity.id}
                     onClick={() => setSelectedEntityId(entity.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative group
                        ${selectedEntityId === entity.id 
                            ? 'bg-red-950/30 border-red-500/50 shadow-[inset_4px_0_0_#ef4444]' 
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-mono text-slate-500">{entity.id}</span>
                           <RiskBadge level={entity.status} />
                       </div>
                       
                       <h3 className={`font-bold text-sm mb-1 ${selectedEntityId === entity.id ? 'text-white' : 'text-slate-300'}`}>
                           {entity.name}
                       </h3>
                       
                       <div className="flex justify-between items-end mt-2">
                           <div className="text-[10px] text-slate-500 flex flex-col">
                               <span>Last Audit: {entity.lastAudit}</span>
                               <span>Region: {entity.region}</span>
                           </div>
                           <div className="text-right">
                               <div className="text-[9px] text-slate-500 uppercase">Risk Score</div>
                               <div className={`text-lg font-bold font-mono ${entity.riskScore > 80 ? 'text-red-500' : entity.riskScore > 50 ? 'text-amber-500' : 'text-green-500'}`}>
                                   {entity.riskScore}
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Knowledge Graph & Visuals */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* The Risk Graph */}
           <SciFiCard title="关联风险图谱 (Knowledge Graph)" subtitle="RISK CONTAGION" className="h-[450px] border-red-900/50 bg-[#080a14]" noPadding>
               <div className="w-full h-full p-2 relative flex flex-col">
                   <InteractiveGraph activeNode="main" onSelect={() => {}} />
                   
                   {/* Overlay Stats */}
                   <div className="absolute top-4 left-4 pointer-events-none space-y-2">
                       <div className="bg-black/60 backdrop-blur p-2 rounded border border-slate-700 w-48">
                           <div className="text-[10px] text-slate-400 uppercase font-bold">Risk Propagation</div>
                           <div className="text-xs text-red-300 mt-1">High probability of risk contagion from Parent Entity (Global Shell Co.)</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Analytics Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="风险趋势分析 (6 Months)" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={RISK_HISTORY}>
                               <defs>
                                   <linearGradient id="colorRiskTrend" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444', color: '#fff'}} />
                               <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} fill="url(#colorRiskTrend)" name="Risk Score" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="风险维度雷达" className="border-slate-800">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Risk Level" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0f0a1e', borderColor: '#f59e0b', color: '#e2e8f0'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Compliance Checklist */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Compliance Audit Report */}
           <SciFiCard title="合规体检报告 (Audit)" subtitle="CHECKLIST" className="flex-1 border-red-900/50">
               <div className="flex flex-col gap-0 relative h-full">
                   {/* Connecting Line */}
                   <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 -z-0"></div>

                   {CHECKLIST.map((check, i) => (
                       <div key={check.id} className="relative pl-10 py-3 group">
                           {/* Status Node */}
                           <div className={`absolute left-0 top-3 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#0b1221] z-10
                               ${check.status === 'Pass' ? 'border-green-500 text-green-500' : 
                                 check.status === 'Fail' ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                                 'border-yellow-500 text-yellow-500'}
                           `}>
                               {check.status === 'Pass' ? <CheckCircle2 size={16}/> : 
                                check.status === 'Fail' ? <XCircle size={16}/> : <AlertTriangle size={16}/>}
                           </div>

                           <div className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-slate-600 transition-colors">
                               <div className="flex justify-between items-start mb-1">
                                   <span className="text-xs font-bold text-slate-200">{check.name}</span>
                                   <span className="text-[10px] text-slate-500">{check.category}</span>
                               </div>
                               <p className={`text-[10px] leading-tight mb-2 ${
                                   check.status === 'Fail' ? 'text-red-300' : 'text-slate-400'
                               }`}>
                                   {check.detail}
                               </p>
                               <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full ${check.score > 80 ? 'bg-green-500' : check.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                     style={{width: `${check.score}%`}}
                                   ></div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Action Panel */}
           <div className="grid grid-cols-2 gap-3 mb-2">
               <button className="py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                   <Siren size={14} /> Freeze Account
               </button>
               <button className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                   <FileText size={14} /> Export Report
               </button>
           </div>

           <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded text-[10px] text-blue-200/80 flex items-start gap-2">
               <Fingerprint size={14} className="text-blue-400 shrink-0 mt-0.5" />
               <div>
                   <strong>AI Insight:</strong> Pattern matching suggests high likelihood of being a "Shell Company" due to shared address with 3 other blacklisted entities.
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
