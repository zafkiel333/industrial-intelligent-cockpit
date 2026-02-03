
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Network, Activity, Zap, Wind, Droplets, 
  GitMerge, GitPullRequest, AlertOctagon, 
  Share2, Search, Cpu, Anchor, ArrowRight,
  TrendingUp, Layers, Link, Unlink, RefreshCw,
  BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

interface SystemNode {
  id: string;
  name: string;
  type: 'Source' | 'Process' | 'Control' | 'Output';
  status: 'Normal' | 'Warning' | 'Critical';
  load: number; // 0-100%
  x: number;
  y: number;
  connections: string[];
}

interface CorrelationData {
  time: string;
  gridFreq: number; // Grid System
  turbineSpeed: number; // Mechanical System
  fuelValve: number; // Hydraulic System
  powerOut: number; // Electrical System
}

interface PropagationStep {
  id: string;
  system: string;
  event: string;
  timeOffset: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  delay: string;
}

// --- Mock Data ---

const SYSTEM_NODES: SystemNode[] = [
  { id: 'GRID', name: '外部电网 (Grid)', type: 'Output', status: 'Warning', load: 92, x: 80, y: 50, connections: [] },
  { id: 'GEN', name: '发电机 (Generator)', type: 'Process', status: 'Normal', load: 85, x: 60, y: 50, connections: ['GRID'] },
  { id: 'GT', name: '燃气轮机 (Gas Turbine)', type: 'Process', status: 'Critical', load: 88, x: 40, y: 50, connections: ['GEN'] },
  { id: 'FUEL', name: '燃料供给 (Fuel Gas)', type: 'Source', status: 'Normal', load: 60, x: 20, y: 30, connections: ['GT'] },
  { id: 'AIR', name: '进气系统 (Air Intake)', type: 'Source', status: 'Normal', load: 45, x: 20, y: 70, connections: ['GT'] },
  { id: 'CTRL', name: 'TCS 控制系统', type: 'Control', status: 'Warning', load: 50, x: 40, y: 80, connections: ['GT', 'FUEL'] },
];

const PROPAGATION_CHAIN: PropagationStep[] = [
  { id: 'EVT-1', system: 'GRID', event: '电网频率瞬时跌落 (Frequency Dip)', timeOffset: 'T-0s', impact: 'High', delay: '0ms' },
  { id: 'EVT-2', system: 'CTRL', event: '一次调频动作 (PFR Active)', timeOffset: 'T+0.2s', impact: 'Medium', delay: '+200ms' },
  { id: 'EVT-3', system: 'FUEL', event: '燃料阀开度激增 (Valve Open)', timeOffset: 'T+0.5s', impact: 'High', delay: '+300ms' },
  { id: 'EVT-4', system: 'GT', event: '燃烧室压力脉动 (Combustion Oscillation)', timeOffset: 'T+1.2s', impact: 'Critical', delay: '+700ms' },
  { id: 'EVT-5', system: 'GEN', event: '有功功率震荡 (Power Swing)', timeOffset: 'T+2.5s', impact: 'High', delay: '+1.3s' },
];

const EXPERT_PANEL = [
  { name: 'Dr. Zhang', role: 'Grid Stability', status: 'Online', color: '#8b5cf6' },
  { name: 'Mike Chen', role: 'Combustion', status: 'Typing...', color: '#ef4444' },
  { name: 'Sarah Li', role: 'Control Logic', status: 'Online', color: '#10b981' },
];

// --- Components ---

