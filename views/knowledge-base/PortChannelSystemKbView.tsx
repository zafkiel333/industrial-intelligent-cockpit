
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Search, Book, FileText, Anchor, Compass, 
  AlertTriangle, CheckSquare, Calculator, 
  Network, Map as MapIcon, ChevronRight, 
  ExternalLink, Globe, Shield, Activity,
  Info, LayoutGrid, List
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// --- Types & Interfaces ---
interface SOPStep {
  id: number;
  title: string;
  desc: string;
  role: string;
}

interface Regulation {
  id: string;
  code: string;
  title: string;
  authority: string;
  year: string;
}

interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  desc: string;
  status?: 'active' | 'warning' | 'maintenance';
}

// --- Mock Data ---

const TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'vts', label: 'VTS 中心', x: 50, y: 15, desc: '船舶交通服务控制中心', status: 'active' },
  { id: 'radar', label: '雷达站 A', x: 20, y: 30, desc: '远程海面监视雷达', status: 'active' },
  { id: 'ais', label: 'AIS 基站', x: 80, y: 30, desc: '船舶自动识别系统基站', status: 'active' },
  { id: 'channel', label: '进港航道', x: 50, y: 50, desc: '主航行水道 (设计水深: -18m)', status: 'warning' },
  { id: 'berth', label: '集装箱泊位', x: 30, y: 75, desc: '码头作业操作区', status: 'active' },
  { id: 'anchorage', label: '外锚地', x: 70, y: 75, desc: '船舶候泊等待区', status: 'active' },
];

const SOP_DATA: SOPStep[] = [
  { id: 1, title: '抵港预报 (NOA)', desc: '船舶需提前24小时通过EDI提交抵港通知。', role: '船舶代理' },
  { id: 2, title: '进港交通核准', desc: 'VTS 核实泊位可用性及航道交通状况。', role: 'VTS 操作员' },
  { id: 3, title: '引航员登轮', desc: '引航员在指定引航站登船进行引航。', role: '引航员' },
  { id: 4, title: '航道航行', desc: '在VTS监控及拖轮护航下通过主航道。', role: '船长/引航员' },
  { id: 5, title: '靠泊作业', desc: '最终进近及系缆操作。', role: '系缆工' },
];

const REGULATIONS: Regulation[] = [
  { id: '1', code: 'IMO A.857(20)', title: 'VTS 船舶交通服务指南', authority: 'IMO', year: '1997' },
  { id: '2', code: 'ISO 28000', title: '供应链安全管理体系', authority: 'ISO', year: '2007' },
  { id: '3', code: 'PIANC WG 121', title: '港口进港航道设计规范', authority: 'PIANC', year: '2014' },
  { id: '4', code: 'Local Port Ord. 42', title: '危险货物装卸管理条例', authority: '港务局', year: '2023' },
];

const TRAFFIC_DATA = [
  { hour: '00', count: 12 }, { hour: '04', count: 8 }, 
  { hour: '08', count: 25 }, { hour: '12', count: 42 }, 
  { hour: '16', count: 38 }, { hour: '20', count: 20 },
];

// --- Sub-components ---

