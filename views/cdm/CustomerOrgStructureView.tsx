
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Share2, Layers, Users, Building2, 
  MapPin, Globe, ArrowRight, History, ZoomIn, 
  ZoomOut, Maximize, MoreHorizontal, PieChart,
  Briefcase, Landmark, GitBranch
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis
} from 'recharts';

// --- Types ---

interface OrgNode {
  id: string;
  label: string;
  type: 'Root' | 'Region' | 'Company' | 'Dept';
  x: number;
  y: number;
  parentId?: string;
  equity?: number; // Ownership %
  status?: 'Active' | 'Dormant';
}

interface EntityDetail {
  id: string;
  name: string;
  legalRep: string;
  capital: string;
  founded: string;
  address: string;
  shareholders: { name: string; pct: number }[];
  keyPersonnel: { role: string; name: string }[];
}

// --- Mock Data ---

const NODES_DATA: OrgNode[] = [
  { id: 'root', label: 'Quantum Global Group', type: 'Root', x: 400, y: 50, status: 'Active' },
  { id: 'apac', label: 'APAC Headquarters', type: 'Region', x: 200, y: 150, parentId: 'root', equity: 100, status: 'Active' },
  { id: 'na', label: 'North America HQ', type: 'Region', x: 600, y: 150, parentId: 'root', equity: 100, status: 'Active' },
  { id: 'cn-main', label: 'Quantum China Ltd.', type: 'Company', x: 100, y: 280, parentId: 'apac', equity: 100, status: 'Active' },
  { id: 'jp-branch', label: 'Quantum Japan KK', type: 'Company', x: 300, y: 280, parentId: 'apac', equity: 85, status: 'Active' },
  { id: 'us-tech', label: 'Quantum Tech Inc.', type: 'Company', x: 500, y: 280, parentId: 'na', equity: 100, status: 'Active' },
  { id: 'ca-log', label: 'Maple Logistics', type: 'Company', x: 700, y: 280, parentId: 'na', equity: 60, status: 'Active' },
  { id: 'cn-sh', label: 'Shanghai R&D', type: 'Dept', x: 50, y: 400, parentId: 'cn-main', status: 'Active' },
  { id: 'cn-bj', label: 'Beijing Sales', type: 'Dept', x: 150, y: 400, parentId: 'cn-main', status: 'Active' },
];

const ENTITY_DETAILS: Record<string, EntityDetail> = {
  'root': {
    id: 'root', name: 'Quantum Global Group',
    legalRep: 'Robert Chen', capital: '$ 5B', founded: '1985-04-12',
    address: '100 Tech Plaza, Singapore',
    shareholders: [{name: 'Public Float', pct: 60}, {name: 'Founders', pct: 30}, {name: 'Institutions', pct: 10}],
    keyPersonnel: [{role: 'CEO', name: 'R. Chen'}, {role: 'CFO', name: 'S. Williams'}]
  },
  'cn-main': {
    id: 'cn-main', name: 'Quantum China Ltd.',
    legalRep: 'Zhang Wei', capital: '¥ 500M', founded: '2005-09-01',
    address: '88 Century Ave, Shanghai',
    shareholders: [{name: 'Quantum Global', pct: 100}],
    keyPersonnel: [{role: 'GM', name: 'Zhang W.'}, {role: 'CTO', name: 'Li H.'}]
  },
  // Fallback for others
  'default': {
    id: 'unknown', name: 'Entity Details',
    legalRep: 'N/A', capital: 'N/A', founded: 'N/A',
    address: 'N/A',
    shareholders: [{name: 'Parent Co', pct: 100}],
    keyPersonnel: []
  }
};

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

// --- Components ---

