
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Droplets, Wind, Zap, Settings, 
  Thermometer, AlertTriangle, CheckSquare, 
  GitMerge, RefreshCw, FileText, ChevronRight,
  Gauge, Power, Filter, Play, Pause, AlertOctagon,
  ArrowRight, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- Types ---
type SystemId = 'tech-water' | 'drainage' | 'high-pressure-air' | 'low-pressure-air' | 'oil-system';

interface ComponentData {
  id: string;
  name: string;
  status: 'Running' | 'Standby' | 'Fault' | 'Maintenance';
  param: string;
  unit: string;
}

interface LogicStep {
  id: number;
  condition: string;
  action: string;
  type: 'auto' | 'manual' | 'protection';
}

// --- Mock Data ---

const SYSTEMS = [
  { id: 'tech-water', label: '技术供水系统', subLabel: 'Technical Water Supply', icon: <Droplets size={16}/>, color: '#0ea5e9' },
  { id: 'drainage', label: '检修/渗漏排水', subLabel: 'Drainage & Dewatering', icon: <Filter size={16}/>, color: '#6366f1' },
  { id: 'high-pressure-air', label: '高压气系统', subLabel: 'HP Compressed Air', icon: <Wind size={16}/>, color: '#f59e0b' },
  { id: 'low-pressure-air', label: '低压气系统', subLabel: 'LP Compressed Air', icon: <Wind size={16}/>, color: '#10b981' },
  { id: 'oil-system', label: '透平油系统', subLabel: 'Turbine Oil System', icon: <Zap size={16}/>, color: '#f43f5e' },
];

const SYSTEM_DATA: Record<string, {
  desc: string;
  components: ComponentData[];
  logic: LogicStep[];
  kpis: { label: string; value: string; status: string }[];
  faults: { code: string; desc: string; solution: string }[];
}> = {
  'tech-water': {
    desc: '为发电机定子、转子空冷器、推力轴承及导轴承油冷却器提供冷却水。采用单元供水方式，每台机组配置2台主供水泵。',
    components: [
      { id: 'P-101', name: '#1 主供水泵', status: 'Running', param: '185', unit: 'm³/h' },
      { id: 'P-102', name: '#2 主供水泵', status: 'Standby', param: '0', unit: 'm³/h' },
      { id: 'F-101', name: '电动滤水器', status: 'Running', param: '0.02', unit: 'MPa (ΔP)' },
      { id: 'V-103', name: '减压阀组', status: 'Running', param: '0.45', unit: 'MPa' },
    ],
    logic: [
      { id: 1, condition: '机组开机令发出', action: '启动主用供水泵', type: 'auto' },
      { id: 2, condition: '供水母管压力 < 0.35MPa', action: '联动备用泵启动', type: 'protection' },
      { id: 3, condition: '滤水器压差 > 0.05MPa', action: '执行自动排污流程', type: 'auto' },
      { id: 4, condition: '轴承温度 > 65°C', action: '发出冷却水中断报警', type: 'protection' },
    ],
    kpis: [
      { label: '总流量', value: '370 m³/h', status: 'normal' },
      { label: '供水压力', value: '0.45 MPa', status: 'normal' },
      { label: '进水温度', value: '18.5 °C', status: 'normal' },
    ],
    faults: [
      { code: 'W-01', desc: '滤水器频繁堵塞', solution: '检查取水口拦污栅，启用旁路供水' },
      { code: 'W-02', desc: '供水中断', solution: '检查泵电源及出口阀状态，手动切泵' },
    ]
  },
  'high-pressure-air': {
    desc: '额定压力 4.0MPa，主要用于调速器油压装置充气，维持压油罐油气比例。',
    components: [
      { id: 'AC-1', name: '#1 高压空压机', status: 'Standby', param: '0', unit: 'rpm' },
      { id: 'AC-2', name: '#2 高压空压机', status: 'Running', param: '1450', unit: 'rpm' },
      { id: 'AT-1', name: '高压储气罐', status: 'Running', param: '3.85', unit: 'MPa' },
    ],
    logic: [
      { id: 1, condition: '总管压力 < 3.8MPa', action: '启动主空压机', type: 'auto' },
      { id: 2, condition: '总管压力 < 3.6MPa', action: '启动备用空压机', type: 'protection' },
      { id: 3, condition: '总管压力 > 4.1MPa', action: '停机卸载', type: 'auto' },
    ],
    kpis: [
      { label: '系统压力', value: '3.92 MPa', status: 'normal' },
      { label: '露点温度', value: '-20 °C', status: 'normal' },
      { label: '运行时间', value: '12.5 h', status: 'warning' },
    ],
    faults: [
      { code: 'A-01', desc: '排气温度过高', solution: '检查中间冷却器及润滑油位' },
      { code: 'A-03', desc: '安全阀动作', solution: '检查压力开关设定值及卸载阀' },
    ]
  },
  'oil-system': {
    desc: '负责透平油的接收、储存、净化和加注。保障机组轴承润滑及调速系统用油品质。',
    components: [
      { id: 'OP-1', name: '输油泵', status: 'Standby', param: '0', unit: 'L/min' },
      { id: 'OF-1', name: '压力滤油机', status: 'Running', param: '45', unit: 'L/min' },
      { id: 'TK-1', name: '净油罐', status: 'Running', param: '85', unit: '%' },
    ],
    logic: [
      { id: 1, condition: '油罐油位 < 20%', action: '停止输油泵', type: 'protection' },
      { id: 2, condition: '含水量 > 100ppm', action: '启动真空滤油机循环', type: 'manual' },
    ],
    kpis: [
      { label: '油质颗粒度', value: 'NAS 7', status: 'normal' },
      { label: '含水量', value: '45 ppm', status: 'normal' },
      { label: '净油储量', value: '12.5 m³', status: 'normal' },
    ],
    faults: [
      { code: 'O-02', desc: '滤油机压力超高', solution: '更换滤纸/滤芯' },
    ]
  },
  // Default fallbacks for other IDs to prevent crashes
  'drainage': {
    desc: '负责厂房渗漏水及机组检修时的尾水管排水。',
    components: [], logic: [], kpis: [], faults: []
  },
  'low-pressure-air': {
    desc: '额定压力 0.7MPa，用于机组制动、检修密封围带及厂房杂用气。',
    components: [], logic: [], kpis: [], faults: []
  }
};