const SystemTopologyMap = ({ activeNode, onSelect }: { activeNode: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#05060b] rounded overflow-hidden select-none group border border-slate-800">
      {/* Background Circuit Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      
      <svg className="w-full h-full absolute inset-0">
         <defs>
            <filter id="glow-node">
               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
               <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="arrow-flow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
            </marker>
         </defs>

         {/* Connections */}
         {SYSTEM_NODES.map(node => 
            node.connections.map(targetId => {
               const target = SYSTEM_NODES.find(n => n.id === targetId);
               if (!target) return null;
               
               // Determine link color based on status
               const isCriticalPath = (node.status === 'Critical' || node.status === 'Warning') && (target.status === 'Critical' || target.status === 'Warning');
               
               return (
                  <g key={`${node.id}-${target.id}`}>
                     <line 
                       x1={`${node.x}%`} y1={`${node.y}%`} 
                       x2={`${target.x}%`} y2={`${target.y}%`} 
                       stroke={isCriticalPath ? '#ef4444' : '#334155'} 
                       strokeWidth={isCriticalPath ? 2 : 1}
                       strokeDasharray={isCriticalPath ? '5 2' : ''}
                       className={isCriticalPath ? 'animate-pulse' : ''}
                       markerEnd="url(#arrow-flow)"
                     />
                     {isCriticalPath && (
                         <circle r="3" fill="#ef4444">
                             <animateMotion dur="1s" repeatCount="indefinite" path={`M${node.x * 10},${node.y * 5} L${target.x * 10},${target.y * 5}`} /> {/* Simplified path for demo */}
                         </circle>
                     )}
                  </g>
               );
            })
         )}

         {/* Nodes */}
         {SYSTEM_NODES.map(node => {
            const isActive = activeNode === node.id;
            const color = node.status === 'Critical' ? '#ef4444' : node.status === 'Warning' ? '#f59e0b' : '#10b981';
            
            return (
               <g 
                 key={node.id} 
                 onClick={() => onSelect(node.id)}
                 className="cursor-pointer transition-all duration-300"
                 style={{transformOrigin: `${node.x}% ${node.y}%`}}
               >
                  <circle 
                    cx={`${node.x}%`} cy={`${node.y}%`} 
                    r={isActive ? 25 : 18} 
                    fill="#0f172a" 
                    stroke={color} 
                    strokeWidth={isActive ? 3 : 2}
                    filter={isActive || node.status === 'Critical' ? 'url(#glow-node)' : ''}
                    className="transition-all duration-300"
                  />
                  
                  {/* Icon */}
                  <foreignObject x={`${node.x - 2}%`} y={`${node.y - 3.5}%`} width="4%" height="7%">
                      <div className={`w-full h-full flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                          {node.id === 'GRID' ? <Activity size={18}/> : 
                           node.id === 'GEN' ? <Zap size={18}/> :
                           node.id === 'FUEL' ? <Droplets size={18}/> :
                           node.id === 'AIR' ? <Wind size={18}/> :
                           node.id === 'CTRL' ? <Cpu size={18}/> : <RefreshCw size={18}/>}
                      </div>
                  </foreignObject>

                  {/* Label */}
                  <text 
                    x={`${node.x}%`} y={`${node.y + 12}%`} 
                    textAnchor="middle" 
                    fill={isActive ? '#fff' : '#94a3b8'} 
                    fontSize="10" 
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.name}
                  </text>
                  
                  {/* Load Badge */}
                  {isActive && (
                      <text x={`${node.x}%`} y={`${node.y - 8}%`} textAnchor="middle" fill={color} fontSize="9" fontWeight="mono">
                          Load: {node.load}%
                      </text>
                  )}
               </g>
            );
         })}
      </svg>

      <div className="absolute top-4 left-4 p-2 bg-black/60 rounded border border-slate-700 backdrop-blur">
          <div className="text-[10px] text-slate-400 font-bold mb-1">SYSTEM COUPLING STATUS</div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-mono animate-pulse">
              <Unlink size={12} /> Instability Detected
          </div>
      </div>
    </div>
  );
};

export const SystemFaultDiagnosisView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState('GT');
  const [timeRange, setTimeRange] = useState(0); // For animation
  const [trendData, setTrendData] = useState<CorrelationData[]>([]);

  // Simulate Multi-variable Data
  useEffect(() => {
    const data = Array.from({length: 60}, (_, i) => {
      const t = i / 10;
      // Grid frequency dip at t=3
      const freq = t < 3 ? 50 : 50 - 0.5 * Math.exp(-(t-3));
      // Valve opens to compensate
      const valve = t < 3.2 ? 60 : 60 + 25 * (1 - Math.exp(-(t-3.2))) * Math.cos((t-3.2)*2);
      // Speed oscillates
      const speed = 3000 + (50 - freq) * 10 + (Math.random()-0.5)*5;
      // Power swings
      const power = 300 + (valve - 60) * 2 * Math.sin(t*5);

      return {
        time: t.toFixed(1) + 's',
        gridFreq: freq,
        turbineSpeed: speed,
        fuelValve: valve,
        powerOut: power
      };
    });
    setTrendData(data);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200 bg-[#020204]">
      
      {/* 1. Header: System Nexus Command */}
      <div className="flex justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0d0b21] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Network size={14} /> System-of-Systems Diagnosis
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             系统级联动 <span className="text-indigo-500">故障诊断中心</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Coupling Coefficient</div>
                <div className="text-xl font-mono font-bold text-red-400">0.85 (High)</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Stability Index</div>
                <div className="text-xl font-mono font-bold text-yellow-500">62/100</div>
            </div>
            <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">
               <Share2 size={14} /> 发起多专家会诊
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Topology & Status */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 overflow-hidden">
           
           {/* Interactive Topology Map */}
           <SciFiCard title="系统交互拓扑 (System Interaction)" subtitle="LIVE MAP" className="flex-[2] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-2">
                   <SystemTopologyMap activeNode={selectedNode} onSelect={setSelectedNode} />
               </div>
           </SciFiCard>

           {/* Propagation Chain */}
           <SciFiCard title="故障传导链 (Propagation Chain)" subtitle="SEQUENCE" className="flex-1 border-slate-800">
               <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700 overflow-y-auto custom-scrollbar h-full pr-2">
                   {PROPAGATION_CHAIN.map((step, i) => (
                       <div key={step.id} className="relative group cursor-pointer hover:bg-slate-800/30 rounded p-1 transition-colors">
                           <div className={`absolute -left-[16px] top-2 w-2.5 h-2.5 rounded-full border-2 z-10 
                               ${step.impact === 'Critical' ? 'bg-red-500 border-red-300 animate-ping' : 
                                 step.impact === 'High' ? 'bg-orange-500 border-orange-300' : 'bg-blue-500 border-blue-300'}
                           `}></div>
                           
                           <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/20 px-1 rounded">{step.system}</span>
                               <span className="text-[10px] font-mono text-slate-500">{step.timeOffset}</span>
                           </div>
                           <div className="text-xs font-bold text-slate-200 mb-1">{step.event}</div>
                           <div className="flex justify-between text-[10px] text-slate-500">
                               <span>Lag: {step.delay}</span>
                               <span className={`${step.impact === 'Critical' ? 'text-red-400' : 'text-slate-400'}`}>{step.impact} Impact</span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>
        </div>

        {/* RIGHT COLUMN: Multi-Axis Analysis & Collaboration */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Multi-System Correlation Chart */}
           <SciFiCard title="多维参数联动分析" subtitle="CORRELATION" className="h-[320px] border-indigo-900/50 bg-[#080a12]" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center mb-2 px-2 text-xs">
                       <span className="text-slate-400">Correlating <strong className="text-white">Grid Freq</strong> vs <strong className="text-white">Combustion Pressure</strong></span>
                       <div className="flex gap-4">
                           <span className="text-purple-400 flex items-center gap-1"><div className="w-2 h-0.5 bg-purple-400"></div> Grid (Hz)</span>
                           <span className="text-cyan-400 flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-400"></div> Valve (%)</span>
                           <span className="text-red-400 flex items-center gap-1"><div className="w-2 h-0.5 bg-red-400"></div> Power (MW)</span>
                       </div>
                   </div>
                   
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={trendData} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={9} />
                               <YAxis yAxisId="left" stroke="#8b5cf6" tick={{fontSize: 10}} domain={[48, 52]} />
                               <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#333', fontSize: '12px'}} />
                               
                               <Area yAxisId="left" type="monotone" dataKey="gridFreq" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                               <Line yAxisId="right" type="step" dataKey="fuelValve" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                               <Line yAxisId="right" type="monotone" dataKey="powerOut" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                               
                               <ReferenceLine x="3.0s" stroke="#ef4444" label={{value: 'Event Trigger', fill: 'red', fontSize: 10, position: 'insideTopLeft'}} />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Analysis Panel Split */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[250px]">
               
               {/* Expert Chat / Hypothesis */}
               <SciFiCard title="专家会诊意见" subtitle="COLLABORATION" className="border-slate-800">
                   <div className="flex flex-col h-full gap-3">
                       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                               <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                   <span className="font-bold text-purple-400">Dr. Zhang (Grid)</span>
                                   <span>10:42:05</span>
                               </div>
                               <p className="text-xs text-slate-300">
                                   Grid frequency dip caused PFR logic to aggressively open fuel valves.
                               </p>
                           </div>
                           <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                               <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                   <span className="font-bold text-red-400">Mike Chen (Combustion)</span>
                                   <span>10:42:15</span>
                               </div>
                               <p className="text-xs text-slate-300">
                                   Confirmed. The rapid valve opening led to lean blowout followed by pressure surge.
                               </p>
                           </div>
                           <div className="bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                               <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                   <span className="font-bold text-indigo-300 flex items-center gap-1"><BrainCircuit size={10}/> AI Synthesis</span>
                               </div>
                               <p className="text-xs text-indigo-200">
                                   <strong>Root Cause:</strong> Grid-Turbine Control Loop Coupling Instability.
                                   <br/>Recommendation: Adjust PFR deadband to &gt;0.05Hz.
                               </p>
                           </div>
                       </div>
                       
                       <div className="flex gap-2">
                           <input type="text" placeholder="Add analysis..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 outline-none" />
                           <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs">Post</button>
                       </div>
                   </div>
               </SciFiCard>

               {/* Impact Matrix Radar */}
               <SciFiCard title="系统影响评估" subtitle="IMPACT MATRIX" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                               { subject: 'Grid Stability', A: 90, fullMark: 100 },
                               { subject: 'Mech Integrity', A: 85, fullMark: 100 },
                               { subject: 'Thermal Stress', A: 95, fullMark: 100 },
                               { subject: 'Emissions', A: 60, fullMark: 100 },
                               { subject: 'Efficiency', A: 70, fullMark: 100 },
                           ]}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Impact" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                               <Tooltip contentStyle={{backgroundColor: '#020408', borderColor: '#ef4444', color: '#fff'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                       <div className="text-center mt-[-10px] text-xs text-red-400 font-bold">
                           High Thermal Stress Impact
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