const TopologyMap: React.FC<{ activeNode: string | null, onNodeClick: (id: string) => void }> = ({ activeNode, onNodeClick }) => {
  return (
    <div className="relative w-full h-full bg-[#0a0f1e] rounded-lg overflow-hidden border border-slate-800 group">
      {/* Background Grid */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             opacity: 0.2
           }}>
      </div>
      
      {/* Decorative Coastline Abstract */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
         <path d="M0,60 Q30,55 50,80 T100,100" stroke="#0ea5e9" strokeWidth="2" fill="none" />
         <path d="M0,65 Q30,60 50,85 T100,105" stroke="#0ea5e9" strokeWidth="1" fill="none" strokeDasharray="5 5" />
      </svg>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
         <line x1="50%" y1="15%" x2="20%" y2="30%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="15%" x2="80%" y2="30%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="15%" x2="50%" y2="50%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="#334155" strokeWidth="1" />
         <line x1="50%" y1="50%" x2="70%" y2="75%" stroke="#334155" strokeWidth="1" />
      </svg>

      {/* Nodes */}
      {TOPOLOGY_NODES.map(node => (
        <div 
          key={node.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300
            ${activeNode === node.id ? 'scale-110 z-20' : 'hover:scale-105 z-10'}
          `}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onClick={() => onNodeClick(node.id)}
        >
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center border-2 backdrop-blur-sm
            ${node.status === 'active' ? 'border-cyan-500 bg-cyan-900/40 text-cyan-300' : 'border-orange-500 bg-orange-900/40 text-orange-300'}
            ${activeNode === node.id ? 'shadow-[0_0_20px_currentColor]' : ''}
          `}>
             <Network size={20} />
          </div>
          <div className={`mt-2 text-xs text-center font-bold px-2 py-1 rounded bg-black/60 border border-slate-700 whitespace-nowrap
             ${activeNode === node.id ? 'text-white border-cyan-500' : 'text-slate-400'}
          `}>
            {node.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PortChannelSystemKbView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNode, setSelectedNode] = useState<string | null>('vts');
  const [ukcCalc, setUkcCalc] = useState({ draft: 12.5, depth: 15.0, tide: 1.2, squat: 0.8 });

  const calculateUKC = () => {
    return (ukcCalc.depth + ukcCalc.tide - ukcCalc.draft - ukcCalc.squat).toFixed(2);
  };

  const activeNodeInfo = TOPOLOGY_NODES.find(n => n.id === selectedNode);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0f172a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Globe size={14} /> Knowledge Hub / 知识中心
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             港口与航道系统 <span className="text-cyan-500">知识图谱</span>
          </h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="搜索法规、系统或作业流程..." 
                className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder:text-slate-600"
              />
           </div>
           <button className="bg-cyan-900/30 border border-cyan-500/30 p-2 rounded hover:bg-cyan-800/50 transition-colors">
              <List size={20} className="text-cyan-400" />
           </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: System Taxonomy & Topology */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-1">
           
           {/* Navigation Tabs */}
           <div className="flex bg-slate-900/50 p-1 rounded border border-slate-800">
              {[
                { id: 'overview', label: '系统总览' }, 
                { id: 'infrastructure', label: '基础设施' }, 
                { id: 'operations', label: '运营操作' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all
                    ${activeTab === tab.id ? 'bg-cyan-950 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           {/* Interactive Topology Card */}
           <SciFiCard title="系统拓扑架构" subtitle="INTERACTIVE MAP" className="h-[300px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-2">
                 <TopologyMap activeNode={selectedNode} onNodeClick={setSelectedNode} />
              </div>
           </SciFiCard>

           {/* Selected Node Details */}
           {activeNodeInfo && (
             <div className="p-4 bg-slate-900/60 border border-slate-700 rounded animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-lg font-bold text-white">{activeNodeInfo.label}</h3>
                   <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${activeNodeInfo.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                      {activeNodeInfo.status === 'active' ? '正常运行' : '警告状态'}
                   </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">{activeNodeInfo.desc}</p>
                <div className="space-y-2">
                   <button className="w-full py-2 bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                      <FileText size={14} /> 查看技术档案
                   </button>
                   <button className="w-full py-2 bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                      <Activity size={14} /> 实时遥测数据
                   </button>
                </div>
             </div>
           )}

           {/* Quick Stats: Channel Traffic */}
           <SciFiCard title="航道交通密度 (24H)" className="border-slate-800">
              <div className="h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TRAFFIC_DATA}>
                       <defs>
                          <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                       <XAxis dataKey="hour" stroke="#666" tick={{fontSize: 10}} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                       <Area type="monotone" dataKey="count" stroke="#0ea5e9" fill="url(#trafficGradient)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Detailed Knowledge Modules */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Section 1: Standard Operating Procedures (SOP Flowchart) */}
           <SciFiCard title="标准作业程序 (SOP)" subtitle="VESSEL ENTRY PROCESS" className="border-cyan-900/50">
              <div className="relative">
                 {/* Connection Line */}
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-700"></div>
                 
                 <div className="space-y-6">
                    {SOP_DATA.map((step) => (
                       <div key={step.id} className="relative pl-12 group">
                          {/* Step Circle */}
                          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center z-10 group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors">
                             <span className="font-mono font-bold">{step.id}</span>
                          </div>
                          
                          {/* Card Content */}
                          <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded hover:bg-slate-800/50 transition-colors">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-white text-sm">{step.title}</h4>
                                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{step.role}</span>
                             </div>
                             <p className="text-xs text-slate-400">{step.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           {/* Section 2: Regulatory Library (Grid Layout) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SciFiCard title="法规与标准库" subtitle="REGULATIONS" className="border-cyan-900/50">
                 <div className="flex flex-col gap-2">
                    {REGULATIONS.map(reg => (
                       <div key={reg.id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-600/30 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                             <Book size={16} className="text-slate-500 group-hover:text-cyan-400" />
                             <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">{reg.code}</div>
                                <div className="text-xs text-slate-500">{reg.title}</div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] text-slate-400">{reg.authority}</div>
                             <div className="text-[10px] text-slate-600">{reg.year}</div>
                          </div>
                       </div>
                    ))}
                    <button className="mt-2 w-full py-2 text-xs text-cyan-500 hover:text-cyan-300 flex items-center justify-center gap-1 border border-dashed border-cyan-900/50 rounded hover:bg-cyan-900/10">
                       <ExternalLink size={12} /> 访问完整法规数据库
                    </button>
                 </div>
              </SciFiCard>

              {/* Section 3: Operational Tools (Calculator) */}
              <SciFiCard title="富余水深计算器 (UKC)" subtitle="TOOLKIT" className="border-cyan-900/50">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">船舶吃水 Draft (m)</label>
                          <input 
                             type="number" 
                             value={ukcCalc.draft}
                             onChange={(e) => setUkcCalc({...ukcCalc, draft: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">海图水深 Depth (m)</label>
                          <input 
                             type="number" 
                             value={ukcCalc.depth}
                             onChange={(e) => setUkcCalc({...ukcCalc, depth: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">潮汐高度 Tide (m)</label>
                          <input 
                             type="number" 
                             value={ukcCalc.tide}
                             onChange={(e) => setUkcCalc({...ukcCalc, tide: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase">下沉量估算 Squat (m)</label>
                          <input 
                             type="number" 
                             value={ukcCalc.squat}
                             onChange={(e) => setUkcCalc({...ukcCalc, squat: parseFloat(e.target.value)})}
                             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                          />
                       </div>
                    </div>
                    
                    <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded flex items-center justify-between">
                       <span className="text-xs text-cyan-200 font-bold flex items-center gap-2">
                          <Calculator size={14} /> 计算富余水深 (UKC)
                       </span>
                       <span className={`text-xl font-mono font-bold ${parseFloat(calculateUKC()) < 1.0 ? 'text-red-500' : 'text-green-400'}`}>
                          {calculateUKC()} m
                       </span>
                    </div>
                    <div className="text-[10px] text-slate-500 text-center">
                       *仅供估算参考，请遵循官方指南。
                    </div>
                 </div>
              </SciFiCard>
           </div>

           {/* Section 4: Case Archive (Grid) */}
           <SciFiCard title="典型案例档案" subtitle="LESSONS LEARNED" className="border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                    { id: 'C-2023-04', type: '事故 (Incident)', title: '14号浮标搁浅事件', tags: ['人为失误', '低潮位'] },
                    { id: 'C-2022-11', type: '优化 (Optimization)', title: 'VTS 扇区重新划分', tags: ['效率提升', '交通流'] },
                    { id: 'C-2021-08', type: '应急 (Emergency)', title: '溢油应急响应演练', tags: ['污染控制', '响应时间'] },
                 ].map((c, i) => (
                    <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                          <span className={`text-[10px] px-1.5 rounded ${c.type.includes('事故') ? 'bg-red-900/30 text-red-400' : c.type.includes('优化') ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                             {c.type.split(' ')[0]}
                          </span>
                       </div>
                       <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{c.title}</h4>
                       <div className="flex gap-1 flex-wrap">
                          {c.tags.map(t => (
                             <span key={t} className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{t}</span>
                          ))}
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