// --- PID SVG Component ---
const PIDSchematic = ({ systemId }: { systemId: string }) => {
  // A generic stylized P&ID that changes color/labels based on system
  const colors = {
    'tech-water': { line: '#0ea5e9', comp: '#0284c7' },
    'drainage': { line: '#6366f1', comp: '#4f46e5' },
    'high-pressure-air': { line: '#f59e0b', comp: '#d97706' },
    'low-pressure-air': { line: '#10b981', comp: '#059669' },
    'oil-system': { line: '#f43f5e', comp: '#e11d48' },
  }[systemId as SystemId] || { line: '#94a3b8', comp: '#64748b' };

  return (
    <div className="w-full h-full relative bg-[#0f172a] rounded border border-slate-700 overflow-hidden">
        <svg viewBox="0 0 800 400" className="w-full h-full">
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                </pattern>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill={colors.line} />
                </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Main Header Pipe */}
            <path d="M50,100 L750,100" stroke={colors.line} strokeWidth="4" fill="none" />
            <path d="M50,300 L750,300" stroke={colors.line} strokeWidth="4" fill="none" />

            {/* Branch 1: Pump A */}
            <path d="M150,300 L150,250" stroke={colors.line} strokeWidth="3" fill="none" />
            <circle cx="150" cy="230" r="20" stroke={colors.comp} strokeWidth="2" fill="#1e293b" />
            <path d="M150,210 L150,100" stroke={colors.line} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
            {/* Pump Symbol Inside */}
            <path d="M140,230 L160,220 L160,240 Z" fill={colors.comp} />
            <text x="180" y="235" fill="white" fontSize="12" fontWeight="bold">#1 Pump</text>

            {/* Branch 2: Pump B */}
            <path d="M350,300 L350,250" stroke={colors.line} strokeWidth="3" fill="none" />
            <circle cx="350" cy="230" r="20" stroke={colors.comp} strokeWidth="2" fill="#1e293b" />
            <path d="M350,210 L350,100" stroke={colors.line} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
            {/* Pump Symbol Inside */}
            <path d="M340,230 L360,220 L360,240 Z" fill={colors.comp} />
            <text x="380" y="235" fill="white" fontSize="12" fontWeight="bold">#2 Pump</text>

            {/* Component: Filter/Tank */}
            <rect x="500" y="150" width="60" height="100" stroke={colors.comp} strokeWidth="2" fill="#1e293b" rx="4" />
            <path d="M530,100 L530,150" stroke={colors.line} strokeWidth="3" fill="none" />
            <path d="M530,250 L530,300" stroke={colors.line} strokeWidth="3" fill="none" />
            <text x="570" y="200" fill="white" fontSize="12" fontWeight="bold">Filter/Tank</text>

            {/* Flow Indicators */}
            <circle cx="250" cy="100" r="4" fill={colors.line} className="animate-ping" style={{animationDuration:'2s'}}/>
            <circle cx="450" cy="100" r="4" fill={colors.line} className="animate-ping" style={{animationDuration:'2s', animationDelay:'0.5s'}}/>
            <circle cx="650" cy="300" r="4" fill={colors.line} className="animate-ping" style={{animationDuration:'2s', animationDelay:'1s'}}/>

            {/* Sensors */}
            <g transform="translate(600, 80)">
                <circle cx="0" cy="0" r="10" stroke="#94a3b8" fill="#0f172a" />
                <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#94a3b8">P</text>
                <line x1="0" y1="10" x2="0" y2="20" stroke="#94a3b8" />
            </g>
            <g transform="translate(650, 80)">
                <circle cx="0" cy="0" r="10" stroke="#94a3b8" fill="#0f172a" />
                <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#94a3b8">T</text>
                <line x1="0" y1="10" x2="0" y2="20" stroke="#94a3b8" />
            </g>
        </svg>
        
        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded border border-slate-700 text-xs text-slate-300">
            P&ID View: {systemId.toUpperCase().replace('-', ' ')}
        </div>
    </div>
  );
};

