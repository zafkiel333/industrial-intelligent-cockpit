
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Book, FileText, Anchor, Settings, 
  AlertTriangle, CheckSquare, Droplets, 
  Activity, ArrowDown, ArrowUp, Clock,
  Database, Info, ChevronRight, Download,
  PlayCircle, PauseCircle, RefreshCw,
  Wind
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line
} from 'recharts';

// --- Types ---
interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

interface ProcessStep {
  step: number;
  name: string;
  duration: string;
  keyPoints: string[];
  risks: string[];
}

// --- Mock Data ---

const LOCK_PROCESS: ProcessStep[] = [
  { 
    step: 1, 
    name: '进闸准备 (Preparation)', 
    duration: '5 min', 
    keyPoints: ['检查闸室水位', '确认阀门关闭状态', '开启进闸信号灯'], 
    risks: ['船舶冲撞闸门风险', '通信不畅'] 
  },
  { 
    step: 2, 
    name: '船舶进闸 (Entry)', 
    duration: '10-15 min', 
    keyPoints: ['引导船舶进入指定位置', '监控航速 (<1.5 m/s)', '核实船舶尺寸'], 
    risks: ['船舶擦碰闸墙', '超速进闸'] 
  },
  { 
    step: 3, 
    name: '系缆与安检 (Mooring)', 
    duration: '5 min', 
    keyPoints: ['确认系缆到位', '通知船员穿戴救生衣', '关闭闸门'], 
    risks: ['系缆滑脱', '人员落水'] 
  },
  { 
    step: 4, 
    name: '输水作业 (Filling/Emptying)', 
    duration: '12 min', 
    keyPoints: ['开启输水阀门', '监控水位变化率', '观察缆绳受力'], 
    risks: ['水流紊动过大', '船舶断缆漂移', '阀门气蚀振动'] 
  },
  { 
    step: 5, 
    name: '出闸作业 (Exit)', 
    duration: '8 min', 
    keyPoints: ['开启闸门', '解缆通知', '开启出闸信号灯'], 
    risks: ['闸门未全开碰撞', '尾流影响后续船舶'] 
  }
];

const FILLING_CURVE_DATA = Array.from({length: 20}, (_, i) => {
  // Sigmoid-like curve for filling
  const t = i;
  const level = 20 * (1 / (1 + Math.exp(-0.5 * (t - 10)))) + 5;
  return { time: t, level: level, flow: 100 * Math.exp(-0.1*Math.abs(t-10)) };
});

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  { id: 'KB-001', title: '人字门同步运行控制策略', category: 'Control', content: '双缸液压驱动系统的同步误差应控制在 20mm 以内。采用主从控制模式...', tags: ['Hydraulics', 'PLC'], lastUpdated: '2023-10-15' },
  { id: 'KB-002', title: '输水阀门气蚀防护规范', category: 'Hydraulics', content: '当阀门开度在 30%-60% 区间时，流速最大，易发生气蚀。建议快速通过该开度区间...', tags: ['Valves', 'Maintenance'], lastUpdated: '2023-11-02' },
  { id: 'KB-003', title: '枯水期通航调度规则', category: 'Operations', content: '当下游水位低于 3.5m 时，应实施单向放行管制，限制最大吃水...', tags: ['Dispatch', 'Rules'], lastUpdated: '2024-01-20' },
  { id: 'KB-004', title: '闸室浮式系船柱检修指南', category: 'Maintenance', content: '浮筒滚轮润滑周期为 30 天。检查导轨垂直度及卡阻情况...', tags: ['Mechanical'], lastUpdated: '2023-09-10' },
];

const SYSTEM_COMPONENTS = [
  { id: 'miter-gate', label: '人字闸门 (Miter Gate)', status: 'Normal' },
  { id: 'culvert-valve', label: '输水廊道阀门 (Valve)', status: 'Normal' },
  { id: 'hydraulics', label: '液压启闭机 (Hydraulics)', status: 'Maintenance' },
  { id: 'sensing', label: '水位传感系统 (Sensors)', status: 'Normal' },
];

