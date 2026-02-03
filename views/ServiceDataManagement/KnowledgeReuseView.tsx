
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Treemap
} from 'recharts';
import { 
  BookOpen, Share2, Search, Network, FileText, 
  Lightbulb, Star, User, Clock, ArrowRight, 
  Database, Cpu, GitCommit, Sparkles, Filter
} from 'lucide-react';

export const KnowledgeReuseView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<string | null>('node-1');
  const [graphTick, setGraphTick] = useState(0);

  // --- Mock Data ---

  // 1. Knowledge Graph Nodes & Links
  const graphData = {
    nodes: [
      { id: 'node-1', type: 'ASSET', label: '液压泵站 H-204', x: 400, y: 300, r: 25 },
      { id: 'node-2', type: 'FAULT', label: '异常啸叫', x: 250, y: 200, r: 20 },
      { id: 'node-3', type: 'FAULT', label: '压力波动', x: 550, y: 200, r: 20 },
      { id: 'node-4', type: 'CAUSE', label: '吸油滤网堵塞', x: 150, y: 350, r: 18 },
      { id: 'node-5', type: 'CAUSE', label: '油液气蚀', x: 300, y: 450, r: 18 },
      { id: 'node-6', type: 'SOLUTION', label: '清洗/更换滤芯', x: 100, y: 500, r: 15 },
      { id: 'node-7', type: 'SOLUTION', label: '排气与补油', x: 400, y: 550, r: 15 },
      { id: 'node-8', type: 'DOC', label: '维护手册 V2.1', x: 600, y: 400, r: 22 },
      { id: 'node-9', type: 'CASE', label: '工单 #9982 记录', x: 500, y: 100, r: 18 },
    ],
    links: [
      { source: 'node-1', target: 'node-2', type: 'HAS_SYMPTOM' },
      { source: 'node-1', target: 'node-3', type: 'HAS_SYMPTOM' },
      { source: 'node-2', target: 'node-4', type: 'CAUSED_BY' },
      { source: 'node-2', target: 'node-5', type: 'CAUSED_BY' },
      { source: 'node-4', target: 'node-6', type: 'RESOLVED_BY' },
      { source: 'node-5', target: 'node-7', type: 'RESOLVED_BY' },
      { source: 'node-1', target: 'node-8', type: 'REF_DOC' },
      { source: 'node-9', target: 'node-2', type: 'INSTANCE_OF' },
    ]
  };

  // 2. Ingestion Stream
  const ingestionLog = [
    { id: 'KB-2024-001', type: 'Auto', source: '维修工单 #8821', status: 'Parsed', tags: ['电机', '过热'] },
    { id: 'KB-2024-002', type: 'Manual', source: '专家经验录入', status: 'Reviewing', tags: ['振动', '对中'] },
    { id: 'KB-2024-003', type: 'Auto', source: 'IoT 报警日志', status: 'Parsed', tags: ['阈值', '压力'] },
    { id: 'KB-2024-004', type: 'Import', source: '厂家 PDF 手册', status: 'Indexing', tags: ['结构', '原理'] },
  ];

  // 3. Reuse Stats
  const reuseTrend = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    queries: 1200 + Math.random() * 500,
    applied: 800 + Math.random() * 300,
    timeSaved: 400 + Math.random() * 150 // hours
  }));

  // 4. Expert Leaderboard
  const experts = [
    { name: '王总工', score: 980, cases: 45 },
    { name: '李高级技师', score: 850, cases: 32 },
    { name: '张工程师', score: 720, cases: 28 },
    { name: 'AI 挖掘引擎', score: 2400, cases: 156 },
  ];

  // Animation Loop for Graph
  useEffect(() => {
    const timer = setInterval(() => {
      setGraphTick(t => t + 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-indigo-50 bg-[#030014] p-2 overflow-hidden select-none">
      
      {/* Top: Knowledge Command Center */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950/60 via-purple-900/40 to-transparent border-b border-indigo-500/30 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-indigo-600/20 border border-indigo-500/50 rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.3)] animate-pulse">
              <BookOpen className="text-indigo-400" size={32} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">装备服务知识沉淀与复用管理平台</h1>
              <div className="flex items-center gap-6 mt-1 text-[10px] font-mono text-indigo-200/70 tracking-[0.2em]">
                 <span className="flex items-center gap-2"><Network size={12}/> KNOWLEDGE GRAPH: V4.2</span>
                 <span>|</span>
                 <span className="flex items-center gap-2"><Database size={12}/> ENTITIES: 142,500</span>
                 <span>|</span>
                 <span className="text-emerald-400 font-bold">REUSE RATE: 88.5%</span>
              </div>
           </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-12">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="输入故障现象、设备型号或备件代码进行语义检索..." 
                    className="w-full bg-black/40 border border-indigo-500/50 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-indigo-400/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <span className="text-[10px] bg-indigo-900/50 border border-indigo-700 px-2 py-0.5 rounded text-indigo-300">Semantic</span>
                    <span className="text-[10px] bg-indigo-900/50 border border-indigo-700 px-2 py-0.5 rounded text-indigo-300">Fuzzy</span>
                </div>
            </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-indigo-950/40 border border-indigo-800 rounded-lg text-right min-w-[120px]">
              <div className="text-[9px] text-indigo-400 uppercase font-bold">Time Saved (YTD)</div>
              <div className="text-xl font-mono font-black text-white">4,250 <span className="text-xs text-slate-500">h</span></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* Left: Ingestion & Classification */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Ingestion Stream */}
           <SciFiCard title="知识捕获流水线" subtitle="INGESTION STREAM" className="flex-1 bg-indigo-950/10 border-indigo-900/50">
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                 {ingestionLog.map((log, i) => (
                    <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-slate-500">{log.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                             log.type === 'Auto' ? 'bg-cyan-900/20 text-cyan-400' : 
                             log.type === 'Manual' ? 'bg-purple-900/20 text-purple-400' : 'bg-orange-900/20 text-orange-400'
                          }`}>{log.type}</span>
                       </div>
                       <div className="text-xs font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors flex items-center gap-2">
                          <FileText size={12} /> {log.source}
                       </div>
                       <div className="flex flex-wrap gap-1">
                          {log.tags.map(tag => (
                             <span key={tag} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">#{tag}</span>
                          ))}
                       </div>
                       <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${
                             log.status === 'Parsed' ? 'bg-green-500 w-full' : 
                             log.status === 'Indexing' ? 'bg-blue-500 w-2/3 animate-pulse' : 'bg-amber-500 w-1/3'
                          }`}></div>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded text-[10px] text-indigo-200 font-bold uppercase flex items-center justify-center gap-2 transition-all">
                 <GitCommit size={12} /> 手动录入新案例
              </button>
           </SciFiCard>

           {/* Knowledge Composition */}
           <SciFiCard title="知识资产构成" subtitle="TYPES">
              <div className="h-40 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={[
                            { name: '故障案例', value: 400, color: '#f472b6' }, 
                            { name: '维修方案', value: 300, color: '#818cf8' }, 
                            { name: '理论文档', value: 200, color: '#34d399' }, 
                            { name: '备件参数', value: 150, color: '#fbbf24' }
                          ]} 
                          innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                       >
                          {[
                            { color: '#f472b6' }, { color: '#818cf8' }, { color: '#34d399' }, { color: '#fbbf24' }
                          ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                       </Pie>
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-[-10px]">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-pink-400"></div> 故障案例 (40%)</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-400"></div> 维修方案 (30%)</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-400"></div> 理论文档 (20%)</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-400"></div> 备件参数 (15%)</div>
              </div>
           </SciFiCard>
        </div>

        {/* Center: Interactive Knowledge Graph */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-[#050410] border border-indigo-500/20 rounded-2xl relative overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.1)] group">
              {/* Background Grid */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                   style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
              
              {/* HUD */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md border border-indigo-500/30 p-3 rounded-lg flex items-center gap-3">
                    <Sparkles className="text-cyan-400" size={18} />
                    <div>
                       <div className="text-[10px] font-bold text-indigo-200 uppercase">Semantic Context</div>
                       <div className="text-xs font-mono text-white">Exploring: Hydraulic System Failure</div>
                    </div>
                 </div>
              </div>

              {/* SVG Graph */}
              <svg className="w-full h-full cursor-grab active:cursor-grabbing">
                 <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                       <path d="M0,0 L0,6 L9,3 z" fill="#4f46e5" />
                    </marker>
                    <filter id="glow">
                       <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                       <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                    </filter>
                 </defs>

                 {/* Links */}
                 {graphData.links.map((link, i) => {
                    const source = graphData.nodes.find(n => n.id === link.source)!;
                    const target = graphData.nodes.find(n => n.id === link.target)!;
                    return (
                       <g key={i}>
                          <line 
                             x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                             stroke="#312e81" strokeWidth="1" 
                          />
                          {/* Animated Packet */}
                          <circle r="3" fill="#06b6d4">
                             <animateMotion 
                                dur={`${2 + i%3}s`} 
                                repeatCount="indefinite"
                                path={`M${source.x},${source.y} L${target.x},${target.y}`}
                             />
                          </circle>
                          <text 
                             x={(source.x + target.x) / 2} 
                             y={(source.y + target.y) / 2} 
                             fill="#6366f1" fontSize="8" textAnchor="middle" dy="-5"
                             className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             {link.type}
                          </text>
                       </g>
                    );
                 })}

                 {/* Nodes */}
                 {graphData.nodes.map((node) => {
                    const isActive = activeNode === node.id;
                    const nodeColor = 
                       node.type === 'ASSET' ? '#3b82f6' : 
                       node.type === 'FAULT' ? '#ef4444' : 
                       node.type === 'CAUSE' ? '#f59e0b' : 
                       node.type === 'SOLUTION' ? '#10b981' : '#8b5cf6';
                    
                    return (
                       <g 
                          key={node.id} 
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={() => setActiveNode(node.id)}
                          className="cursor-pointer transition-all duration-300"
                          style={{filter: isActive ? 'url(#glow)' : 'none'}}
                       >
                          {/* Pulse Effect for Active */}
                          {isActive && (
                             <circle r={node.r * 1.5} fill="none" stroke={nodeColor} strokeWidth="1" opacity="0.5">
                                <animate attributeName="r" from={node.r} to={node.r * 2} dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                             </circle>
                          )}
                          
                          <circle r={node.r} fill="#0f172a" stroke={nodeColor} strokeWidth={isActive ? 3 : 1.5} />
                          <text y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" pointerEvents="none">
                             {node.type === 'ASSET' ? 'A' : node.type === 'FAULT' ? 'F' : node.type.charAt(0)}
                          </text>
                          <text y={node.r + 15} textAnchor="middle" fill={isActive ? '#fff' : '#94a3b8'} fontSize="10" fontWeight={isActive ? 'bold' : 'normal'} pointerEvents="none">
                             {node.label}
                          </text>
                       </g>
                    );
                 })}
              </svg>
              
              {/* Filter Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                 <button className="p-2 bg-slate-900/80 border border-slate-700 rounded text-slate-400 hover:text-white hover:border-cyan-500 transition-all">
                    <Filter size={16} />
                 </button>
                 <button className="p-2 bg-slate-900/80 border border-slate-700 rounded text-slate-400 hover:text-white hover:border-cyan-500 transition-all">
                    <Expand size={16} />
                 </button>
              </div>
           </div>

           {/* Node Detail Panel (Dynamic) */}
           <div className="h-36 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-2">
              <div className="flex-1">
                 <div className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-2">
                    <Cpu size={14} /> Selected Entity Analysis
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-black rounded-lg border border-slate-700 flex items-center justify-center">
                       <span className="text-2xl font-bold text-white">
                          {activeNode ? graphData.nodes.find(n => n.id === activeNode)?.type[0] : '-'}
                       </span>
                    </div>
                    <div>
                       <div className="text-lg font-bold text-white mb-1">
                          {activeNode ? graphData.nodes.find(n => n.id === activeNode)?.label : 'Select a node'}
                       </div>
                       <div className="text-xs text-slate-400 max-w-md">
                          关联知识点: 8 条 | 历史复用次数: 142 次 | 最后更新: 2024-05-18
                       </div>
                       <div className="flex gap-2 mt-2">
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded border border-indigo-800">High Confidence</span>
                          <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Verified by Expert</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="w-px h-full bg-slate-800"></div>
              
              <div className="w-1/3 flex flex-col justify-center">
                 <button className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded flex items-center justify-center gap-2 mb-2 transition-all">
                    <Share2 size={14} /> 推送至现场终端
                 </button>
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all">
                    <ArrowRight size={14} /> 查看原始文档
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Value & Impact */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           
           {/* Reuse Trend */}
           <SciFiCard title="知识复用效益分析" subtitle="VALUE" className="flex-1 border-indigo-900/50">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reuseTrend}>
                       <defs>
                          <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="timeSaved" stroke="#10b981" fill="url(#colorSaved)" strokeWidth={2} name="Hours Saved" />
                       <Line type="monotone" dataKey="queries" stroke="#3b82f6" dot={false} strokeWidth={1} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between px-2 mt-2 text-[10px] text-slate-400">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500"></div> 节省工时</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500"></div> 检索次数</span>
              </div>
           </SciFiCard>

           {/* Expert Leaderboard */}
           <SciFiCard title="专家贡献排行榜" subtitle="TOP CONTRIBUTORS" className="flex-1 border-indigo-900/50">
              <div className="space-y-3 pt-1">
                 {experts.map((exp, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                       }`}>
                          {i + 1}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between text-xs text-slate-200">
                             <span>{exp.name}</span>
                             <span className="text-indigo-300 font-mono">{exp.score} pts</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                             <div className="bg-indigo-500 h-full" style={{width: `${(exp.score/2500)*100}%`}}></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* AI Insight */}
           <SciFiCard title="AI 知识洞察" className="bg-indigo-900/10 border-indigo-800/20">
              <div className="flex gap-3 items-start">
                 <div className="mt-1"><Lightbulb className="text-yellow-400" size={16} /></div>
                 <div>
                    <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">知识图谱补全建议</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">
                       发现 "变频器过流" 故障节点缺少 "IGBT 模块检测" 的关联解决方案，建议根据最近 3 个维修案例进行补充。
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};

// Helper Icon
const Expand = ({size, className}: {size?:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
    </svg>
);
