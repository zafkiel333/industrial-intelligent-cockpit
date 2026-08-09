
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[kb-port-machinery]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/kb-port-machinery';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line
} from 'recharts';
import { 
  Search, Database, Anchor, Box, Settings, 
  Cpu, Zap, ChevronRight, FileText, Download,
  AlertTriangle, CheckCircle2, Wrench, Share2, Layers
} from 'lucide-react';

// Mock Data for Port Machinery Knowledge Base
const COMPONENT_CATEGORIES = [
  { id: 'sts-crane', label: '岸桥起重机 (STS)', icon: <Anchor />, color: '#f59e0b' },
  { id: 'rtg-crane', label: '场桥 (RTG/RMG)', icon: <Box />, color: '#ea580c' },
  { id: 'spreader', label: '吊具系统 (Spreader)', icon: <Settings />, color: '#d97706' },
  { id: 'agv', label: '自动导引车 (AGV)', icon: <Cpu />, color: '#8b5cf6' },
  { id: 'reach-stacker', label: '正面吊 (Reach Stacker)', icon: <Wrench />, color: '#10b981' },
];

const COMPONENT_DETAILS: Record<string, any> = {
  'sts-crane': {
    title: '主起升机构总成 (Main Hoist Assembly)',
    model: 'STS-H-2500-X',
    description: '岸桥核心动力单元，负责集装箱的垂直升降运动。集成双电机驱动、行星齿轮减速箱及冗余制动系统。',
    tags: ['Critical', 'Hoisting', 'Drive System'],
    specs: [
      { label: '额定起重量 (SWL)', value: '65 t (Twin-20)' },
      { label: '起升速度 (满载)', value: '90 m/min' },
      { label: '起升速度 (空载)', value: '180 m/min' },
      { label: '钢丝绳直径', value: '42 mm' },
      { label: '电机功率', value: '2 x 550 kW' },
      { label: '制动器类型', value: 'Hydraulic Disc' },
    ],
    maintenance: [
      { task: '钢丝绳探伤检测', interval: 'Monthly', status: 'Pending', criticality: 'High' },
      { task: '减速箱油液光谱分析', interval: '3 Months', status: 'OK', criticality: 'Medium' },
      { task: '制动器间隙调整', interval: 'Weekly', status: 'OK', criticality: 'High' },
      { task: '联轴器对中检查', interval: '6 Months', status: 'OK', criticality: 'Low' },
    ],
    performanceData: [
      { subject: '起升效率', A: 92, fullMark: 100 },
      { subject: '制动响应', A: 98, fullMark: 100 },
      { subject: '能耗指标', A: 85, fullMark: 100 },
      { subject: '噪音水平', A: 88, fullMark: 100 },
      { subject: '热稳定性', A: 90, fullMark: 100 },
      { subject: '抗冲击性', A: 95, fullMark: 100 },
    ],
    faultLibrary: [
      { code: 'E-302', title: '变频器过流保护', cause: '负载突变或电机绝缘老化', solution: '检查电机绝缘阻值，复位变频器参数。' },
      { code: 'M-105', title: '高速轴制动器抱死', cause: '液压站压力不足或电磁阀卡滞', solution: '清洗电磁阀，检查液压泵站输出压力。' },
      { code: 'S-004', title: '钢丝绳乱绳检测', cause: '排绳器故障或吊具着箱倾角过大', solution: '人工重新理绳，校准排绳器限位。' },
    ],
    documents: [
      { name: 'STS-H-2500 Maintenance Manual.pdf', size: '12.4 MB' },
      { name: 'Electrical Schematic V2.0.dwg', size: '4.8 MB' },
      { name: 'Spare Parts Catalog 2024.xlsx', size: '2.1 MB' },
    ]
  },
  'rtg-crane': {
    title: '柴油发电机组动力包 (Power Pack)',
    model: 'RTG-PP-Volvo-700',
    description: 'RTG场桥的主动力来源，提供行走、起升及小车机构所需的电力。配备智能节能控制系统。',
    tags: ['Power', 'Engine', 'Generator'],
    specs: [
      { label: '发动机型号', value: 'Volvo TAD1643GE' },
      { label: '发电机功率', value: '650 kVA' },
      { label: '燃油消耗率', value: '198 g/kWh' },
      { label: '排放标准', value: 'Tier 3' },
      { label: '冷却方式', value: 'Water Cooled' },
    ],
    maintenance: [
      { task: '机油/机滤更换', interval: '500 Hrs', status: 'OK', criticality: 'High' },
      { task: '气门间隙调整', interval: '2000 Hrs', status: 'Pending', criticality: 'Medium' },
    ],
    performanceData: [
      { subject: '燃油效率', A: 90, fullMark: 100 },
      { subject: '负载响应', A: 85, fullMark: 100 },
      { subject: '电压稳定', A: 95, fullMark: 100 },
      { subject: '冷启动性', A: 88, fullMark: 100 },
      { subject: '排放合规', A: 92, fullMark: 100 },
      { subject: '振动水平', A: 80, fullMark: 100 },
    ],
    faultLibrary: [
      { code: 'P-201', title: '冷却液温度过高', cause: '散热器堵塞或风扇故障', solution: '清理散热器翅片，检查风扇皮带张力。' },
      { code: 'G-102', title: '励磁电压异常', cause: 'AVR模块故障', solution: '更换AVR模块，检查碳刷磨损情况。' },
    ],
    documents: [
      { name: 'Engine Service Manual.pdf', size: '45 MB' },
      { name: 'Alternator Wiring Diagram.pdf', size: '1.2 MB' },
    ]
  }
};

