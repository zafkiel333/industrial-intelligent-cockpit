
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Database, Zap, Activity, Settings, 
  FileText, AlertTriangle, CheckCircle2, 
  ChevronRight, Folder, Layers, Search,
  Wrench, Clipboard, Download, Server,
  Cpu, Thermometer
} from 'lucide-react';

// --- Mock Data ---

const SYSTEM_TREE = [
  {
    id: 'generator',
    label: '发电机本体 (Generator)',
    children: [
      { id: 'stator', label: '定子系统 (Stator)', icon: <Layers size={14}/> },
      { id: 'rotor', label: '转子系统 (Rotor)', icon: <RotateIcon /> },
      { id: 'bearing', label: '推力/导轴承 (Bearings)', icon: <Settings size={14}/> },
    ]
  },
  {
    id: 'turbine',
    label: '水轮机 (Turbine)',
    children: [
      { id: 'runner', label: '转轮 (Runner)', icon: <FanIcon /> },
      { id: 'guide-vane', label: '导水机构 (Distributor)', icon: <WindIcon /> },
      { id: 'main-shaft', label: '主轴 (Main Shaft)', icon: <CylinderIcon /> },
    ]
  },
  {
    id: 'auxiliary',
    label: '辅助系统 (Auxiliary)',
    children: [
      { id: 'governor', label: '调速器 (Governor)', icon: <Cpu size={14}/> },
      { id: 'cooling', label: '冷却系统 (Cooling)', icon: <Thermometer size={14}/> },
    ]
  }
];

const COMPONENT_DB: Record<string, any> = {
  'stator': {
    title: '定子机座与铁芯 (Stator Frame & Core)',
    model: 'SF700-42/14300',
    description: '由机座、铁芯和绕组组成。机座采用焊接钢板结构，铁芯由0.5mm低损耗硅钢片叠压而成。',
    params: [
      { label: '额定电压', value: '18.0 kV' },
      { label: '额定电流', value: '24,500 A' },
      { label: '铁芯内径', value: '14,300 mm' },
      { label: '铁芯长度', value: '2,850 mm' },
      { label: '槽数', value: '540' },
      { label: '绝缘等级', value: 'Class F' },
    ],
    fmea: [
      { mode: '绝缘击穿', cause: '局部放电/老化', severity: 'High', detection: '局放监测 (PD)' },
      { mode: '铁芯松动', cause: '热胀冷缩/振动', severity: 'Med', detection: '振动频谱' },
      { mode: '冷却管堵塞', cause: '水质差/结垢', severity: 'High', detection: '定子温升' },
    ],
    maintenance: [
      { task: '定子绝缘电阻测试', cycle: '每年', last: '2023-11-15', status: 'Normal' },
      { task: '槽楔紧度检查', cycle: '大修期', last: '2020-05-20', status: 'Pending' },
      { task: '端部绑扎检查', cycle: '每年', last: '2023-11-16', status: 'Normal' },
    ],
    healthIndex: 92,
    docs: ['Stator_Assembly_Dwgs.pdf', 'Insulation_Test_Report_2023.xlsx']
  },
  'rotor': {
    title: '转子磁极与支架 (Rotor Poles & Spider)',
    model: 'R-700MW-Gen',
    description: '采用圆盘式支架结构，磁极挂装在磁轭上。阻尼绕组用于提高系统稳定性。',
    params: [
      { label: '磁极数量', value: '80 Poles' },
      { label: '转子外径', value: '14,280 mm' },
      { label: '飞逸转速', value: '145 rpm' },
      { label: '总重量', value: '1,850 t' },
      { label: '励磁电压', value: '450 V' },
      { label: '励磁电流', value: '3,200 A' },
    ],
    fmea: [
      { mode: '匝间短路', cause: '绝缘损坏', severity: 'High', detection: '磁通探头' },
      { mode: '磁极键松动', cause: '离心力/热变形', severity: 'High', detection: '气隙监测' },
    ],
    maintenance: [
      { task: '磁极压板螺栓力矩', cycle: '3年', last: '2021-04-10', status: 'Normal' },
      { task: '集电环碳刷更换', cycle: '每月', last: '2023-12-01', status: 'Normal' },
    ],
    healthIndex: 88,
    docs: ['Rotor_Balancing_Record.pdf', 'Pole_Mounting_Procedure.doc']
  },
  'runner': {
    title: '混流式转轮 (Francis Runner)',
    model: 'HL-240-LJ-850',
    description: '高水头混流式转轮，X叶片设计，抗气蚀性能优化的不锈钢焊接结构。',
    params: [
      { label: '转轮直径', value: '8.5 m' },
      { label: '叶片数', value: '15' },
      { label: '材质', value: '0Cr13Ni5Mo' },
      { label: '额定水头', value: '185 m' },
      { label: '最大流量', value: '420 m³/s' },
      { label: '空化系数', value: 'σ ≤ 0.04' },
    ],
    fmea: [
      { mode: '气蚀点蚀', cause: '低负荷运行/尾水位低', severity: 'Med', detection: '停机目检' },
      { mode: '叶片裂纹', cause: '疲劳/铸造缺陷', severity: 'High', detection: '无损探伤' },
    ],
    maintenance: [
      { task: '气蚀补焊修复', cycle: 'C修', last: '2022-09-01', status: 'Normal' },
      { task: '止漏环间隙测量', cycle: '每年', last: '2023-10-05', status: 'Warning' },
    ],
    healthIndex: 85,
    docs: ['Runner_CFD_Analysis.pdf', 'Cavitation_Repair_Log.xlsx']
  }
};

