
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Leaf, Droplets, Scale, FileText, 
  AlertOctagon, CheckCircle2, Activity, 
  Search, GitBranch, Fish, Waves,
  Network, ArrowRight, ShieldCheck, Thermometer,
  Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---

const COMPLIANCE_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    flow: 120 + Math.sin(i * 0.3) * 40 + Math.random() * 10,
    target: i > 8 && i < 18 ? 150 : 100, // Higher target during day (e.g., specific biological req)
    temp: 18 + Math.sin(i * 0.1) * 2
}));

const HEALTH_METRICS = [
  { subject: '流量达标率', A: 98, fullMark: 100 },
  { subject: '流速适宜度', A: 85, fullMark: 100 },
  { subject: '水温波动', A: 92, fullMark: 100 },
  { subject: 'DO含量', A: 88, fullMark: 100 },
  { subject: '连通性', A: 100, fullMark: 100 },
  { subject: '生境完整性', A: 75, fullMark: 100 },
];

const VIOLATION_LOGS = [
    { time: '14:32:05', section: '断面 A-03', type: 'Flow', msg: '瞬时流量低于生态基流阈值 (95%)', status: 'Resolved' },
    { time: '12:15:22', section: '增殖站 B', type: 'Temp', msg: '水温温升速率 > 2°C/h', status: 'Warning' },
    { time: '09:48:10', section: '大坝出口', type: 'Data', msg: '遥测数据丢包', status: 'Resolved' },
];

const KNOWLEDGE_NODES = [
    { id: 'REG-01', label: '长江保护法', type: 'law', x: 100, y: 50 },
    { id: 'REG-02', label: '取水许可', type: 'rule', x: 250, y: 50 },
    { id: 'SEC-A', label: '监测断面 A', type: 'station', x: 100, y: 200, status: 'ok' },
    { id: 'SEC-B', label: '监测断面 B', type: 'station', x: 400, y: 200, status: 'warning' },
    { id: 'DAM-X', label: 'X水电站', type: 'object', x: 250, y: 200, status: 'ok' },
    { id: 'BIO-1', label: '中华鲟产卵场', type: 'bio', x: 550, y: 150 },
    { id: 'BIO-2', label: '四大家鱼洄游', type: 'bio', x: 550, y: 250 },
];

const KNOWLEDGE_LINKS = [
    { from: 'REG-01', to: 'SEC-A' },
    { from: 'REG-01', to: 'SEC-B' },
    { from: 'REG-02', to: 'DAM-X' },
    { from: 'DAM-X', to: 'SEC-A', dashed: true },
    { from: 'DAM-X', to: 'SEC-B', dashed: true },
    { from: 'SEC-B', to: 'BIO-1' },
    { from: 'SEC-B', to: 'BIO-2' },
];

// --- COMPONENTS ---