// --- Sub-component: Lock Cross Section SVG ---
const LockCrossSection = ({ onSelectZone }: { onSelectZone: (zone: string) => void }) => {
  return (
    <div className="relative w-full h-full bg-[#0f172a] rounded overflow-hidden select-none group">
        {/* Sky/Background - Explicit z-index 0 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a] z-0"></div>
        
        {/* SVG - Explicit z-index 10 to sit above background */}
        <svg viewBox="0 0 800 300" className="w-full h-full relative z-10">
            <defs>
                <linearGradient id="sl_waterGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9"/>
                </linearGradient>
                <pattern id="sl_concretePattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#334155"/>
                    <path d="M0 0L20 20M10 0L30 20M-10 0L10 20" stroke="#475569" strokeWidth="1"/>
                </pattern>
            </defs>

            {/* Structure: Upper Head */}
            <path d="M0,200 L150,200 L150,100 L200,100 L200,280 L0,280 Z" fill="url(#sl_concretePattern)" stroke="#64748b" />
            
            {/* Structure: Chamber Floor */}
            <rect x="200" y="250" width="400" height="30" fill="url(#sl_concretePattern)" stroke="#64748b" />
            
            {/* Structure: Lower Head */}
            <path d="M600,280 L600,150 L650,150 L650,280 L800,280 L800,300 L600,300 Z" fill="url(#sl_concretePattern)" stroke="#64748b" />

            {/* Water: Upper Bay */}
            <path d="M0,120 L150,120 L150,200 L0,200 Z" fill="url(#sl_waterGradient)" className="animate-pulse" style={{animationDuration: '3s'}} />
            
            {/* Water: Chamber (Variable Level) */}
            <path d="M200,180 L600,180 L600,250 L200,250 Z" fill="url(#sl_waterGradient)" className="opacity-80 transition-all duration-1000" />
            
            {/* Water: Lower Bay */}
            <path d="M650,220 L800,220 L800,280 L650,280 Z" fill="url(#sl_waterGradient)" />

            {/* Gates */}
            <g onClick={() => onSelectZone('UpperGate')} className="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="180" y="80" width="20" height="140" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                <text x="160" y="70" fill="#f59e0b" fontSize="12" fontWeight="bold">上闸首</text>
            </g>
            
            <g onClick={() => onSelectZone('LowerGate')} className="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="600" y="130" width="20" height="140" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                <text x="630" y="120" fill="#f59e0b" fontSize="12" fontWeight="bold">下闸首</text>
            </g>

            {/* Chamber Zone Clickable */}
            <rect x="220" y="100" width="360" height="150" fill="transparent" className="cursor-pointer" onClick={() => onSelectZone('Chamber')} />
            <text x="400" y="140" fill="rgba(255,255,255,0.3)" fontSize="24" fontWeight="bold" textAnchor="middle" pointerEvents="none">闸 室 (CHAMBER)</text>

            {/* Ship Placeholder */}
            <g className="transition-transform duration-1000">
               <path d="M300,170 L500,170 L480,200 L320,200 Z" fill="#475569" stroke="#94a3b8" />
               <rect x="330" y="150" width="40" height="20" fill="#cbd5e1" />
            </g>
        </svg>

        {/* Overlay Legend - Explicit z-index 20 */}
        <div className="absolute bottom-2 left-2 flex gap-4 text-[10px] text-slate-400 bg-black/50 p-1 rounded z-20">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-sky-600"></div> Water Body</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500"></div> Miter Gate</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-600"></div> Structure</div>
        </div>
    </div>
  );
};