const DEFAULT_DATA = COMPONENT_DB['stator'];

// Custom Icons
function RotateIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}
function FanIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M14.7 7.4a4 4 0 0 1 4.3 .6"/><path d="M16.6 14.7a4 4 0 0 1 .6 4.3"/><path d="M9.3 16.6a4 4 0 0 1 -4.3 -.6"/><path d="M7.4 9.3a4 4 0 0 1 -.6 -4.3"/></svg>;
}
function WindIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19c0-1.7-1.3-3-3-3c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.7 0 3 1.3 3 3"/><path d="M2 12h.01"/><path d="M12 22h.01"/><path d="M22 12h.01"/><path d="M12 2h.01"/></svg>;
}
function CylinderIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 6v12"/><path d="M19 6v12"/><path d="M5 18a7 3 0 0 0 14 0"/><path d="M5 6a7 3 0 0 1 14 0"/><path d="M5 6a7 3 0 0 0 14 0"/></svg>;
}

// --- Components ---

const BlueprintSchematic = ({ activeId, onSelect }: { activeId: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#081b2e] rounded overflow-hidden select-none border border-cyan-900/30">
        {/* Grid Background */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.1
        }}></div>

        <svg viewBox="0 0 600 400" className="w-full h-full">
            <defs>
                <pattern id="hatch_blue" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="4" height="8" transform="translate(0,0)" fill="#0ea5e9" fillOpacity="0.1"></rect>
                </pattern>
            </defs>

            {/* Generator Stator (Outer) */}
            <g onClick={() => onSelect('stator')} className={`cursor-pointer transition-all ${activeId === 'stator' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
                <path d="M150,50 L450,50 L450,150 L150,150 Z" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                <rect x="160" y="50" width="280" height="100" fill="url(#hatch_blue)" />
                <text x="300" y="40" fill="#0ea5e9" fontSize="12" textAnchor="middle">STATOR</text>
            </g>

            {/* Rotor (Inner) */}
            <g onClick={() => onSelect('rotor')} className={`cursor-pointer transition-all ${activeId === 'rotor' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
                <path d="M200,60 L400,60 L400,140 L200,140 Z" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" fillOpacity="0.3" />
                <text x="300" y="105" fill="#60a5fa" fontSize="12" textAnchor="middle" dominantBaseline="middle">ROTOR</text>
            </g>

            {/* Shaft */}
            <g onClick={() => onSelect('main-shaft')} className={`cursor-pointer transition-all ${activeId === 'main-shaft' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
                <rect x="280" y="140" width="40" height="120" fill="#334155" stroke="#94a3b8" />
            </g>

            {/* Turbine Runner */}
            <g onClick={() => onSelect('runner')} className={`cursor-pointer transition-all ${activeId === 'runner' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}>
                <path d="M200,260 Q300,320 400,260 L380,300 Q300,360 220,300 Z" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" fillOpacity="0.4" />
                <text x="300" y="320" fill="#2dd4bf" fontSize="12" textAnchor="middle">RUNNER</text>
            </g>

            {/* Bearings */}
            <g onClick={() => onSelect('bearing')}>
                <rect x="260" y="130" width="80" height="20" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" className="cursor-pointer hover:fill-opacity-40"/>
                <text x="350" y="140" fill="#f59e0b" fontSize="10">Thrust Bearing</text>
            </g>

            {/* Connecting Lines */}
            <line x1="50" y1="50" x2="150" y2="50" stroke="#1e40af" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="50" y1="350" x2="550" y2="350" stroke="#1e40af" strokeWidth="1" />
        </svg>

        {/* Labels */}
        <div className="absolute bottom-2 right-2 text-[10px] text-cyan-500 bg-black/60 px-2 py-1 rounded border border-cyan-800">
            SCHEMATIC VIEW: V-2.4
        </div>
    </div>
  );
};

export const HydroGenKbView: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState('stator');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = COMPONENT_DB[selectedCompId] || COMPONENT_DB['stator'];

  // Radar Data for Health/Performance
  const radarData = [
    { subject: 'Reliability', A: currentData.healthIndex, fullMark: 100 },
    { subject: 'Efficiency', A: 95, fullMark: 100 },
    { subject: 'Maintenance', A: 85, fullMark: 100 },
    { subject: 'Safety', A: 98, fullMark: 100 },
    { subject: 'Cost', A: 70, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0a1020] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Database size={14} /> Industrial Knowledge Base
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水轮发电机组 <span className="text-cyan-500">设备档案</span>
          </h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
            <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索组件、参数或故障代码..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder:text-slate-600"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT SIDEBAR: Component Hierarchy */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 overflow-y-auto pr-1">
           <SciFiCard title="机组结构树 (BOM)" subtitle="HIERARCHY" className="h-full border-cyan-900/50">
              <div className="space-y-4">
                 {SYSTEM_TREE.map(sys => (
                    <div key={sys.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase bg-slate-800/50 p-1.5 rounded">
                            <Server size={12} /> {sys.label}
                        </div>
                        <div className="pl-2 space-y-1">
                            {sys.children.map(child => (
                                <button 
                                  key={child.id}
                                  onClick={() => setSelectedCompId(child.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded border transition-all text-sm
                                     ${selectedCompId === child.id 
                                        ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                                  `}
                                >
                                    <span className={`${selectedCompId === child.id ? 'text-cyan-400' : 'text-slate-600'}`}>{child.icon}</span>
                                    <span className="flex-1 text-left">{child.label.split(' ')[0]}</span>
                                    {selectedCompId === child.id && <ChevronRight size={12} className="text-cyan-500"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* CENTER & RIGHT: Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Identity & Blueprint */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[320px]">
               {/* Identity Card */}
               <div className="xl:col-span-2 flex flex-col gap-4">
                   <div className="flex-1 bg-[#0b1221] border border-cyan-900/30 rounded p-6 flex flex-col justify-between relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Zap size={120} className="text-cyan-500" />
                       </div>
                       
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-300 text-xs font-bold border border-cyan-700/50 rounded">Core Component</span>
                               <span className="text-xs text-slate-500 font-mono">PN: {currentData.model}</span>
                           </div>
                           <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{currentData.title}</h2>
                           <p className="text-slate-400 text-sm max-w-2xl">{currentData.description}</p>
                       </div>

                       <div className="grid grid-cols-3 gap-4 mt-6">
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                               <div className="text-[10px] text-slate-500 uppercase mb-1">Health Index</div>
                               <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                                   {currentData.healthIndex} <span className="text-xs font-normal text-slate-600">/ 100</span>
                               </div>
                           </div>
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                               <div className="text-[10px] text-slate-500 uppercase mb-1">Maintenance Status</div>
                               <div className="text-sm font-bold text-cyan-300 flex items-center gap-2 mt-1">
                                   <CheckCircle2 size={16} /> Operational
                               </div>
                           </div>
                           <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                               <div className="text-[10px] text-slate-500 uppercase mb-1">Last Update</div>
                               <div className="text-sm font-mono text-slate-300 mt-1">2024-03-15</div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Blueprint Mini */}
               <SciFiCard title="组件结构图解" subtitle="SCHEMATIC" className="border-cyan-900/50" noPadding>
                   <div className="w-full h-full p-2">
                       <BlueprintSchematic activeId={selectedCompId} onSelect={setSelectedCompId} />
                   </div>
               </SciFiCard>
           </div>

           {/* Row 2: Specs, FMEA, Maintenance (3 Columns) */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Col 1: Technical Specs */}
               <SciFiCard title="技术参数表" subtitle="SPECIFICATIONS" className="border-slate-800">
                   <div className="space-y-0.5">
                       {currentData.params.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between items-center p-2.5 hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 transition-colors">
                               <span className="text-xs text-slate-400">{item.label}</span>
                               <span className="text-sm font-mono font-bold text-slate-200">{item.value}</span>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

               {/* Col 2: FMEA */}
               <SciFiCard title="失效模式分析 (FMEA)" subtitle="RISK MATRIX" className="border-slate-800">
                   <div className="flex flex-col gap-3">
                       {currentData.fmea.map((item: any, i: number) => (
                           <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-red-900/50 transition-colors group">
                               <div className="flex justify-between items-start mb-1">
                                   <span className="text-sm font-bold text-slate-200 group-hover:text-red-300">{item.mode}</span>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.severity === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                       {item.severity}
                                   </span>
                               </div>
                               <div className="text-xs text-slate-500 mb-1">原因: {item.cause}</div>
                               <div className="flex items-center gap-1 text-[10px] text-cyan-600">
                                   <Activity size={10} /> 监测手段: {item.detection}
                               </div>
                           </div>
                       ))}
                   </div>
               </SciFiCard>

               {/* Col 3: Maintenance Strategy */}
               <SciFiCard title="维护策略与记录" subtitle="LOGS" className="border-slate-800">
                   <div className="flex flex-col gap-3">
                       {currentData.maintenance.map((task: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/20 border border-slate-800">
                               <div className="flex items-center gap-3">
                                   <div className={`p-1.5 rounded-full ${task.status === 'Normal' ? 'bg-green-900/20 text-green-500' : 'bg-orange-900/20 text-orange-500'}`}>
                                       <Wrench size={12} />
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-slate-300">{task.task}</div>
                                       <div className="text-[10px] text-slate-500">周期: {task.cycle}</div>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-500">{task.last}</div>
                                   <div className={`text-[10px] ${task.status === 'Normal' ? 'text-green-500' : 'text-orange-500'}`}>{task.status}</div>
                               </div>
                           </div>
                       ))}
                       <button className="mt-auto w-full py-1.5 border border-dashed border-slate-700 text-slate-500 text-xs rounded hover:text-cyan-400 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-2">
                           <Clipboard size={12} /> 生成维护工单
                       </button>
                   </div>
               </SciFiCard>

           </div>

           {/* Row 3: Evaluation & Docs */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
               
               {/* Evaluation Radar */}
               <SciFiCard title="组件综合评估" subtitle="METRICS" className="h-64 border-cyan-900/30">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                               <PolarGrid stroke="#334155" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                               <Radar name="Evaluation" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#e2e8f0'}} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               {/* Documentation */}
               <SciFiCard title="技术文档库" subtitle="ASSETS" className="h-64 border-cyan-900/30">
                   <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                       {currentData.docs?.map((doc: string, i: number) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-cyan-500/30 transition-colors group cursor-pointer">
                               <div className="flex items-center gap-3">
                                   <FileText size={16} className="text-slate-500 group-hover:text-cyan-400" />
                                   <span className="text-sm text-slate-300 group-hover:text-white">{doc}</span>
                               </div>
                               <Download size={14} className="text-slate-600 group-hover:text-cyan-500" />
                           </div>
                       ))}
                       <div className="mt-auto p-3 bg-cyan-900/10 border border-cyan-900/30 rounded text-xs text-cyan-200/70">
                           * 知识库定期从集团PDM系统同步，如需最新图纸请联系技术部。
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