const KnowledgeGraphSVG = () => {
    return (
        <div className="w-full h-full relative bg-[#050b14] rounded-lg overflow-hidden border border-emerald-900/30">
            <svg className="w-full h-full absolute inset-0">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
                    </marker>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Connections */}
                {KNOWLEDGE_LINKS.map((link, i) => {
                    const start = KNOWLEDGE_NODES.find(n => n.id === link.from);
                    const end = KNOWLEDGE_NODES.find(n => n.id === link.to);
                    if (!start || !end) return null;
                    return (
                        <g key={i}>
                            <line 
                                x1={start.x} y1={start.y} 
                                x2={end.x} y2={end.y} 
                                stroke="#1e293b" 
                                strokeWidth="2" 
                                strokeDasharray={link.dashed ? "5 5" : ""}
                                markerEnd="url(#arrow)"
                            />
                            {/* Data Flow Particle */}
                            <circle r="3" fill="#34d399">
                                <animateMotion 
                                    dur={`${2 + Math.random() * 2}s`} 
                                    repeatCount="indefinite"
                                    path={`M${start.x},${start.y} L${end.x},${end.y}`}
                                />
                            </circle>
                        </g>
                    );
                })}

                {/* Nodes */}
                {KNOWLEDGE_NODES.map((node) => (
                    <g key={node.id} className="cursor-pointer group hover:opacity-100 transition-opacity">
                        {/* Glow effect */}
                        <circle cx={node.x} cy={node.y} r="35" fill="url(#nodeGlow)" className="animate-pulse" />
                        
                        {/* Node Body */}
                        <circle 
                            cx={node.x} cy={node.y} r="20" 
                            fill="#0f172a" 
                            stroke={
                                node.type === 'law' ? '#ef4444' : 
                                node.type === 'station' ? (node.status === 'ok' ? '#10b981' : '#f59e0b') :
                                node.type === 'bio' ? '#0ea5e9' : '#64748b'
                            } 
                            strokeWidth="2" 
                        />
                        
                        {/* Icon */}
                        <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                            <div className="flex items-center justify-center w-full h-full text-white">
                                {node.type === 'law' && <Scale size={14} className="text-red-400"/>}
                                {node.type === 'rule' && <FileText size={14} className="text-slate-400"/>}
                                {node.type === 'station' && <Activity size={14} className={node.status === 'ok' ? 'text-green-400' : 'text-yellow-400'}/>}
                                {node.type === 'object' && <Settings size={14} className="text-slate-400"/>}
                                {node.type === 'bio' && <Fish size={14} className="text-cyan-400"/>}
                            </div>
                        </foreignObject>

                        {/* Label */}
                        <text x={node.x} y={node.y + 35} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" className="group-hover:fill-white">
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>
            
            <div className="absolute top-4 right-4 bg-black/60 p-2 rounded border border-emerald-900 text-[10px] text-slate-400">
                <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full border border-red-500"></div> 法规/红线</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full border border-green-500"></div> 监测点 (正常)</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full border border-yellow-500"></div> 监测点 (预警)</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-cyan-500"></div> 生物目标</div>
            </div>
        </div>
    );
};

export const EcoFlowView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [complianceScore, setComplianceScore] = useState(98.5);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-emerald-50 bg-[#020408] p-2 relative overflow-hidden">
      
      {/* Organic Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_left,_#10b981_0%,_transparent_40%)]"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-emerald-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-900/20 border border-emerald-500 rounded flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
             <Leaf size={30} className="text-emerald-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 mb-0.5 uppercase tracking-[0.3em] font-black">
               <ShieldCheck size={12} /> Environmental Protection
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
               生态流量 <span className="text-emerald-500 italic">合规性知识图谱</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-10 items-center pr-4">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Compliance Score</div>
                <div className="text-3xl font-mono font-black text-white">{complianceScore}<span className="text-sm font-normal text-slate-600">%</span></div>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Stations</div>
                <div className="text-2xl font-mono font-black text-emerald-400">
                    24 <span className="text-sm font-normal text-slate-600">/ 24</span>
                </div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 z-10">
        
        {/* --- LEFT: Regulations & Standards --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="合规性约束体系" subtitle="REGULATIONS" className="border-emerald-900/30 bg-[#061410]/80">
              <div className="space-y-4 pt-2">
                 <div className="p-3 bg-emerald-900/10 border border-emerald-800/30 rounded relative overflow-hidden group hover:bg-emerald-900/20 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                         <div className="text-xs font-bold text-white flex items-center gap-2">
                             <Scale size={14} className="text-emerald-500"/> 长江保护法
                         </div>
                         <span className="text-[9px] bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded border border-red-800">强约束</span>
                     </div>
                     <p className="text-[10px] text-slate-400 leading-relaxed">
                         第二十四条：...应当保障河湖生态流量，维持水生态系统结构和功能。
                     </p>
                 </div>
                 
                 <div className="p-3 bg-slate-900/40 border border-slate-700/50 rounded relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                         <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                             <FileText size={14} className="text-blue-400"/> 调度规程 2024
                         </div>
                         <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">操作级</span>
                     </div>
                     <div className="space-y-1">
                         <div className="flex justify-between text-[10px] text-slate-500">
                             <span>基流目标</span>
                             <span className="font-mono text-white">120 m³/s</span>
                         </div>
                         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-[80%]"></div>
                         </div>
                     </div>
                 </div>

                 <div className="p-3 bg-slate-900/40 border border-slate-700/50 rounded relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                         <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                             <Fish size={14} className="text-cyan-400"/> 繁殖期特别规定
                         </div>
                         <span className="text-[9px] bg-cyan-900/40 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">季节性</span>
                     </div>
                     <div className="text-[10px] text-slate-400 flex justify-between">
                         <span>生效时间:</span>
                         <span className="text-white">5月1日 - 6月30日</span>
                     </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="多维健康度雷达" subtitle="EHO" className="h-[250px] border-emerald-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={HEALTH_METRICS}>
                           <PolarGrid stroke="#064e3b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Score" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#061410', borderColor: '#10b981'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>
        </div>

        {/* --- CENTER: Knowledge Graph Visualization --- */}
        <div className="flex-1 flex flex-col gap-4 relative">
           
           <div className="flex-1 bg-[#050b10] border border-emerald-800/30 rounded-lg overflow-hidden relative shadow-2xl flex flex-col">
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                   <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-500/30">
                       <Network size={14} className="text-emerald-400" />
                       <span className="text-xs font-bold text-white">Semantic Knowledge Topology</span>
                   </div>
               </div>

               <div className="flex-1 p-4">
                   <KnowledgeGraphSVG />
               </div>

               {/* Bottom Controls */}
               <div className="h-16 bg-slate-900/80 border-t border-slate-800 flex items-center px-6 justify-between backdrop-blur">
                   <div className="flex gap-4">
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <GitBranch size={14} />
                           <span>关联实体: <span className="text-white font-mono">142</span></span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-400">
                           <FileText size={14} />
                           <span>法规条目: <span className="text-white font-mono">58</span></span>
                       </div>
                   </div>
                   
                   <div className="flex gap-2">
                       <button className="px-4 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs rounded transition-colors">
                           溯源分析
                       </button>
                       <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded transition-colors">
                           导出报告
                       </button>
                   </div>
               </div>
           </div>

        </div>

        {/* --- RIGHT: Real-time Monitor --- */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
           
           <SciFiCard title="实时流量过程线 (24H)" subtitle="DISCHARGE" className="h-[280px] border-emerald-900/30">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COMPLIANCE_TREND}>
                           <defs>
                               <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 250]} />
                           <Tooltip contentStyle={{backgroundColor: '#050b10', borderColor: '#10b981'}} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                           
                           <Area type="monotone" dataKey="flow" name="实测流量" stroke="#10b981" fill="url(#flowGrad)" strokeWidth={2} />
                           <Area type="step" dataKey="target" name="生态目标" stroke="#ef4444" fill="none" strokeDasharray="4 2" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           <SciFiCard title="环境因子监测" subtitle="SENSORS" className="border-slate-800">
               <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex flex-col items-center">
                       <Thermometer size={20} className="text-yellow-400 mb-1" />
                       <div className="text-[10px] text-slate-500 uppercase">Water Temp</div>
                       <div className="text-lg font-mono font-bold text-white">18.5 °C</div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex flex-col items-center">
                       <Droplets size={20} className="text-blue-400 mb-1" />
                       <div className="text-[10px] text-slate-500 uppercase">DO Level</div>
                       <div className="text-lg font-mono font-bold text-white">7.2 mg/L</div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex flex-col items-center">
                       <Waves size={20} className="text-cyan-400 mb-1" />
                       <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
                       <div className="text-lg font-mono font-bold text-white">1.2 m/s</div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex flex-col items-center">
                       <Activity size={20} className="text-green-400 mb-1" />
                       <div className="text-[10px] text-slate-500 uppercase">pH Value</div>
                       <div className="text-lg font-mono font-bold text-white">7.4</div>
                   </div>
               </div>
           </SciFiCard>

           <SciFiCard title="违规与预警日志" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar" style={{maxHeight: '150px'}}>
                   {VIOLATION_LOGS.map((log, i) => (
                       <div key={i} className="flex gap-3 p-2 bg-slate-900/30 rounded border border-slate-800/50 hover:border-slate-600 transition-colors">
                           <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.status === 'Warning' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-slate-300">{log.section}</span>
                                   <span className="text-[9px] font-mono text-slate-500">{log.time}</span>
                               </div>
                               <div className="text-[10px] text-slate-400 truncate" title={log.msg}>{log.msg}</div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
