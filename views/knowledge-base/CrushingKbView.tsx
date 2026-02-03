
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Search, Database, Settings, ArrowRight, 
  Layers, Filter, Scale, Hammer, 
  AlertTriangle, FileText, CheckSquare, 
  Activity, Zap, Clock, ChevronDown, ChevronUp,
  Layout
} from 'lucide-react';

// --- Mock Data ---

// 1. Process Nodes
const PROCESS_FLOW = [
  { id: 'primary', label: '粗碎作业 (Primary)', type: 'Jaw', capacity: '500-800 t/h' },
  { id: 'secondary', label: '中细碎 (Secondary)', type: 'Cone', capacity: '300-500 t/h' },
  { id: 'screening', label: '筛分分级 (Screening)', type: 'Screen', capacity: '600 t/h' },
  { id: 'tertiary', label: '整形制砂 (Tertiary)', type: 'VSI', capacity: '200-350 t/h' },
];

// 2. Equipment Specifications Database
const EQUIPMENT_DB: Record<string, any[]> = {
  'primary': [
    { model: 'PE-900x1200', power: 110, feedSize: 750, capacity: 220, css: '100-200' },
    { model: 'PE-1200x1500', power: 200, feedSize: 1020, capacity: 450, css: '150-300' },
    { model: 'C-140 (Jaw)', power: 160, feedSize: 850, capacity: 380, css: '125-250' },
  ],
  'secondary': [
    { model: 'HP-300 (Cone)', power: 220, feedSize: 230, capacity: 440, css: '13-51' },
    { model: 'HP-500 (Cone)', power: 315, feedSize: 300, capacity: 650, css: '15-60' },
    { model: 'GP-100S', power: 90, feedSize: 150, capacity: 180, css: '10-35' },
  ],
  'screening': [
    { model: '3YA-2460', power: 37, layers: 3, area: 14.4, capacity: 450 },
    { model: '2YA-3075', power: 55, layers: 2, area: 22.5, capacity: 800 },
  ],
  'tertiary': [
    { model: 'VSI-9526', power: 220, feedSize: 45, capacity: 300, product: 'Sand' },
    { model: 'VSI-1140', power: 400, feedSize: 55, capacity: 550, product: 'Sand' },
  ]
};

// 3. PSD Curves (Particle Size Distribution)
const PSD_DATA = [
  { size: 0.15, feed: 0, product: 5 },
  { size: 0.6, feed: 2, product: 15 },
  { size: 2.36, feed: 5, product: 35 },
  { size: 4.75, feed: 10, product: 55 },
  { size: 9.5, feed: 15, product: 85 },
  { size: 19, feed: 25, product: 98 },
  { size: 37.5, feed: 45, product: 100 },
  { size: 75, feed: 70, product: 100 },
  { size: 150, feed: 100, product: 100 },
];

// 4. Wear Parts Knowledge
const WEAR_PARTS = [
  { part: '动颚齿板 (Jaw Plate)', material: 'Mn18Cr2', life: 1200, unit: 'hrs', cost: 'High' },
  { part: '轧臼壁 (Concave)', material: 'Mn18Cr2', life: 1800, unit: 'hrs', cost: 'Med' },
  { part: '破碎壁 (Mantle)', material: 'Mn18Cr2', life: 1600, unit: 'hrs', cost: 'Med' },
  { part: '板锤 (Blow Bar)', material: 'Cr26Mo1', life: 600, unit: 'hrs', cost: 'Low' },
  { part: '筛网 (Screen Mesh)', material: 'PU / Steel', life: 2000, unit: 'hrs', cost: 'Low' },
];

// 5. Troubleshooting
const FAULT_KB = [
  { 
    id: 'F-01', 
    title: '排料口堵塞 (Blockage)', 
    tags: ['Ops', 'Primary'],
    symptom: '主机电流急剧上升，破碎腔满溢。', 
    cause: '物料含水率过高或排料口设置过小。', 
    action: '停止给料，使用液压清腔系统，调整CSS。' 
  },
  { 
    id: 'F-02', 
    title: '产品粒形不佳 (Poor Shape)', 
    tags: ['Quality', 'Secondary'],
    symptom: '针片状含量超过15%。', 
    cause: '破碎腔填充率不足 (<70%) 或衬板磨损严重。', 
    action: '提高给料速度保持挤满给料，检查衬板曲线。' 
  },
  { 
    id: 'F-03', 
    title: '轴承温升异常 (Bearing Heat)', 
    tags: ['Mech', 'General'],
    symptom: '回油温度 > 55°C，温升速率快。', 
    cause: '润滑油脏污、油量不足或配合间隙不当。', 
    action: '取样化验油质，清洗过滤器，检查迷宫密封。' 
  },
];

