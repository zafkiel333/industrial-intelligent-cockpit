
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  GitMerge, AlertTriangle, CheckCircle2, 
  Search, Workflow, Activity, Wrench, 
  FileText, ArrowRight, Zap, Database,
  GitCommit, ChevronRight, ChevronDown,
  Layers, Thermometer, Droplets
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid
} from 'recharts';

// --- Types ---

type LogicGate = 'AND' | 'OR' | 'BASIC_EVENT' | 'TOP_EVENT';

interface FaultNode {
  id: string;
  label: string;
  type: LogicGate;
  probability: number; // 0-1
  desc?: string;
  children?: FaultNode[];
  status?: 'Normal' | 'Warning' | 'Critical';
}

// --- Mock Data: Hydraulic Fault Tree ---

const FAULT_TREE_DATA: FaultNode[] = [
  {
    id: 'T-01',
    label: '液压缸无法动作 (Cylinder Failure)',
    type: 'TOP_EVENT',
    probability: 0.05,
    status: 'Critical',
    children: [
      {
        id: 'G-01',
        label: '无压力油输入',
        type: 'OR',
        probability: 0.03,
        children: [
          { id: 'B-01', label: '主泵损坏', type: 'BASIC_EVENT', probability: 0.01, desc: '柱塞磨损或泵轴断裂', status: 'Normal' },
          { id: 'B-02', label: '电机联轴器脱开', type: 'BASIC_EVENT', probability: 0.005, desc: '弹性销剪断', status: 'Normal' },
          { id: 'B-03', label: '吸油管吸空', type: 'BASIC_EVENT', probability: 0.015, desc: '油箱液位过低或过滤器堵塞', status: 'Warning' }
        ]
      },
      {
        id: 'G-02',
        label: '执行元件锁死',
        type: 'OR',
        probability: 0.02,
        children: [
          { id: 'B-04', label: '液压锁未打开', type: 'BASIC_EVENT', probability: 0.01, desc: '控制油压不足', status: 'Normal' },
          { id: 'B-05', label: '活塞卡死', type: 'BASIC_EVENT', probability: 0.01, desc: '密封圈卷入或缸筒变形', status: 'Critical' }
        ]
      }
    ]
  },
  {
    id: 'T-02',
    label: '系统压力不足 (Low Pressure)',
    type: 'TOP_EVENT',
    probability: 0.08,
    status: 'Warning',
    children: [
      {
        id: 'G-03',
        label: '溢流阀故障',
        type: 'OR',
        probability: 0.04,
        children: [
          { id: 'B-06', label: '主阀芯卡死开启', type: 'BASIC_EVENT', probability: 0.02, desc: '油液污染导致', status: 'Warning' },
          { id: 'B-07', label: '先导阀弹簧疲劳', type: 'BASIC_EVENT', probability: 0.02, desc: '长期使用失效', status: 'Normal' }
        ]
      },
      {
        id: 'G-04',
        label: '内泄露严重',
        type: 'OR',
        probability: 0.04,
        children: [
          { id: 'B-08', label: '换向阀间隙过大', type: 'BASIC_EVENT', probability: 0.02, desc: '阀芯磨损', status: 'Normal' },
          { id: 'B-09', label: '泵容积效率低', type: 'BASIC_EVENT', probability: 0.02, desc: '配油盘磨损', status: 'Warning' }
        ]
      }
    ]
  },
  {
    id: 'T-03',
    label: '油温过高 (Overheating)',
    type: 'TOP_EVENT',
    probability: 0.12,
    status: 'Warning',
    children: [
      {
        id: 'G-05',
        label: '冷却失效',
        type: 'AND',
        probability: 0.06,
        children: [
          { id: 'B-10', label: '冷却水中断', type: 'BASIC_EVENT', probability: 0.1, desc: '水源切断', status: 'Normal' },
          { id: 'B-11', label: '冷却器堵塞', type: 'BASIC_EVENT', probability: 0.6, desc: '结垢导致换热差', status: 'Warning' }
        ]
      }
    ]
  }
];

