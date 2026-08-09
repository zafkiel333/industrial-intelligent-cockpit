
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { 
  Search, Database, Truck, Settings, 
  AlertTriangle, Wrench, 
  Layers, ChevronRight, ChevronDown, 
  FileText, Workflow, Box, 
  Thermometer, Gauge, Activity, Crosshair
} from 'lucide-react';

// --- Mock Data ---

// Asset Hierarchy Tree
const ASSET_HIERARCHY = [
  {
    id: 'surface',
    label: '露天矿运输 (Surface)',
    children: [
      { id: 'truck-rigid', label: '刚性自卸车 (Rigid Truck)', active: true },
      { id: 'truck-articulated', label: '铰接式卡车 (ADT)' },
      { id: 'grader', label: '矿用平地机 (Grader)' }
    ]
  },
  {
    id: 'underground',
    label: '井下运输 (Underground)',
    children: [
      { id: 'loco-electric', label: '架线式电机车 (Electric Loco)' },
      { id: 'lhd', label: '地下铲运机 (LHD)' },
      { id: 'shuttle-car', label: '梭车 (Shuttle Car)' }
    ]
  },
  {
    id: 'continuous',
    label: '连续运输系统 (Continuous)',
    children: [
      { id: 'belt-main', label: '主斜井皮带 (Main Belt)' },
      { id: 'belt-extendable', label: '可伸缩皮带 (Extendable)' }
    ]
  }
];

// Current Asset Data (Mining Truck)
const ASSET_DATA = {
  id: 'MT-930E-4',
  name: '300吨级电动轮自卸车',
  model: 'Komatsu 930E-4',
  description: '超大型露天矿用自卸车，采用AC-AC交流电传动系统。适用于千万吨级以上大型露天矿山的岩石和矿石运输。',
  specs: [
    { label: '额定载重', value: '290 metric tons' },
    { label: '发动机功率', value: '2,014 kW (2700 HP)' },
    { label: '最高车速', value: '64.5 km/h' },
    { label: '最大扭矩', value: 'Dynamic Retarding' },
    { label: '轮胎规格', value: '53/80 R63' },
    { label: '传动方式', value: 'AC Electric Drive' },
  ],
  performance: [
    { subject: '爬坡能力', A: 95, fullMark: 100 },
    { subject: '燃油经济性', A: 82, fullMark: 100 },
    { subject: '出勤率', A: 90, fullMark: 100 },
    { subject: '维护成本', A: 75, fullMark: 100 }, // High cost = lower score
    { subject: '操作舒适度', A: 88, fullMark: 100 },
    { subject: '载重系数', A: 98, fullMark: 100 },
  ],
  lifecycleCost: [
    { year: 'Y1', capex: 100, opex: 15 },
    { year: 'Y2', capex: 0, opex: 25 },
    { year: 'Y3', capex: 0, opex: 30 },
    { year: 'Y4', capex: 0, opex: 45 }, // Major overhaul
    { year: 'Y5', capex: 0, opex: 35 },
  ],
  mtbfTrend: [
    { month: 'Jan', mtbf: 120 }, { month: 'Feb', mtbf: 125 },
    { month: 'Mar', mtbf: 118 }, { month: 'Apr', mtbf: 135 },
    { month: 'May', mtbf: 142 }, { month: 'Jun', mtbf: 140 },
  ]
};

// Bill of Materials (BOM) Structure
const BOM_STRUCTURE = [
  {
    id: 'sys-power', label: '动力总成 (Powertrain)', status: 'Normal', children: [
      { id: 'eng-01', label: '柴油发动机 (Engine)', partNo: 'QSK60', stock: 1 },
      { id: 'alt-01', label: '主发电机 (Alternator)', partNo: 'GTA-41', stock: 0, warning: true },
      { id: 'rad-01', label: '散热器组 (Radiator)', partNo: 'RAD-930', stock: 2 }
    ]
  },
  {
    id: 'sys-drive', label: '电驱动系统 (Electric Drive)', status: 'Warning', children: [
      { id: 'inv-01', label: '变频柜 (Inverter Cabinet)', partNo: 'IGBT-Pack', stock: 4 },
      { id: 'whl-01', label: '电动轮 (Wheel Motor)', partNo: 'GE-B25', stock: 1 },
      { id: 'grd-01', label: '制动电阻栅 (Grid Box)', partNo: 'RES-BANK', stock: 3 }
    ]
  },
  {
    id: 'sys-hyd', label: '液压与举升 (Hydraulics)', status: 'Normal', children: [
      { id: 'pmp-01', label: '举升泵 (Hoist Pump)', partNo: 'HYD-P-200', stock: 2 },
      { id: 'cyl-01', label: '举升油缸 (Hoist Cyl)', partNo: 'CYL-H-L', stock: 0 }
    ]
  }
];