// --- Components ---

const ProcessFlowMap = ({ activeStep, onStepClick }: { activeStep: string, onStepClick: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-between px-10 select-none">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-10 right-10 h-1 bg-stone-800 -z-0"></div>
      
      {PROCESS_FLOW.map((step, index) => {
        const isActive = activeStep === step.id;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => onStepClick(step.id)}>
            <div className={`
              w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 bg-[#0c0a09]
              ${isActive ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110' : 'border-stone-700 hover:border-amber-500/50 hover:scale-105'}
            `}>
               {step.id === 'primary' && <Hammer size={24} className={isActive ? 'text-amber-500' : 'text-stone-500'} />}
               {step.id === 'secondary' && <Settings size={24} className={isActive ? 'text-amber-500' : 'text-stone-500'} />}
               {step.id === 'screening' && <Filter size={24} className={isActive ? 'text-amber-500' : 'text-stone-500'} />}
               {step.id === 'tertiary' && <Layers size={24} className={isActive ? 'text-amber-500' : 'text-stone-500'} />}
               
               <div className={`text-[10px] mt-2 font-bold ${isActive ? 'text-white' : 'text-stone-500'}`}>{step.type}</div>
            </div>
            
            {/* Label Badge */}
            <div className={`
              mt-4 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors
              ${isActive ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'}
            `}>
              {step.label.split(' ')[0]}
            </div>
            
            {/* Hover Info */}
            <div className="absolute top-28 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-stone-500 bg-black/80 px-2 py-1 rounded border border-stone-800 whitespace-nowrap">
               Cap: {step.capacity}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const CrushingKbView: React.FC = () => {
  const [activeProcess, setActiveProcess] = useState('secondary');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFault, setExpandedFault] = useState<string | null>(null);

  const activeSpecs = EQUIPMENT_DB[activeProcess] || [];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-stone-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-stone-700/50 pb-4 bg-gradient-to-r from-[#1c1917] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 mb-1 uppercase tracking-wider">
             <Database size={14} /> Industrial Knowledge Base
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             破碎与分选设备 <span className="text-amber-600">技术图谱</span>
          </h1>
        </div>
        
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
           <input 
             type="text" 
             placeholder="搜索设备参数、耐磨件或故障案例..." 
             className="w-full bg-stone-900/80 border border-stone-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-600 transition-colors text-stone-200 placeholder:text-stone-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* ROW 1: Process Navigator */}
        <SciFiCard title="骨料生产工艺流程 (Process Circuit)" subtitle="INTERACTIVE" className="h-[220px] border-stone-700/50 bg-[#0c0a09]" noPadding>
           <ProcessFlowMap activeStep={activeProcess} onStepClick={setActiveProcess} />
        </SciFiCard>

        {/* ROW 2: Specs & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
           
           {/* Equipment Matrix */}
           <SciFiCard title={`${PROCESS_FLOW.find(p => p.id === activeProcess)?.label} 设备参数矩阵`} subtitle="SPECIFICATIONS" className="border-stone-700/50">
              <div className="flex flex-col h-full">
                 {/* Table Header */}
                 <div className="grid grid-cols-5 text-xs text-stone-500 font-bold uppercase border-b border-stone-800 pb-2 mb-2 px-2">
                    <div className="col-span-2">Model</div>
                    <div>Power (kW)</div>
                    <div>Feed (mm)</div>
                    <div className="text-right">Cap (t/h)</div>
                 </div>
                 
                 {/* Table Body */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeSpecs.map((item, idx) => (
                       <div key={idx} className="group grid grid-cols-5 items-center p-2 rounded hover:bg-stone-800/50 transition-colors border-b border-stone-800/30 last:border-0">
                          <div className="col-span-2">
                             <div className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{item.model}</div>
                             <div className="text-[10px] text-stone-500">CSS: {item.css || 'N/A'} mm</div>
                          </div>
                          <div className="text-stone-300 font-mono text-xs">{item.power}</div>
                          <div className="text-stone-300 font-mono text-xs">{item.feedSize || item.area}</div>
                          <div className="text-right">
                             <span className="text-amber-400 font-bold font-mono text-sm">{item.capacity}</span>
                             <div className="w-full h-1 bg-stone-800 rounded-full mt-1 overflow-hidden">
                                <div className="bg-amber-600 h-full" style={{width: `${(item.capacity/800)*100}%`}}></div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-2 pt-2 border-t border-stone-800 flex justify-between items-center">
                    <div className="text-[10px] text-stone-500">Showing {activeSpecs.length} Models</div>
                    <button className="text-xs text-amber-600 hover:text-amber-500 flex items-center gap-1">
                       <FileText size={12} /> 下载选型手册
                    </button>
                 </div>
              </div>
           </SciFiCard>

           {/* PSD Analysis */}
           <SciFiCard title="粒径分布分析 (PSD)" subtitle="LAB DATA" className="border-stone-700/50">
              <div className="w-full h-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={PSD_DATA} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                       <XAxis dataKey="size" type="category" stroke="#78716c" tick={{fontSize: 10}} label={{ value: 'Sieve Size (mm)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#78716c' }} />
                       <YAxis stroke="#78716c" tick={{fontSize: 10}} label={{ value: '% Passing', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#78716c' }} domain={[0, 100]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#d97706', color: '#fff'}} />
                       <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                       
                       <Area type="monotone" dataKey="feed" name="Feed Material" stroke="#78716c" fill="#292524" fillOpacity={0.5} strokeDasharray="5 5" />
                       <Line type="monotone" dataKey="product" name="Crushed Product" stroke="#d97706" strokeWidth={3} dot={{r:4, fill:'#d97706'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* ROW 3: Wear & Troubleshooting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Wear Part Tracker */}
           <SciFiCard title="耐磨件寿命管理" subtitle="LIFECYCLE" className="border-stone-700/50">
              <div className="flex flex-col gap-4">
                 {WEAR_PARTS.map((part, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-300">{part.part}</span>
                          <span className="text-stone-500">{part.material}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${idx % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{width: `${Math.random() * 40 + 40}%`}} // Random progress for mockup
                             ></div>
                          </div>
                          <span className="text-xs font-mono text-stone-400 w-16 text-right">{part.life} {part.unit}</span>
                       </div>
                    </div>
                 ))}
                 <div className="mt-2 p-2 bg-stone-800/50 rounded border border-stone-700 text-[10px] text-stone-400 flex gap-2 items-center">
                    <Activity size={12} className="text-amber-500" />
                    <span>Based on quartz/granite abrasion index (Ai=0.45)</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Knowledge & Troubleshooting (Spans 2 cols) */}
           <SciFiCard title="专家故障诊断库" subtitle="TROUBLESHOOTING" className="lg:col-span-2 border-stone-700/50">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar" style={{maxHeight: '300px'}}>
                 {FAULT_KB.map((fault) => (
                    <div key={fault.id} className="border border-stone-800 bg-stone-900/30 rounded overflow-hidden">
                       <div 
                         className="flex items-center justify-between p-3 cursor-pointer hover:bg-stone-800/50 transition-colors"
                         onClick={() => setExpandedFault(expandedFault === fault.id ? null : fault.id)}
                       >
                          <div className="flex items-center gap-3">
                             <span className="text-xs font-mono text-amber-600 bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-900/30">{fault.id}</span>
                             <span className="text-sm font-bold text-stone-200">{fault.title}</span>
                             <div className="flex gap-1">
                                {fault.tags.map(t => <span key={t} className="text-[9px] text-stone-500 bg-stone-800 px-1 rounded">{t}</span>)}
                             </div>
                          </div>
                          {expandedFault === fault.id ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
                       </div>
                       
                       {expandedFault === fault.id && (
                          <div className="p-3 border-t border-stone-800 bg-stone-900/60 text-xs">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                   <span className="text-stone-500 uppercase font-bold text-[10px] flex items-center gap-1"><AlertTriangle size={10} /> Symptom</span>
                                   <p className="text-stone-300">{fault.symptom}</p>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-stone-500 uppercase font-bold text-[10px] flex items-center gap-1"><Search size={10} /> Root Cause</span>
                                   <p className="text-stone-300">{fault.cause}</p>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-stone-500 uppercase font-bold text-[10px] flex items-center gap-1"><CheckSquare size={10} /> Solution</span>
                                   <p className="text-green-400">{fault.action}</p>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                 ))}
                 
                 <button className="mt-2 w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs rounded transition-colors flex items-center justify-center gap-2">
                    <ArrowRight size={12} /> 查看完整故障树 (FTA)
                 </button>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