const HISTORICAL_STATS = [
  { name: '密封失效', count: 45, color: '#f59e0b' },
  { name: '油液污染', count: 32, color: '#ea580c' },
  { name: '阀件卡滞', count: 28, color: '#d97706' },
  { name: '泵损', count: 15, color: '#78350f' },
  { name: '电气误动', count: 10, color: '#451a03' },
];

const RISK_RADAR = [
  { subject: '发生概率', A: 80, fullMark: 100 },
  { subject: '检测难度', A: 65, fullMark: 100 },
  { subject: '维修成本', A: 90, fullMark: 100 },
  { subject: '停机影响', A: 95, fullMark: 100 },
  { subject: '安全危害', A: 70, fullMark: 100 },
];

// --- COMPONENTS ---

// Node Component for the Tree Visualizer
const LogicNode = ({ node, x, y, onSelect, activeId, depth = 0 }: { node: FaultNode, x: number, y: number, onSelect: (n: FaultNode) => void, activeId: string, depth?: number }) => {
    const isSelected = activeId === node.id;
    
    // Color logic
    const strokeColor = node.status === 'Critical' ? '#ef4444' : node.status === 'Warning' ? '#f59e0b' : '#334155';
    const fillColor = node.status === 'Critical' ? '#450a0a' : node.status === 'Warning' ? '#451a03' : '#0f172a';
    
    return (
        <g onClick={(e) => { e.stopPropagation(); onSelect(node); }} className="cursor-pointer transition-all duration-300">
            {/* Logic Gate Symbol or Event Box */}
            {node.type === 'AND' || node.type === 'OR' ? (
                <g transform={`translate(${x-15}, ${y-15})`}>
                    <path d={node.type === 'AND' 
                        ? "M0,0 L15,0 C25,0 25,30 15,30 L0,30 Z" 
                        : "M0,0 Q10,15 0,30 Q25,30 30,15 Q25,0 0,0"} 
                        fill={fillColor} stroke={strokeColor} strokeWidth="2" 
                    />
                    <text x="10" y="20" fontSize="10" fill={strokeColor} fontWeight="bold">{node.type}</text>
                </g>
            ) : (
                <g transform={`translate(${x-60}, ${y-20})`}>
                    <rect width="120" height="40" rx="4" fill={isSelected ? '#2e1065' : fillColor} stroke={isSelected ? '#a855f7' : strokeColor} strokeWidth={isSelected ? 3 : 2} />
                    {/* Status Indicator */}
                    <circle cx="10" cy="20" r="4" fill={strokeColor} className={node.status !== 'Normal' ? 'animate-pulse' : ''} />
                    <text x="20" y="25" fontSize="12" fill="white" fontWeight="bold" textAnchor="start">{node.label.length > 8 ? node.label.substring(0,8)+'...' : node.label}</text>
                    <text x="110" y="25" fontSize="10" fill="#94a3b8" textAnchor="end">{node.id}</text>
                </g>
            )}
        </g>
    );
};

// Recursive Link Renderer
const LogicLinks = ({ node, x, y, level, onSelect, activeId }: { node: FaultNode, x: number, y: number, level: number, onSelect: any, activeId: string }) => {
    if (!node.children || node.children.length === 0) return null;

    const childCount = node.children.length;
    const widthPerChild = 140; // Spacing
    const totalWidth = childCount * widthPerChild;
    const startX = x - totalWidth / 2 + widthPerChild / 2;
    const nextY = y + 100;

    return (
        <g>
            {node.children.map((child, i) => {
                const childX = startX + i * widthPerChild;
                
                // Path logic
                const pathD = `M${x},${y+20} L${x},${y+50} L${childX},${y+50} L${childX},${nextY-20}`;
                const isActivePath = activeId === child.id || activeId === node.id; // Simplified path highlighting

                return (
                    <React.Fragment key={child.id}>
                        <path d={pathD} fill="none" stroke={isActivePath ? '#f59e0b' : '#334155'} strokeWidth={isActivePath ? 2 : 1} strokeDasharray={isActivePath ? "0" : "5,5"} />
                        <LogicNode node={child} x={childX} y={nextY} onSelect={onSelect} activeId={activeId} depth={level+1} />
                        <LogicLinks node={child} x={childX} y={nextY} level={level+1} onSelect={onSelect} activeId={activeId} />
                    </React.Fragment>
                );
            })}
        </g>
    );
};