export const HydroAuxKbView: React.FC = () => {
  const [activeSystem, setActiveSystem] = useState<SystemId>('tech-water');
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentData = SYSTEM_DATA[activeSystem] || SYSTEM_DATA['tech-water'];
  const activeColor = SYSTEMS.find(s => s.id === activeSystem)?.color || '#0ea5e9';

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-900/50 pb-4 bg-gradient-to-r from-[#0f172a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <Settings size={14} /> Auxiliary Systems / 辅助系统
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水电站辅助系统 <span className="text-indigo-500">集成知识库</span>
          </h1>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-slate-300">System Healthy</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded text-xs">
                <RefreshCw size={12} className="text-indigo-400"/>
                <span className="text-slate-300">Sync Active</span>
            </div>
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索系统、参数或故障..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 transition-colors text-slate-200 placeholder:text-slate-600"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT SIDEBAR: System Navigator */}
        <div className="w-full lg:w-64 flex flex-col gap-3 overflow-y-auto pr-1">
           {SYSTEMS.map((sys) => (
             <button
               key={sys.id}
               onClick={() => setActiveSystem(sys.id as SystemId)}
               className={`group flex flex-col p-3 rounded border transition-all duration-300 relative overflow-hidden text-left
                 ${activeSystem === sys.id 
                   ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'}
               `}
             >
               {activeSystem === sys.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor: sys.color}}></div>
               )}
               
               <div className="flex items-center justify-between w-full mb-1">
                   <div className="flex items-center gap-2">
                       <div className={`${activeSystem === sys.id ? 'text-white' : 'text-slate-500'} transition-colors`} style={{color: activeSystem === sys.id ? sys.color : undefined}}>
                         {sys.icon}
                       </div>
                       <span className="font-bold text-sm">{sys.label}</span>
                   </div>
                   {activeSystem === sys.id && <ChevronRight size={14} style={{color: sys.color}} />}
               </div>
               <div className="text-[10px] opacity-60 pl-6">{sys.subLabel}</div>
             </button>
           ))}

           {/* Quick Access Documents */}
           <div className="mt-auto border-t border-slate-800 pt-4">
               <div className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Standards & Manuals</div>
               <div className="space-y-2">
                   <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
                       <FileText size={12} />
                       <span>GB/T 7894-2009 Gen. Specs</span>
                   </div>
                   <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
                       <FileText size={12} />
                       <span>Auxiliary O&M Manual</span>
                   </div>
               </div>
           </div>
        </div>

        {/* CENTER AREA: Main Workspace */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: P&ID Diagram */}
           <SciFiCard title={`${SYSTEMS.find(s => s.id === activeSystem)?.label} - 原理运行图`} subtitle="SCHEMATIC" className="h-[350px] border-indigo-900/50" noPadding>
               <div className="w-full h-full p-2 flex flex-col">
                   <div className="flex-1 relative">
                       <PIDSchematic systemId={activeSystem} />
                   </div>
                   {/* Diagram Legend/Control Bar */}
                   <div className="h-10 bg-slate-900/50 border-t border-slate-800 mt-2 flex items-center px-4 justify-between">
                       <div className="flex gap-4 text-xs text-slate-400">
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Running</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Stopped</div>
                           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Fault</div>
                       </div>
                       <div className="flex gap-2">
                           <button className="p-1 hover:bg-slate-700 rounded text-slate-400"><Search size={14}/></button>
                           <button className="p-1 hover:bg-slate-700 rounded text-slate-400"><RefreshCw size={14}/></button>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Bottom Split: Logic & Specs */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               
               {/* Logic Sequence */}
               <SciFiCard title="自动控制逻辑" subtitle="CONTROL FLOW" className="border-indigo-900/50">
                   <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                       {currentData.logic.length > 0 ? (
                           currentData.logic.map((step, idx) => (
                               <div key={idx} className="relative">
                                   {/* Node Dot */}
                                   <div className={`absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950
                                       ${step.type === 'auto' ? 'border-green-500' : step.type === 'protection' ? 'border-red-500' : 'border-yellow-500'}
                                   `}></div>
                                   
                                   {/* Content Card */}
                                   <div className="bg-slate-900/40 border border-slate-800 p-3 rounded hover:border-indigo-500/30 transition-colors">
                                       <div className="flex justify-between items-start mb-1">
                                           <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                                               {step.type === 'auto' ? <Play size={10}/> : step.type === 'protection' ? <AlertOctagon size={10}/> : <Settings size={10}/>}
                                               {step.type}
                                           </span>
                                           <span className="text-[10px] font-mono text-slate-600">Step {step.id}</span>
                                       </div>
                                       <div className="flex items-center gap-2 text-sm text-slate-300">
                                           <span className="font-mono text-xs text-indigo-300">IF</span> {step.condition}
                                       </div>
                                       <div className="flex items-center gap-2 text-sm font-bold text-white mt-1">
                                           <ArrowRight size={14} className="text-slate-500" /> {step.action}
                                       </div>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="text-slate-500 text-sm italic p-4">暂无逻辑数据 / No Logic Data</div>
                       )}
                   </div>
               </SciFiCard>

               {/* Component Parameters */}
               <SciFiCard title="关键组件参数" subtitle="REAL-TIME" className="border-indigo-900/50">
                   <div className="flex flex-col gap-3">
                       {currentData.components.length > 0 ? (
                           currentData.components.map((comp, idx) => (
                               <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                                   <div>
                                       <div className="text-xs font-bold text-slate-200">{comp.name}</div>
                                       <div className="flex items-center gap-1.5 mt-1">
                                           <span className={`w-1.5 h-1.5 rounded-full ${comp.status === 'Running' ? 'bg-green-500' : comp.status === 'Standby' ? 'bg-slate-500' : 'bg-red-500'}`}></span>
                                           <span className="text-[10px] text-slate-500 uppercase">{comp.status}</span>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-lg font-mono font-bold text-white" style={{color: activeColor}}>
                                           {comp.param}
                                       </div>
                                       <div className="text-[10px] text-slate-500">{comp.unit}</div>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="text-slate-500 text-sm italic p-4">暂无组件数据</div>
                       )}
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT SIDEBAR: Info & Faults */}
        <div className="w-full lg:w-72 flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Description Card */}
           <SciFiCard title="系统概述" className="border-slate-800">
               <p className="text-xs text-slate-400 leading-relaxed">
                   {currentData.desc}
               </p>
           </SciFiCard>

           {/* KPI Summary */}
           <SciFiCard title="运行指标 (KPI)" subtitle="STATUS" className="border-slate-800">
               <div className="space-y-3">
                   {currentData.kpis.map((kpi, idx) => (
                       <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0">
                           <span className="text-xs text-slate-400">{kpi.label}</span>
                           <span className={`text-sm font-bold font-mono ${kpi.status === 'warning' ? 'text-yellow-500' : 'text-slate-200'}`}>
                               {kpi.value}
                           </span>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Fault Library */}
           <SciFiCard title="常见故障库" subtitle="KB" className="flex-1 border-slate-800">
               <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar" style={{maxHeight: '300px'}}>
                   {currentData.faults.length > 0 ? (
                       currentData.faults.map((fault, idx) => (
                           <div key={idx} className="bg-red-900/10 border border-red-900/30 p-3 rounded group hover:bg-red-900/20 transition-colors cursor-pointer">
                               <div className="flex justify-between mb-1">
                                   <span className="text-xs font-bold text-red-400">{fault.code}</span>
                                   <AlertTriangle size={12} className="text-red-500" />
                               </div>
                               <div className="text-xs font-bold text-slate-300 mb-1">{fault.desc}</div>
                               <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                                   <span className="font-bold">解:</span> {fault.solution}
                               </div>
                           </div>
                       ))
                   ) : (
                       <div className="text-slate-500 text-xs text-center py-4">无故障记录</div>
                   )}
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