// Fallback
const DEFAULT_DATA = COMPONENT_DETAILS['sts-crane'];

export const PortMachineryKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('sts-crane');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = COMPONENT_DETAILS[activeCategory] || DEFAULT_DATA;
  const activeColor = COMPONENT_CATEGORIES.find(c => c.id === activeCategory)?.color || '#f59e0b';

  // Mock Reliability Trend
  const reliabilityData = [
    { month: 'Jan', rate: 98.2 }, { month: 'Feb', rate: 98.5 },
    { month: 'Mar', rate: 97.8 }, { month: 'Apr', rate: 99.1 },
    { month: 'May', rate: 98.9 }, { month: 'Jun', rate: 99.3 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-orange-900/50 pb-4 bg-gradient-to-r from-[#1a1000] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Database size={14} /> Industrial Asset Library / 工业资产库
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             港口机械部件 <span className="text-orange-500">智能知识库</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-end">
            <div className="text-right hidden md:block">
                <div className="text-xs text-slate-500 uppercase">Knowledge Entities</div>
                <div className="text-xl font-mono text-white">2,845</div>
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="Search components, manuals, or error codes..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors text-slate-200 placeholder:text-slate-600"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDEBAR: Navigation */}
        <div className="w-full lg:w-64 flex flex-col gap-2 overflow-y-auto pr-2">
           <div className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Equipment Types</div>
           {COMPONENT_CATEGORIES.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`group flex items-center gap-3 p-3 rounded-sm border-l-2 transition-all duration-300 text-left
                 ${activeCategory === cat.id 
                   ? 'bg-gradient-to-r from-orange-950/40 to-transparent border-orange-500 text-white' 
                   : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}
               `}
             >
               <div className={`${activeCategory === cat.id ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                 {cat.icon}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-sm leading-tight">{cat.label.split('(')[0]}</div>
                 <div className="text-[10px] opacity-60 uppercase">{cat.label.split('(')[1]?.replace(')', '')}</div>
               </div>
               {activeCategory === cat.id && <ChevronRight size={14} className="text-orange-500" />}
             </button>
           ))}

           {/* Filter/Tags Mock */}
           <div className="mt-6 pl-1">
               <div className="text-xs font-bold text-slate-500 uppercase mb-2">Filter by System</div>
               <div className="flex flex-wrap gap-2">
                   {['Hydraulic', 'Electrical', 'Mechanical', 'Structural', 'Control'].map(tag => (
                       <span key={tag} className="text-[10px] px-2 py-1 bg-slate-800 rounded text-slate-400 hover:bg-slate-700 cursor-pointer border border-slate-700">
                           {tag}
                       </span>
                   ))}
               </div>
           </div>
        </div>

        {/* CENTER AREA: Main Knowledge Content */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-900 scrollbar-track-transparent">
           
           {/* Header Card: Model & 3D */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
              
              {/* 3D Model Area */}
              <div className="md:col-span-2 relative bg-[#0a0500] border border-orange-900/30 rounded overflow-hidden group shadow-lg">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-transparent z-20"></div>
                 <div className="absolute top-4 left-4 z-10 max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-orange-600 text-black text-xs font-bold rounded-sm">3D ASSET</span>
                        <span className="text-xs text-orange-400 font-mono tracking-widest uppercase">Digital Twin ID: {currentData.model}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-none mb-2">{currentData.title}</h2>
                    <p className="text-sm text-slate-400 line-clamp-2">{currentData.description}</p>
                    <div className="flex gap-2 mt-2">
                        {currentData.tags.map((t: string) => (
                            <span key={t} className="text-[10px] border border-slate-600 text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                    </div>
                 </div>
                 
                 {/* Interactive Toolbar */}
                 <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button className="p-2 bg-slate-900/80 hover:bg-orange-600 hover:text-black text-slate-300 rounded border border-slate-700 transition-colors" title="Exploded View">
                        <Layers size={16} />
                    </button>
                    <button className="p-2 bg-slate-900/80 hover:bg-orange-600 hover:text-black text-slate-300 rounded border border-slate-700 transition-colors" title="Wireframe Mode">
                        <Cpu size={16} />
                    </button>
                    <button className="p-2 bg-slate-900/80 hover:bg-orange-600 hover:text-black text-slate-300 rounded border border-slate-700 transition-colors" title="Share Component">
                        <Share2 size={16} />
                    </button>
                 </div>

                 <ThreeScene type="crane" color={activeColor} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Performance & Specs Column */}
              <div className="flex flex-col gap-4">
                  <SciFiCard title="性能多维评估" className="flex-1 border-orange-900/50" noPadding>
                     <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentData.performanceData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Performance" dataKey="A" stroke={activeColor} strokeWidth={2} fill={activeColor} fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: activeColor, color: '#e2e8f0'}} />
                          </RadarChart>
                        </ResponsiveContainer>
                     </div>
                  </SciFiCard>

                  <SciFiCard title="关键技术参数" subtitle="SPECS">
                     <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentData.specs.map((spec: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800 pb-1.5 last:border-0">
                              <span className="text-slate-400">{spec.label}</span>
                              <span className="font-mono font-bold text-slate-200">{spec.value}</span>
                           </div>
                        ))}
                     </div>
                  </SciFiCard>
              </div>
           </div>

           {/* Middle: Maintenance & Reliability */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SciFiCard title="预防性维护计划" subtitle="PM SCHEDULE" className="border-orange-900/50">
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-slate-500 uppercase font-bold border-b border-slate-800 pb-2">
                        <span>Task Description</span>
                        <div className="flex gap-8 pr-2">
                            <span>Interval</span>
                            <span>Status</span>
                        </div>
                    </div>
                    {currentData.maintenance.map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className={`w-1.5 h-1.5 rounded-full ${item.criticality === 'High' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                             <span className="text-sm text-slate-300 group-hover:text-orange-300 transition-colors">{item.task}</span>
                          </div>
                          <div className="flex gap-8 items-center text-xs w-40 justify-between">
                             <span className="text-slate-500 font-mono">{item.interval}</span>
                             <span className={`px-2 py-0.5 rounded font-bold ${item.status === 'OK' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                {item.status}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </SciFiCard>

              <SciFiCard title="可靠性趋势分析" subtitle="MTBF TRACKING" className="border-orange-900/50">
                 <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reliabilityData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                           <YAxis domain={[95, 100]} hide />
                           <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#f97316'}} />
                           <Line type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="flex justify-between items-center mt-2 text-xs">
                     <span className="text-slate-500">Current Reliability</span>
                     <span className="text-lg font-bold text-white">99.3%</span>
                 </div>
              </SciFiCard>

           </div>

           {/* Bottom: Fault Library & Docs */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Fault Diagnosis Table */}
               <SciFiCard title="故障诊断知识库" subtitle="EXPERT SYSTEM" className="md:col-span-2 border-orange-900/50">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                         <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-300">
                            <tr>
                               <th className="px-3 py-2 rounded-tl">Code</th>
                               <th className="px-3 py-2">Fault Title</th>
                               <th className="px-3 py-2">Root Cause Analysis</th>
                               <th className="px-3 py-2 rounded-tr">Recommended Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800/50">
                            {currentData.faultLibrary.map((fault: any, idx: number) => (
                               <tr key={idx} className="hover:bg-orange-900/10 transition-colors group">
                                  <td className="px-3 py-3 font-mono text-orange-400 font-bold">{fault.code}</td>
                                  <td className="px-3 py-3 text-white group-hover:text-orange-200">{fault.title}</td>
                                  <td className="px-3 py-3">{fault.cause}</td>
                                  <td className="px-3 py-3 text-slate-300">
                                     <div className="flex items-center gap-2">
                                         <CheckCircle2 size={12} className="text-green-500" />
                                         {fault.solution}
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
               </SciFiCard>

               {/* Documentation */}
               <SciFiCard title="技术文档资料" subtitle="DOWNLOADS" className="border-orange-900/50">
                   <div className="flex flex-col gap-2">
                       {currentData.documents.map((doc: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-orange-500/30 transition-colors group cursor-pointer">
                               <div className="flex items-center gap-3 overflow-hidden">
                                   <FileText size={18} className="text-slate-500 group-hover:text-orange-400 shrink-0" />
                                   <div className="truncate">
                                       <div className="text-sm text-slate-300 group-hover:text-white truncate">{doc.name}</div>
                                       <div className="text-[10px] text-slate-600">{doc.size}</div>
                                   </div>
                               </div>
                               <Download size={14} className="text-slate-600 group-hover:text-orange-500 shrink-0" />
                           </div>
                       ))}
                       <div className="mt-2 text-center">
                           <button className="text-xs text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 w-full py-2 border border-dashed border-slate-700 hover:border-orange-900 rounded">
                               View All Documents (12)
                           </button>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