export const HoistFaultTreeView: React.FC = () => {
  const [activeTreeId, setActiveTreeId] = useState('T-01');
  const [selectedNode, setSelectedNode] = useState<FaultNode>(FAULT_TREE_DATA[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const currentTree = FAULT_TREE_DATA.find(t => t.id === activeTreeId) || FAULT_TREE_DATA[0];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#0f0a05] p-2 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#451a03_0%,_#0f0a05_80%)] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/80 border-b border-amber-600/40 p-4 rounded-lg backdrop-blur-md z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-900/30 border-2 border-amber-600 rounded flex items-center justify-center relative">
             <GitMerge size={32} className="text-amber-500" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border border-black"></div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <Activity size={12} /> Hydraulic Diagnostics
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               大型启闭机 <span className="text-amber-600 italic">液压故障树分析系统</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-8 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Faults</div>
                <div className="text-2xl font-mono font-black text-red-500">03</div>
             </div>
             <div className="h-10 w-[1px] bg-slate-700"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Health</div>
                <div className="text-2xl font-mono font-black text-amber-400">85.4%</div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
        
        {/* --- LEFT: Fault Navigator --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="故障现象索引" subtitle="SYMPTOMS" className="border-amber-900/30 bg-[#1c120b]/90">
              <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="搜索故障代码或现象..." 
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500 text-amber-100 placeholder:text-slate-600"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
              </div>
              
              <div className="flex flex-col gap-2">
                  {FAULT_TREE_DATA.map((node) => (
                      <div 
                        key={node.id} 
                        onClick={() => { setActiveTreeId(node.id); setSelectedNode(node); }}
                        className={`p-3 rounded border-l-4 cursor-pointer transition-all hover:bg-slate-800/50 group
                           ${activeTreeId === node.id 
                               ? 'bg-amber-900/20 border-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' 
                               : 'bg-slate-900/30 border-slate-700 hover:border-slate-500'}
                        `}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-white group-hover:text-amber-400">{node.label}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black 
                                  ${node.status === 'Critical' ? 'bg-red-900/40 text-red-400' : node.status === 'Warning' ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'}
                              `}>
                                  {node.status}
                              </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>ID: {node.id}</span>
                              <span>P: {(node.probability * 100).toFixed(1)}%</span>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           <SciFiCard title="历史故障统计" subtitle="STATS" className="flex-1 border-slate-800">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={HISTORICAL_STATS} layout="vertical" margin={{left: 10, right: 10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                           <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} hide />
                           <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0c0a09', border: '1px solid #451a03'}} />
                           <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                               {HISTORICAL_STATS.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Logic Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#080503] border border-amber-900/30 rounded-lg overflow-hidden relative shadow-2xl flex flex-col">
               {/* Toolbar */}
               <div className="absolute top-4 left-4 z-20 flex gap-2">
                   <div className="bg-slate-900/80 backdrop-blur border border-amber-500/30 px-3 py-1.5 rounded text-xs text-amber-500 font-bold uppercase flex items-center gap-2">
                       <Workflow size={14} /> Logic Flow Visualization
                   </div>
               </div>

               {/* SVG Canvas */}
               <div className="flex-1 overflow-auto cursor-grab active:cursor-grabbing relative">
                   <svg width="1000" height="600" viewBox="0 0 1000 600" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
                       <defs>
                           <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                               <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
                           </marker>
                       </defs>
                       
                       {/* Render the Tree */}
                       <g transform="translate(500, 50)">
                           <LogicNode node={currentTree} x={0} y={0} onSelect={setSelectedNode} activeId={selectedNode.id} />
                           <LogicLinks node={currentTree} x={0} y={0} level={0} onSelect={setSelectedNode} activeId={selectedNode.id} />
                       </g>
                   </svg>
                   
                   <div className="absolute bottom-4 left-4 text-[10px] text-slate-500">
                       <p>• Click nodes to inspect details</p>
                       <p>• Red indicates critical failure path</p>
                   </div>
               </div>
           </div>

           {/* Bottom: Probability Analysis */}
           <div className="h-[180px] grid grid-cols-2 gap-4">
               <SciFiCard title="风险评估雷达" subtitle="ASSESSMENT" className="border-slate-800" noPadding>
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                               <PolarGrid stroke="#451a03" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Current Risk" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <div className="bg-slate-900/40 border border-slate-800 rounded p-4 flex flex-col justify-center gap-2">
                   <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                       <Zap size={14} className="text-yellow-500"/> Failure Probability Calculation
                   </div>
                   <div className="text-xs text-slate-400">
                       Based on current component reliability data:
                   </div>
                   <div className="flex items-baseline gap-2 mt-2">
                       <span className="text-3xl font-mono font-black text-white">{(selectedNode.probability * 100).toFixed(2)}%</span>
                       <span className="text-xs text-red-400 font-bold">Likelihood</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{width: `${selectedNode.probability * 500}%`}}></div>
                   </div>
               </div>
           </div>

        </div>

        {/* --- RIGHT: Details & Solution --- */}
        <div className="w-[300px] flex flex-col gap-4">
           
           <SciFiCard title="节点诊断详情" subtitle="DETAILS" className="border-amber-900/30">
               <div className="flex flex-col gap-4 p-1">
                   <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                           <span className="text-[10px] font-mono text-amber-500">{selectedNode.id}</span>
                       </div>
                       <div className="text-[11px] text-slate-400 leading-relaxed">
                           {selectedNode.desc || 'System Logic Gate (Intermediate Event)'}
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                           <span>Component Type</span>
                           <span className="text-white">{selectedNode.type}</span>
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                           <span>Status</span>
                           <span className={selectedNode.status === 'Normal' ? 'text-green-400' : 'text-red-400'}>{selectedNode.status}</span>
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-500 pb-1">
                           <span>Last Inspection</span>
                           <span className="text-white">2024-03-10</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="推荐解决方案" subtitle="SOP" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full">
                   {selectedNode.type === 'BASIC_EVENT' ? (
                       <>
                           <div className="flex items-start gap-3 p-3 bg-green-900/10 border border-green-900/30 rounded cursor-pointer hover:bg-green-900/20 transition-all">
                               <Wrench size={16} className="text-green-500 shrink-0 mt-0.5" />
                               <div>
                                   <div className="text-xs font-bold text-green-200">更换备件</div>
                                   <div className="text-[10px] text-slate-400 mt-1">申请备件包 #H-204 (库存: 2)</div>
                               </div>
                           </div>
                           <div className="flex items-start gap-3 p-3 bg-blue-900/10 border border-blue-900/30 rounded cursor-pointer hover:bg-blue-900/20 transition-all">
                               <FileText size={16} className="text-blue-500 shrink-0 mt-0.5" />
                               <div>
                                   <div className="text-xs font-bold text-blue-200">检修规程 SOP-04</div>
                                   <div className="text-[10px] text-slate-400 mt-1">查看详细拆解步骤与扭矩要求</div>
                               </div>
                           </div>
                       </>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-center gap-2">
                           <GitCommit size={24} className="opacity-20" />
                           <span className="text-xs">请选择底事件 (Basic Event) <br/>以查看具体处置方案</span>
                       </div>
                   )}

                   <div className="mt-auto p-3 bg-slate-900/50 border border-slate-800 rounded">
                       <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                           <span className="flex items-center gap-1"><Thermometer size={10}/> Oil Temp</span>
                           <span className="text-white font-mono">45°C</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] text-slate-500">
                           <span className="flex items-center gap-1"><Droplets size={10}/> Pressure</span>
                           <span className="text-amber-400 font-mono">14.2 MPa</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