export const ShipLockKbView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('process');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter KB articles based on search
  const filteredArticles = KNOWLEDGE_ARTICLES.filter(a => 
    a.title.includes(searchTerm) || a.tags.some(t => t.includes(searchTerm))
  );

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#082f49] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Database size={14} /> Industrial Knowledge Base
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船闸运行工况 <span className="text-cyan-500">数字图谱</span>
          </h1>
        </div>
        
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder="搜索工况、故障代码或SOP..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder:text-slate-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Visual Index & Components */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Visual Schematic (The "Map") */}
           <SciFiCard title="船闸结构剖面索引" subtitle="INTERACTIVE" className="h-[280px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-1">
                 <LockCrossSection onSelectZone={(z) => { setSelectedZone(z); setActiveTab('knowledge'); }} />
              </div>
           </SciFiCard>

           {/* Component Status List */}
           <SciFiCard title="关键组件档案" subtitle="ASSETS" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-3">
                 {SYSTEM_COMPONENTS.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors group cursor-pointer"
                         onClick={() => { setSelectedZone(comp.label); setActiveTab('knowledge'); }}>
                       <div className="flex items-center gap-3">
                          <Settings size={16} className="text-slate-500 group-hover:text-cyan-400" />
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white">{comp.label}</span>
                       </div>
                       <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${comp.status === 'Normal' ? 'bg-green-900/20 text-green-400' : 'bg-orange-900/20 text-orange-400'}`}>
                          {comp.status}
                       </span>
                    </div>
                 ))}
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Content Viewer */}
        <div className="flex-1 flex flex-col bg-[#0b1221]/50 border border-slate-800/60 rounded-lg overflow-hidden">
           
           {/* Tabs */}
           <div className="flex border-b border-slate-700 bg-slate-900/50">
              <button 
                onClick={() => setActiveTab('process')}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'process' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                 <Activity size={16} /> 运行流程 SOP
              </button>
              <button 
                onClick={() => setActiveTab('knowledge')}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'knowledge' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                 <Book size={16} /> 知识库文档
              </button>
              <button 
                onClick={() => setActiveTab('hydraulics')}
                className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'hydraulics' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                 <Droplets size={16} /> 水力特性库
              </button>
           </div>

           {/* Tab Content Area */}
           <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
              
              {/* TAB 1: PROCESS */}
              {activeTab === 'process' && (
                 <div className="space-y-8 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-700"></div>
                    {LOCK_PROCESS.map((step) => (
                       <div key={step.step} className="relative pl-12 group">
                          {/* Timeline Node */}
                          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-600/50 flex items-center justify-center z-10 text-cyan-400 font-bold shadow-[0_0_10px_rgba(8,145,178,0.2)]">
                             {step.step}
                          </div>
                          
                          {/* Card */}
                          <div className="bg-slate-900/40 border border-slate-700/60 rounded p-4 hover:border-cyan-500/40 transition-all">
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                      {step.name} 
                                      <span className="text-xs font-normal text-slate-500 border border-slate-700 px-2 rounded flex items-center gap-1">
                                         <Clock size={10} /> {step.duration}
                                      </span>
                                   </h3>
                                </div>
                                <button className="text-xs text-cyan-500 hover:text-cyan-300 flex items-center gap-1">
                                   <FileText size={12} /> SOP 详情
                                </button>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/30 p-3 rounded">
                                   <div className="text-xs text-slate-400 uppercase font-bold mb-2 flex items-center gap-1"><CheckSquare size={12} /> 关键操作 Key Actions</div>
                                   <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                      {step.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                                   </ul>
                                </div>
                                <div className="bg-red-900/10 border border-red-900/30 p-3 rounded">
                                   <div className="text-xs text-red-400 uppercase font-bold mb-2 flex items-center gap-1"><AlertTriangle size={12} /> 风险提示 Risks</div>
                                   <ul className="list-disc list-inside text-sm text-red-200/80 space-y-1">
                                      {step.risks.map((pt, i) => <li key={i}>{pt}</li>)}
                                   </ul>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}

              {/* TAB 2: KNOWLEDGE DOCS */}
              {activeTab === 'knowledge' && (
                 <div className="space-y-4">
                    {selectedZone && (
                       <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded flex items-center justify-between mb-4">
                          <span className="text-cyan-300 text-sm">筛选上下文: <strong>{selectedZone}</strong></span>
                          <button onClick={() => setSelectedZone(null)} className="text-xs text-slate-400 hover:text-white">清除筛选</button>
                       </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                       {filteredArticles.map(article => (
                          <div key={article.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded hover:bg-slate-800/60 transition-colors cursor-pointer group">
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                   <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{article.category}</span>
                                   <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{article.title}</h3>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{article.lastUpdated}</span>
                             </div>
                             <p className="text-sm text-slate-400 line-clamp-2 mb-3">{article.content}</p>
                             <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                   {article.tags.map(tag => (
                                      <span key={tag} className="text-[10px] text-slate-500">#{tag}</span>
                                   ))}
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-500" />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* TAB 3: HYDRAULICS */}
              {activeTab === 'hydraulics' && (
                 <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900/40 p-4 rounded border border-slate-800">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><ArrowDown size={14} /> 灌水特性 Filling Curve</h4>
                          <div className="h-40 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FILLING_CURVE_DATA}>
                                   <defs>
                                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                      </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                   <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                                   <YAxis stroke="#666" tick={{fontSize: 10}} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                                   <Area type="monotone" dataKey="level" stroke="#0ea5e9" fill="url(#colorLevel)" />
                                </AreaChart>
                             </ResponsiveContainer>
                          </div>
                       </div>
                       <div className="bg-slate-900/40 p-4 rounded border border-slate-800">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Wind size={14} /> 流量与缆绳力 Flow Forces</h4>
                          <div className="h-40 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={FILLING_CURVE_DATA}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                   <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                                   <YAxis stroke="#666" tick={{fontSize: 10}} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#f59e0b'}} />
                                   <Line type="monotone" dataKey="flow" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                   <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" label={{value: 'Max Limit', fill: 'red', fontSize: 10}} />
                                </LineChart>
                             </ResponsiveContainer>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-900/40 p-4 rounded border border-slate-800">
                       <h4 className="text-sm font-bold text-white mb-3">水力学计算工具</h4>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] text-slate-500 uppercase">当前水头 (m)</label>
                             <input type="text" value="12.5" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono" readOnly />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] text-slate-500 uppercase">阀门开启时间 (min)</label>
                             <input type="text" value="4.0" className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono" readOnly />
                          </div>
                          <div className="flex items-end">
                             <button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-2 rounded transition-colors">重新计算能耗</button>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

           </div>
        </div>

      </div>
    </div>
  );
};