// Fault Tree Data
const FAULT_TREE = {
  root: { id: 'F-ROOT', label: '动力不足 (Low Power)', type: 'symptom' },
  branches: [
    {
      id: 'F-L1-1', label: '燃油系统故障', type: 'system', children: [
        { id: 'F-L2-1', label: '滤芯堵塞', type: 'cause', prob: 'High' },
        { id: 'F-L2-2', label: '喷油器磨损', type: 'cause', prob: 'Med' }
      ]
    },
    {
      id: 'F-L1-2', label: '进气系统受阻', type: 'system', children: [
        { id: 'F-L2-3', label: '空滤脏污', type: 'cause', prob: 'Low' },
        { id: 'F-L2-4', label: '涡轮增压器失效', type: 'cause', prob: 'Med' }
      ]
    },
    {
      id: 'F-L1-3', label: '电传动限制', type: 'system', children: [
        { id: 'F-L2-5', label: '模块过热降额', type: 'cause', prob: 'High' }
      ]
    }
  ]
};

// --- Sub-Components ---

const TruckSchematic = () => {
  const [activePart, setActivePart] = useState<string | null>(null);

  const hotspots = [
    { id: 'engine', x: 25, y: 55, label: 'V16 Diesel Engine', status: 'normal', details: 'RPM: 1800 | Temp: 88°C' },
    { id: 'wheel-rear', x: 75, y: 75, label: 'Electric Wheel Motor', status: 'warning', details: 'Torque: 95% | Temp: 102°C' },
    { id: 'hydraulics', x: 45, y: 60, label: 'Hoist Cylinder', status: 'normal', details: 'Press: 180 bar' },
    { id: 'grid', x: 30, y: 30, label: 'Grid Box (Retarder)', status: 'normal', details: 'Fan Speed: 100%' },
    { id: 'tire-front', x: 25, y: 78, label: 'Front Suspension', status: 'normal', details: 'Travel: 45mm' },
  ];

  return (
    <div className="relative w-full h-full bg-[#0f0a05] overflow-hidden select-none">
      {/* Background Grid */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: 'linear-gradient(#2a1a05 1px, transparent 1px), linear-gradient(90deg, #2a1a05 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             opacity: 0.3
           }}>
      </div>

      {/* Blueprint SVG */}
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="4" transform="translate(0,0)" fill="#f59e0b" fillOpacity="0.1"></rect>
          </pattern>
        </defs>

        {/* Truck Silhouette (Simplified Technical Drawing) */}
        <g transform="translate(100, 50) scale(0.8)">
           {/* Dump Body */}
           <path d="M50,50 L650,50 L700,100 L680,250 L150,250 L80,150 Z" 
                 fill="none" stroke="#f59e0b" strokeWidth="2" fillOpacity="0.05" />
           <path d="M50,50 L150,250" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,5" />
           
           {/* Chassis */}
           <rect x="150" y="250" width="500" height="40" fill="#1c1917" stroke="#44403c" strokeWidth="2" />
           
           {/* Cab/Deck */}
           <path d="M50,150 L150,150 L150,250 L50,250 Z" fill="#292524" stroke="#f59e0b" strokeWidth="1" />
           <rect x="60" y="160" width="80" height="50" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" />

           {/* Front Wheel */}
           <circle cx="150" cy="300" r="60" fill="#0f0a05" stroke="#78716c" strokeWidth="4" />
           <circle cx="150" cy="300" r="25" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />

           {/* Rear Wheel (Double) */}
           <circle cx="600" cy="300" r="60" fill="#0f0a05" stroke="#78716c" strokeWidth="4" />
           <circle cx="600" cy="300" r="25" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
           
           {/* Detail Lines */}
           <line x1="210" y1="300" x2="540" y2="300" stroke="#44403c" strokeWidth="10" />
           <rect x="250" y="200" width="100" height="50" fill="none" stroke="#f59e0b" strokeWidth="1" /> {/* Engine Block */}
           <rect x="260" y="100" width="150" height="40" fill="url(#hatch)" stroke="none" /> {/* Grid Box */}
        </g>

        {/* Connecting Lines for Hotspots */}
        <line x1="300" y1="210" x2="300" y2="150" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
        <line x1="580" y1="290" x2="620" y2="220" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Interactive Hotspots */}
      {hotspots.map(spot => (
        <div 
          key={spot.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          onClick={() => setActivePart(spot.id)}
        >
          {/* Animated Target */}
          <div className="relative w-8 h-8 flex items-center justify-center">
             <div className={`absolute w-full h-full rounded-full border border-dashed opacity-70 animate-[spin_4s_linear_infinite] ${spot.status === 'warning' ? 'border-red-500' : 'border-amber-500'}`}></div>
             <div className={`w-2 h-2 rounded-full ${spot.status === 'warning' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_10px_currentColor]`}></div>
          </div>

          {/* Tooltip Card */}
          <div className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-slate-700 p-3 rounded w-48 backdrop-blur-md transition-all duration-300 z-10
             ${activePart === spot.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'}
          `}>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{spot.label}</span>
                <span className={`w-2 h-2 rounded-full ${spot.status === 'warning' ? 'bg-red-500' : 'bg-green-500'}`}></span>
             </div>
             <div className="text-[10px] font-mono text-amber-300">{spot.details}</div>
             {/* Decorative line connecting tooltip to point */}
             <div className="absolute right-full top-1/2 w-4 h-[1px] bg-slate-700"></div>
          </div>
        </div>
      ))}

      {/* HUD Info */}
      <div className="absolute top-4 left-4 p-2">
         <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Activity size={14} /> <span className="text-xs font-bold tracking-widest uppercase">Digital Twin Schematic</span>
         </div>
         <div className="text-[10px] text-slate-500">Live Telemetry Feed Active</div>
      </div>
    </div>
  );
};

export const TransportEquipKbView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBom, setExpandedBom] = useState<string[]>(['sys-power', 'sys-drive']);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const toggleBom = (id: string) => {
    setExpandedBom(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-amber-600/40 pb-4 bg-gradient-to-r from-[#2a1a05] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Truck size={14} /> Fleet Management / 车队管理
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山运输装备 <span className="text-amber-500">全生命周期档案</span>
          </h1>
        </div>
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder="搜索资产编号、BOM零件号或故障现象..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500 transition-colors text-slate-200 placeholder:text-slate-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT SIDEBAR: Asset Tree */}
        <div className="w-full lg:w-64 flex flex-col gap-2 overflow-y-auto pr-1">
           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded mb-2">
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Fleet Value</div>
               <div className="text-xl font-mono text-white">$ 45.2 M</div>
           </div>
           
           <div className="space-y-1">
               {ASSET_HIERARCHY.map(group => (
                   <div key={group.id} className="mb-2">
                       <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/30 rounded mb-1">
                           {group.label}
                       </div>
                       {group.children.map(item => (
                           <button 
                             key={item.id}
                             className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all text-left
                                ${item.active 
                                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                             `}
                           >
                               <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                               {item.label}
                           </button>
                       ))}
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER AREA: Main Content */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Digital Twin & Specs */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[400px]">
              
              {/* Schematic Asset Viewer (Replaced 3D) */}
              <div className="xl:col-span-2 relative bg-[#0c0a09] border border-amber-900/30 rounded overflow-hidden flex flex-col group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-transparent z-20"></div>
                 
                 {/* Header Overlay */}
                 <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Box size={12} /> Asset Twin
                    </div>
                    <div className="text-3xl font-bold text-white leading-none mb-2">{ASSET_DATA.model}</div>
                    <div className="flex gap-4 text-xs font-mono text-slate-400">
                        <span>ID: {ASSET_DATA.id}</span>
                        <span>Run Hrs: 14,250</span>
                    </div>
                 </div>

                 {/* Real-time Telemetry Overlay (Top Right) */}
                 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end pointer-events-none">
                     <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-amber-900/50 flex items-center gap-3">
                         <span className="text-[10px] text-slate-400 uppercase">Engine Load</span>
                         <span className="text-sm font-bold text-white font-mono">85%</span>
                         <div className="w-16 h-1 bg-slate-700 rounded overflow-hidden"><div className="w-[85%] h-full bg-amber-500"></div></div>
                     </div>
                     <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-amber-900/50 flex items-center gap-3">
                         <span className="text-[10px] text-slate-400 uppercase">Payload</span>
                         <span className="text-sm font-bold text-white font-mono">295 t</span>
                         <div className="w-16 h-1 bg-slate-700 rounded overflow-hidden"><div className="w-[98%] h-full bg-red-500 animate-pulse"></div></div>
                     </div>
                 </div>

                 {/* Technical Schematic Scene */}
                 <div className="flex-1 relative border-t border-slate-800/50 bg-[#080503]">
                    <TruckSchematic /> 
                 </div>
                 
                 {/* Bottom Bar: System Status */}
                 <div className="h-8 bg-slate-900/80 border-t border-slate-800 flex items-center px-4 gap-6 text-[10px] font-mono text-slate-400">
                     <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> HYDRAULICS OK</span>
                     <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> BRAKES OK</span>
                     <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div> DRIVE TEMP WARN</span>
                 </div>
              </div>

              {/* Specs & Performance */}
              <div className="flex flex-col gap-4">
                  <SciFiCard title="设备性能雷达" subtitle="EVALUATION" className="flex-1 border-amber-900/50" noPadding>
                     <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ASSET_DATA.performance}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Performance" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#f59e0b', color: '#e2e8f0'}} />
                          </RadarChart>
                        </ResponsiveContainer>
                     </div>
                  </SciFiCard>

                  <SciFiCard title="技术参数摘要" subtitle="SPECS">
                     <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                        {ASSET_DATA.specs.map((spec: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800 pb-1.5 last:border-0 hover:bg-slate-800/30 px-1 rounded transition-colors">
                              <span className="text-slate-400">{spec.label}</span>
                              <span className="font-mono font-bold text-slate-100">{spec.value}</span>
                           </div>
                        ))}
                     </div>
                  </SciFiCard>
              </div>
           </div>

           {/* Row 2: Reliability & Cost Analytics */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SciFiCard title="全生命周期成本分析 (LCC)" subtitle="TCO MODEL" className="border-amber-900/50">
                 <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ASSET_DATA.lifecycleCost}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="year" stroke="#666" tick={{fontSize: 10}} />
                           <YAxis stroke="#666" tick={{fontSize: 10}} label={{ value: 'Cost ($k)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666' }} />
                           <Tooltip cursor={{fill: '#1c1917'}} contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b'}} />
                           <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                           <Bar dataKey="capex" name="CapEx (购置)" stackId="a" fill="#f59e0b" />
                           <Bar dataKey="opex" name="OpEx (运维)" stackId="a" fill="#3b82f6" />
                        </BarChart>
                     </ResponsiveContainer>
                 </div>
              </SciFiCard>

              <SciFiCard title="平均故障间隔时间 (MTBF)" subtitle="RELIABILITY" className="border-amber-900/50">
                 <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ASSET_DATA.mtbfTrend}>
                           <defs>
                              <linearGradient id="colorMtbf" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="month" stroke="#666" tick={{fontSize: 10}} />
                           <YAxis domain={[100, 160]} stroke="#666" tick={{fontSize: 10}} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#10b981'}} />
                           <Area type="monotone" dataKey="mtbf" stroke="#10b981" fill="url(#colorMtbf)" />
                        </AreaChart>
                     </ResponsiveContainer>
                 </div>
              </SciFiCard>

           </div>

           {/* Row 3: Deep Knowledge Modules (Split) */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               
               {/* BOM Explorer */}
               <SciFiCard title="BOM 结构与备件库" subtitle="BILL OF MATERIALS" className="h-[400px] border-amber-900/50">
                   <div className="flex flex-col h-full">
                       <div className="flex justify-between items-center text-xs text-slate-500 mb-2 px-2">
                           <span>Component Tree</span>
                           <span className="flex gap-4">
                               <span>Part No.</span>
                               <span>Stock</span>
                           </span>
                       </div>
                       <div className="flex-1 overflow-y-auto border border-slate-800 rounded bg-slate-900/30 p-2 custom-scrollbar">
                           {BOM_STRUCTURE.map(sys => (
                               <div key={sys.id} className="mb-2">
                                   <div 
                                     onClick={() => toggleBom(sys.id)}
                                     className="flex items-center gap-2 p-2 bg-slate-800/50 hover:bg-slate-800 rounded cursor-pointer select-none"
                                   >
                                       {expandedBom.includes(sys.id) ? <ChevronDown size={14} className="text-amber-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                       <span className="text-sm font-bold text-slate-200">{sys.label}</span>
                                       {sys.status === 'Warning' && <AlertTriangle size={12} className="ml-auto text-yellow-500" />}
                                   </div>
                                   
                                   {expandedBom.includes(sys.id) && (
                                       <div className="pl-6 mt-1 space-y-1">
                                           {sys.children.map(part => (
                                               <div 
                                                 key={part.id}
                                                 onClick={() => setSelectedPart(part.id)}
                                                 className={`flex justify-between items-center p-1.5 rounded cursor-pointer text-xs transition-colors
                                                    ${selectedPart === part.id ? 'bg-amber-900/30 text-amber-200' : 'hover:bg-slate-800/50 text-slate-400'}
                                                 `}
                                               >
                                                   <div className="flex items-center gap-2">
                                                       <div className={`w-1.5 h-1.5 rounded-full ${part.warning ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                                                       <span>{part.label}</span>
                                                   </div>
                                                   <div className="flex gap-4 font-mono">
                                                       <span className="w-20">{part.partNo}</span>
                                                       <span className={`w-8 text-right ${part.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-300'}`}>{part.stock}</span>
                                                   </div>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))}
                       </div>
                       {/* Action Bar */}
                       <div className="mt-3 flex gap-2">
                           <button className="flex-1 py-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 border border-amber-900/50 rounded text-xs flex items-center justify-center gap-2">
                               <FileText size={12} /> 备件申请
                           </button>
                           <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs flex items-center justify-center gap-2">
                               <Workflow size={12} /> 3D 拆解图
                           </button>
                       </div>
                   </div>
               </SciFiCard>

               {/* Fault Tree Visualization */}
               <SciFiCard title="故障树分析 (FTA)" subtitle="DIAGNOSTICS" className="h-[400px] border-amber-900/50">
                   <div className="h-full flex flex-col relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                           backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
                           backgroundSize: '20px 20px'
                       }}></div>
                       
                       <div className="flex-1 overflow-auto p-4 flex flex-col items-center gap-6">
                           {/* Root Symptom */}
                           <div className="bg-red-900/40 border border-red-500 text-red-200 px-6 py-3 rounded shadow-[0_0_15px_rgba(239,68,68,0.2)] text-center relative z-10">
                               <div className="text-xs text-red-400 font-bold uppercase mb-1">Symptom</div>
                               <div className="text-lg font-bold">{FAULT_TREE.root.label}</div>
                               <div className="absolute bottom-[-24px] left-1/2 w-0.5 h-6 bg-slate-600 -translate-x-1/2"></div>
                           </div>

                           {/* Branches L1 */}
                           <div className="flex gap-4 w-full justify-center relative">
                               {/* Connector Line Horizontal */}
                               <div className="absolute top-[-12px] left-[15%] right-[15%] h-0.5 bg-slate-600 rounded"></div>
                               
                               {FAULT_TREE.branches.map((branch, i) => (
                                   <div key={branch.id} className="flex-1 flex flex-col items-center relative">
                                       <div className="absolute top-[-12px] left-1/2 w-0.5 h-3 bg-slate-600 -translate-x-1/2"></div>
                                       
                                       <div className="bg-slate-800 border border-slate-600 px-3 py-2 rounded text-center mb-4 w-full max-w-[140px] z-10">
                                           <div className="text-[10px] text-slate-400 uppercase">Sub-System</div>
                                           <div className="text-sm font-bold text-white">{branch.label}</div>
                                       </div>

                                       <div className="flex flex-col gap-2 w-full items-center">
                                           <div className="w-0.5 h-2 bg-slate-700"></div>
                                           {branch.children.map(cause => (
                                               <div key={cause.id} className="w-full max-w-[130px] bg-slate-900/80 border border-slate-700 p-2 rounded text-xs flex justify-between items-center hover:border-amber-500 cursor-pointer transition-colors group">
                                                   <span className="text-slate-300 group-hover:text-white">{cause.label}</span>
                                                   <span className={`text-[9px] px-1 rounded ${cause.prob === 'High' ? 'bg-red-900 text-red-300' : cause.prob === 'Med' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                                       {cause.prob}
                                                   </span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                       
                       <div className="bg-amber-900/10 border-t border-amber-900/30 p-2 text-[10px] text-center text-amber-500/70">
                           AI Reasoning Engine v2.4 • Click nodes to view detailed diagnostic steps
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