const OrgGraph = ({ 
  nodes, 
  activeId, 
  onSelect,
  viewMode 
}: { 
  nodes: OrgNode[], 
  activeId: string, 
  onSelect: (id: string) => void,
  viewMode: 'mgmt' | 'equity'
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#080b16] rounded border border-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <svg width="100%" height="100%" viewBox="0 0 800 500" className="absolute top-0 left-0">
        <defs>
          <filter id="glow-node">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
        </defs>

        {/* Connectors */}
        {nodes.map(node => {
          if (!node.parentId) return null;
          const parent = nodes.find(n => n.id === node.parentId);
          if (!parent) return null;

          return (
            <g key={`link-${node.id}`}>
              {viewMode === 'mgmt' ? (
                // Elbow connectors for Management View
                <path 
                  d={`M${parent.x},${parent.y + 25} L${parent.x},${(parent.y + node.y)/2} L${node.x},${(parent.y + node.y)/2} L${node.x},${node.y - 25}`}
                  stroke="#334155" 
                  strokeWidth="1" 
                  fill="none"
                />
              ) : (
                // Dashed lines for Equity View with labels
                <>
                  <line 
                    x1={parent.x} y1={parent.y + 25} 
                    x2={node.x} y2={node.y - 25} 
                    stroke="#475569" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowhead)"
                  />
                  {node.equity && (
                    <rect x={(parent.x + node.x)/2 - 15} y={(parent.y + node.y)/2 - 8} width="30" height="16" rx="4" fill="#0f172a" stroke="#475569" />
                  )}
                  {node.equity && (
                    <text x={(parent.x + node.x)/2} y={(parent.y + node.y)/2 + 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
                      {node.equity}%
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isActive = activeId === node.id;
          const nodeColor = node.type === 'Root' ? '#f59e0b' : node.type === 'Region' ? '#0ea5e9' : node.type === 'Company' ? '#8b5cf6' : '#10b981';
          
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x}, ${node.y})`} 
              className="cursor-pointer transition-all duration-300"
              onClick={() => onSelect(node.id)}
              style={{filter: isActive ? 'url(#glow-node)' : 'none'}}
            >
              <rect 
                x="-60" y="-25" width="120" height="50" rx="6" 
                fill={isActive ? 'rgba(15, 23, 42, 0.9)' : '#0f172a'} 
                stroke={isActive ? nodeColor : '#334155'}
                strokeWidth={isActive ? 2 : 1}
              />
              {/* Type Indicator */}
              <circle cx="-60" cy="0" r="4" fill={nodeColor} />
              
              <text x="0" y="-5" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" pointerEvents="none">
                {node.label}
              </text>
              <text x="0" y="12" textAnchor="middle" fill="#64748b" fontSize="9" pointerEvents="none">
                {node.type.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
         <button className="p-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300 transition-colors"><ZoomIn size={16}/></button>
         <button className="p-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300 transition-colors"><ZoomOut size={16}/></button>
         <button className="p-2 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 text-slate-300 transition-colors"><Maximize size={16}/></button>
      </div>
    </div>
  );
};

export const CustomerOrgStructureView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState('cn-main');
  const [viewMode, setViewMode] = useState<'mgmt' | 'equity'>('mgmt');
  const [activeTab, setActiveTab] = useState('basic');

  const selectedDetails = ENTITY_DETAILS[selectedNodeId] || ENTITY_DETAILS['default'];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f0a29] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Briefcase size={14} /> Organization Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户组织架构 <span className="text-indigo-500">全景透视</span>
          </h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
            <div className="bg-indigo-900/20 px-4 py-1.5 rounded border border-indigo-500/30 flex items-center gap-3">
               <span className="text-xs text-indigo-300 uppercase">View Mode:</span>
               <div className="flex bg-slate-900 rounded p-0.5">
                  <button 
                    onClick={() => setViewMode('mgmt')}
                    className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'mgmt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    管理架构
                  </button>
                  <button 
                    onClick={() => setViewMode('equity')}
                    className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'equity' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    股权穿透
                  </button>
               </div>
            </div>
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                 type="text" 
                 placeholder="搜索实体名称..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
               />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Filters & Tree List */}
        <div className="w-full lg:w-64 flex flex-col gap-4 overflow-y-auto pr-1">
           <SciFiCard title="组织层级筛选" className="border-slate-800">
              <div className="space-y-2">
                 <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-sm text-slate-200 flex items-center gap-2"><Globe size={14} className="text-indigo-400"/> Regions</span>
                    <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">2</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-sm text-slate-200 flex items-center gap-2"><Building2 size={14} className="text-cyan-400"/> Companies</span>
                    <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">4</span>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-sm text-slate-200 flex items-center gap-2"><Users size={14} className="text-emerald-400"/> Depts</span>
                    <span className="text-xs bg-slate-700 px-1.5 rounded text-slate-300">15</span>
                 </div>
              </div>
           </SciFiCard>

           <div className="mt-auto bg-indigo-900/10 border border-indigo-900/30 p-4 rounded text-center">
               <div className="text-xs text-indigo-300 uppercase mb-2">Structure Version</div>
               <div className="text-2xl font-mono font-bold text-white">v24.03</div>
               <div className="text-[10px] text-slate-500 mt-1">Last Sync: Today 08:30</div>
           </div>
        </div>

        {/* CENTER COLUMN: Main Graph Canvas */}
        <div className="flex-1 flex flex-col gap-4">
           {/* Graph */}
           <div className="flex-1 min-h-[400px]">
              <OrgGraph 
                nodes={NODES_DATA} 
                activeId={selectedNodeId} 
                onSelect={setSelectedNodeId}
                viewMode={viewMode}
              />
           </div>

           {/* Timeline Slider (Simulated) */}
           <div className="h-16 bg-slate-900/50 border border-slate-800 rounded flex items-center px-4 gap-4">
               <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                   <History size={14} /> Timeline
               </div>
               <div className="flex-1 relative h-1 bg-slate-700 rounded cursor-pointer">
                   <div className="absolute top-0 left-0 h-full bg-indigo-500 w-[90%]"></div>
                   <div className="absolute top-1/2 left-[90%] w-3 h-3 bg-white rounded-full -translate-y-1/2 shadow-lg cursor-grab"></div>
                   
                   {/* Markers */}
                   <div className="absolute top-3 left-0 text-[10px] text-slate-500">2020</div>
                   <div className="absolute top-3 left-[25%] text-[10px] text-slate-500">2021</div>
                   <div className="absolute top-3 left-[50%] text-[10px] text-slate-500">2022</div>
                   <div className="absolute top-3 left-[75%] text-[10px] text-slate-500">2023</div>
                   <div className="absolute top-3 right-0 text-[10px] text-slate-500">Now</div>
               </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Inspector */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Inspector Card */}
           <SciFiCard title="实体详情档案" subtitle={selectedDetails.id.toUpperCase()} className="border-indigo-900/50">
               
               {/* Identity Header */}
               <div className="mb-6">
                   <div className="flex items-start justify-between">
                       <div>
                           <h2 className="text-xl font-bold text-white leading-tight">{selectedDetails.name}</h2>
                           <div className="flex gap-2 mt-2">
                               <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 text-[10px] font-bold rounded border border-indigo-700/50">
                                   Subsidiary
                               </span>
                               <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-700/30">
                                   Active
                               </span>
                           </div>
                       </div>
                       <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                           <Landmark size={20} />
                       </div>
                   </div>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-slate-700 mb-4">
                   {['basic', 'equity', 'people'].map(tab => (
                       <button
                         key={tab}
                         onClick={() => setActiveTab(tab)}
                         className={`flex-1 pb-2 text-xs font-bold uppercase border-b-2 transition-colors
                            ${activeTab === tab ? 'text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}
                         `}
                       >
                           {tab === 'basic' ? '基础信息' : tab === 'equity' ? '股权结构' : '关键人员'}
                       </button>
                   ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[200px]">
                   {activeTab === 'basic' && (
                       <div className="space-y-3">
                           <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                               <span className="text-xs text-slate-400">Legal Rep</span>
                               <span className="text-sm font-bold text-white">{selectedDetails.legalRep}</span>
                           </div>
                           <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                               <span className="text-xs text-slate-400">Reg. Capital</span>
                               <span className="text-sm font-mono text-white">{selectedDetails.capital}</span>
                           </div>
                           <div className="flex justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                               <span className="text-xs text-slate-400">Founded</span>
                               <span className="text-sm font-mono text-white">{selectedDetails.founded}</span>
                           </div>
                           <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                               <span className="text-xs text-slate-400 block mb-1">Address</span>
                               <span className="text-xs text-slate-300 flex items-start gap-1">
                                   <MapPin size={12} className="mt-0.5 text-indigo-500 shrink-0"/> {selectedDetails.address}
                               </span>
                           </div>
                       </div>
                   )}

                   {activeTab === 'equity' && (
                       <div className="flex flex-col items-center">
                           <div className="w-full h-40">
                               <ResponsiveContainer width="100%" height="100%">
                                   <RePieChart>
                                       <Pie 
                                         data={selectedDetails.shareholders} 
                                         dataKey="pct" 
                                         nameKey="name" 
                                         cx="50%" cy="50%" 
                                         innerRadius={40} 
                                         outerRadius={60} 
                                         paddingAngle={5}
                                       >
                                           {selectedDetails.shareholders.map((entry, index) => (
                                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                           ))}
                                       </Pie>
                                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1'}} />
                                   </RePieChart>
                               </ResponsiveContainer>
                           </div>
                           <div className="w-full space-y-2 mt-2">
                               {selectedDetails.shareholders.map((sh, idx) => (
                                   <div key={idx} className="flex justify-between items-center text-xs">
                                       <div className="flex items-center gap-2">
                                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                           <span className="text-slate-300">{sh.name}</span>
                                       </div>
                                       <span className="font-mono text-white">{sh.pct}%</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                   {activeTab === 'people' && (
                       <div className="space-y-3">
                           {selectedDetails.keyPersonnel.map((person, idx) => (
                               <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded">
                                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                                       {person.name.charAt(0)}
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-white">{person.name}</div>
                                       <div className="text-xs text-indigo-400">{person.role}</div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
               </div>

               <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
                   <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors flex items-center justify-center gap-2">
                       <GitBranch size={14} /> 调整架构
                   </button>
                   <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                       <MoreHorizontal size={14} /> 更多操作
                   </button>
               </div>

           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
