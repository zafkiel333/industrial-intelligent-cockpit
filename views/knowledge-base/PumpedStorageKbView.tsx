import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  Database, Zap, Activity, Settings, 
  ArrowUp, ArrowDown, Repeat, BatteryCharging,
  ChevronRight, FileText, AlertCircle, PlayCircle,
  Timer, Layers, BarChart4, Search, GitBranch, CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

// 1. System Structure
const SYSTEM_TREE = [
  {
    id: 'reversible-unit',
    label: '可逆式机组本体',
    children: [
      { id: 'pump-turbine', label: '水泵水轮机 (Pump-Turbine)', icon: <Repeat size={14}/> },
      { id: 'motor-generator', label: '发电电动机 (Motor-Generator)', icon: <Zap size={14}/> },
      { id: 'main-shaft', label: '主轴与轴承 (Shaft System)', icon: <Settings size={14}/> },
    ]
  },
  {
    id: 'water-conveyance',
    label: '输水系统',
    children: [
      { id: 'penstock', label: '高压压力钢管 (Penstock)', icon: <ArrowDown size={14}/> },
      { id: 'ball-valve', label: '进水球阀 (Inlet Ball Valve)', icon: <Activity size={14}/> },
      { id: 'draft-tube', label: '尾水管 (Draft Tube)', icon: <ArrowUp size={14}/> },
    ]
  },
  {
    id: 'electrical-control',
    label: '电气与控制',
    children: [
      { id: 'sfc', label: '变频启动装置 (SFC)', icon: <BatteryCharging size={14}/> },
      { id: 'governor', label: '调速系统 (Governor)', icon: <BarChart4 size={14}/> },
    ]
  }
];

// 2. Component Knowledge Database
const COMPONENT_DB: Record<string, any> = {
  'pump-turbine': {
    title: '高水头可逆式水泵水轮机',
    model: 'RPT-350-Vertical',
    description: '单级混流可逆式转轮，具备四象限运行能力。针对高水头（>500m）工况优化了S形特性区，减少并网时的水力不稳定。',
    params: [
      { label: '额定水头', value: '540 m' },
      { label: '最大扬程', value: '575 m' },
      { label: '额定转速', value: '500 rpm' },
      { label: '转轮直径', value: '4.85 m' },
      { label: '导叶高度', value: '0.45 m' },
      { label: '吸出高度', value: '-65 m' },
    ],
    modeCharacteristics: [
      { mode: '发电工况', power: '306 MW', eff: '92.5%', vibration: '0.08 mm' },
      { mode: '抽水工况', power: '320 MW', eff: '91.8%', vibration: '0.12 mm' },
      { mode: '调相工况', power: '-15 MW', eff: 'N/A', vibration: '0.05 mm' },
    ],
    maintenance: [
      { item: '顶盖螺栓超声波探伤', cycle: 'C级检修', last: '2023-05', status: 'Normal' },
      { item: '导叶抗磨板检查', cycle: 'A级检修', last: '2020-12', status: 'Normal' },
      { item: '转轮迷宫环间隙测量', cycle: '每年', last: '2024-01', status: 'Warning' },
    ],
    faults: [
      { code: 'H-01', name: 'S形特性区压力脉动', desc: '低负荷并网时尾水管压力脉动超标', solution: '优化导叶关闭规律，避开不稳定区' },
      { code: 'H-03', name: '水泵工况驼峰区不稳', desc: '启动过程中流量震荡', solution: '调整球阀与导叶协联关系' },
    ],
    docs: ['Hydraulic_Model_Test_Report.pdf', 'Runner_Crack_Analysis.docx']
  },
  'sfc': {
    title: '静止变频启动装置 (SFC)',
    model: 'SFC-20MW-LCI',
    description: '用于机组抽水工况的软启动，将电网工频电源变换为频率可调的电流，拖动同步电机从静止加速至额定转速。',
    params: [
      { label: '额定容量', value: '22 MW' },
      { label: '输出频率', value: '0 - 50 Hz' },
      { label: '整流方式', value: 'LCI (12-pulse)' },
      { label: '冷却方式', value: '纯水冷却' },
    ],
    modeCharacteristics: [
      { mode: '软启动', power: 'Variable', eff: '98%', vibration: 'Low' },
    ],
    maintenance: [
      { item: '晶闸管均压电阻测试', cycle: '每年', last: '2023-11', status: 'Normal' },
      { item: '纯水冷却电导率检测', cycle: '每周', last: '2024-02', status: 'Normal' },
    ],
    faults: [
      { code: 'E-502', name: '换相失败', desc: '电机反电势不足或触发脉冲丢失', solution: '检查转子位置检测及脉冲放大板' },
    ],
    docs: ['SFC_Schematic_V2.pdf', 'Thyristor_Maintenance_Guide.pdf']
  }
};

const DEFAULT_DATA = COMPONENT_DB['pump-turbine'];

// 3. Efficiency Curves (Generating vs Pumping)
const EFFICIENCY_DATA = Array.from({length: 20}, (_, i) => {
  const load = i * 5 + 5; // 5% to 100%
  // Generation: Classic hill curve
  const genEff = load < 40 ? 0 : 92 - Math.pow((load - 85), 2) * 0.02;
  // Pumping: Narrower operating range
  const pumpEff = load < 80 ? 0 : 91 - Math.pow((load - 95), 2) * 0.05;
  
  return { load, genEff: Math.max(0, genEff), pumpEff: Math.max(0, pumpEff) };
});

// 4. Mode Switching Timeline (Sequence Knowledge)
const SEQ_STEPS = [
  { step: 'Stop -> Gen', time: 90, label: '静止转发电', color: '#10b981' },
  { step: 'Stop -> Pump', time: 360, label: '静止转抽水', color: '#3b82f6' },
  { step: 'Gen -> Pump', time: 480, label: '发电转抽水', color: '#f59e0b' },
  { step: 'Pump -> Gen', time: 240, label: '抽水转发电', color: '#8b5cf6' },
];

// --- Sub-Components ---

const ElevationSchematic = ({ activeId, onSelect }: { activeId: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#0f172a] rounded-lg overflow-hidden select-none border border-slate-800">
       {/* Background / Sky */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]"></div>
       
       <svg viewBox="0 0 800 400" className="w-full h-full relative z-10">
          <defs>
             <linearGradient id="waterGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9"/>
             </linearGradient>
             <pattern id="rockPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#334155"/>
                <path d="M0 20L20 0" stroke="#475569" strokeWidth="1"/>
             </pattern>
          </defs>

          {/* Topography */}
          <path d="M0,100 L150,100 Q200,100 220,150 L300,300 L500,300 L550,250 L800,250 L800,400 L0,400 Z" fill="url(#rockPattern)" stroke="#64748b" />

          {/* Upper Reservoir */}
          <path d="M0,110 L180,110 L150,150 L0,150 Z" fill="url(#waterGradient)" className="animate-pulse" style={{animationDuration: '4s'}}/>
          <text x="50" y="90" fill="#0ea5e9" fontSize="12" fontWeight="bold">上水库 (Upper Res)</text>
          <text x="50" y="105" fill="#94a3b8" fontSize="10">EL. 850m</text>

          {/* Penstock (Pipe) */}
          <g onClick={() => onSelect('penstock')} className="cursor-pointer hover:opacity-80">
             <path d="M160,130 L320,320" stroke="#cbd5e1" strokeWidth="12" fill="none" />
             <path d="M160,130 L320,320" stroke="#0ea5e9" strokeWidth="8" fill="none" strokeDasharray="10 10" className="animate-[dash_1s_linear_infinite]" />
          </g>

          {/* Powerhouse (Underground) */}
          <rect x="300" y="280" width="120" height="80" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
          
          {/* Main Unit (Inside Powerhouse) */}
          <circle cx="360" cy="320" r="25" fill="#f59e0b" className={`cursor-pointer ${activeId.includes('turbine') || activeId.includes('motor') ? 'stroke-white stroke-2' : ''}`} onClick={() => onSelect('pump-turbine')} />
          <text x="360" y="325" fill="#78350f" fontSize="10" textAnchor="middle" fontWeight="bold">M/G</text>
          
          {/* Ball Valve */}
          <rect x="310" y="310" width="15" height="20" fill="#ef4444" className="cursor-pointer" onClick={() => onSelect('ball-valve')} />

          {/* Tailrace / Draft Tube */}
          <path d="M400,320 L550,280" stroke="#cbd5e1" strokeWidth="12" fill="none" onClick={() => onSelect('draft-tube')} className="cursor-pointer" />

          {/* Lower Reservoir */}
          <path d="M520,280 L800,280 L800,350 L500,350 Z" fill="url(#waterGradient)" className="animate-pulse" style={{animationDuration: '5s'}} />
          <text x="700" y="270" fill="#0ea5e9" fontSize="12" fontWeight="bold">下水库 (Lower Res)</text>
          <text x="700" y="285" fill="#94a3b8" fontSize="10">EL. 310m</text>

          {/* Indicators */}
          <line x1="360" y1="320" x2="360" y2="110" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 5" />
          <text x="365" y="200" fill="#f59e0b" fontSize="12">Rated Head: 540m</text>
       </svg>
    </div>
  );
};

export const PumpedStorageKbView: React.FC = () => {
  const [activeCompId, setActiveCompId] = useState('pump-turbine');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = COMPONENT_DB[activeCompId] || COMPONENT_DB['pump-turbine'];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-green-900/50 pb-4 bg-gradient-to-r from-[#022c22] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-green-400 mb-1 uppercase tracking-wider">
             <Database size={14} /> Energy Storage Assets
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             抽水蓄能机组 <span className="text-green-500">设备档案库</span>
          </h1>
        </div>
        
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder="搜索组件、工况参数或故障代码..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500 transition-colors text-slate-200 placeholder:text-slate-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: System Tree */}
        <div className="w-full lg:w-64 flex flex-col gap-4 overflow-y-auto pr-1">
           <div className="p-3 bg-slate-900/50 border border-slate-700 rounded mb-2">
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Station Config</div>
               <div className="text-sm font-bold text-white">4 x 350MW</div>
               <div className="text-[10px] text-green-400">Total: 1400MW</div>
           </div>

           <div className="space-y-1">
               {SYSTEM_TREE.map(sys => (
                   <div key={sys.id} className="mb-2">
                       <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/30 rounded mb-1 flex items-center gap-2">
                           <Layers size={10} /> {sys.label}
                       </div>
                       {sys.children.map(item => (
                           <button 
                             key={item.id}
                             onClick={() => setActiveCompId(item.id)}
                             className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all text-left border-l-2
                                ${activeCompId === item.id 
                                    ? 'bg-green-950/40 text-green-300 border-green-500 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' 
                                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                             `}
                           >
                               <span className={activeCompId === item.id ? 'text-green-400' : 'text-slate-500'}>{item.icon}</span>
                               {item.label.split('(')[0]}
                           </button>
                       ))}
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Visuals & Modes */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top: Elevation Diagram */}
           <SciFiCard title="电站水力系统剖面 (Hydraulic Elevation)" subtitle="INTERACTIVE SCHEMATIC" className="h-[320px] border-green-900/50" noPadding>
               <div className="w-full h-full p-2">
                   <ElevationSchematic activeId={activeCompId} onSelect={setActiveCompId} />
               </div>
           </SciFiCard>

           {/* Middle: Efficiency Curves */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SciFiCard title="水泵/水轮机特性曲线" subtitle="EFFICIENCY" className="border-green-900/50">
                   <div className="h-56 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={EFFICIENCY_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="load" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Load %', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#22c55e', fontSize: '12px'}} />
                               <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                               <Line type="monotone" dataKey="genEff" name="Generation Eff (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                               <Line type="monotone" dataKey="pumpEff" name="Pumping Eff (%)" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                           </ComposedChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="工况转换时序参考" subtitle="SEQUENCE" className="border-green-900/50">
                   <div className="flex flex-col gap-3 h-56 justify-center">
                       {SEQ_STEPS.map((seq, i) => (
                           <div key={i} className="flex items-center gap-3">
                               <div className="w-24 text-xs font-bold text-slate-300 text-right">{seq.step}</div>
                               <div className="flex-1 bg-slate-800 h-6 rounded overflow-hidden relative group cursor-pointer">
                                   <div 
                                     className="h-full flex items-center px-2 text-[10px] text-black font-bold whitespace-nowrap transition-all group-hover:opacity-90"
                                     style={{width: `${(seq.time/500)*100}%`, backgroundColor: seq.color}}
                                   >
                                      {seq.label}
                                   </div>
                               </div>
                               <div className="w-12 text-xs font-mono text-slate-400">{seq.time}s</div>
                           </div>
                       ))}
                       <div className="text-[10px] text-slate-500 text-center mt-2 border-t border-slate-800 pt-2">
                           * 标准流程耗时，实际受水头及电网条件影响。
                       </div>
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Component Details */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Identity & Specs */}
           <SciFiCard title="组件技术档案" subtitle="DETAILS" className="border-green-900/50">
               <div className="mb-4 pb-4 border-b border-slate-800">
                   <h2 className="text-lg font-bold text-white mb-1">{currentData.title}</h2>
                   <div className="flex justify-between items-center text-xs text-slate-400">
                       <span className="font-mono bg-slate-800 px-2 py-0.5 rounded">Model: {currentData.model}</span>
                       <span className="flex items-center gap-1"><FileText size={10} /> v2.4</span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 leading-relaxed">{currentData.description}</p>
               </div>

               <div className="grid grid-cols-2 gap-2 mb-4">
                   {currentData.params.map((p: any, i: number) => (
                       <div key={i} className="bg-slate-900/40 p-2 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500 uppercase">{p.label}</div>
                           <div className="text-sm font-bold text-slate-200">{p.value}</div>
                       </div>
                   ))}
               </div>

               {/* Mode Comparison Table */}
               {currentData.modeCharacteristics && (
                   <div className="overflow-x-auto mb-4">
                       <table className="w-full text-[10px] text-left">
                           <thead className="text-slate-500 bg-slate-900">
                               <tr>
                                   <th className="p-1">Mode</th>
                                   <th className="p-1">Power</th>
                                   <th className="p-1">Eff</th>
                                   <th className="p-1">Vib</th>
                               </tr>
                           </thead>
                           <tbody className="text-slate-300">
                               {currentData.modeCharacteristics.map((m: any, i: number) => (
                                   <tr key={i} className="border-b border-slate-800 last:border-0">
                                       <td className="p-1 font-bold text-green-400">{m.mode}</td>
                                       <td className="p-1">{m.power}</td>
                                       <td className="p-1">{m.eff}</td>
                                       <td className="p-1">{m.vibration}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
           </SciFiCard>

           {/* Maintenance & Faults */}
           <SciFiCard title="运维与故障库" subtitle="O&M" className="flex-1 border-green-900/50">
               <div className="flex flex-col gap-4 h-full">
                   
                   {/* Maintenance Tasks */}
                   <div>
                       <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Settings size={12}/> Maintenance Plan</div>
                       <div className="space-y-2">
                           {currentData.maintenance.map((m: any, i: number) => (
                               <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 border border-slate-800 rounded">
                                   <div>
                                       <div className="text-xs text-slate-200">{m.item}</div>
                                       <div className="text-[10px] text-slate-500">Cycle: {m.cycle} • Last: {m.last}</div>
                                   </div>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${m.status === 'Normal' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                       {m.status}
                                   </span>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Fault Library */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar" style={{minHeight: '100px'}}>
                       <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><AlertCircle size={12}/> Common Faults</div>
                       <div className="space-y-2">
                           {currentData.faults.map((f: any, i: number) => (
                               <div key={i} className="p-2 border border-red-900/30 bg-red-900/10 rounded group hover:bg-red-900/20 transition-colors">
                                   <div className="flex justify-between mb-1">
                                       <span className="text-xs font-bold text-red-300">{f.code} {f.name}</span>
                                   </div>
                                   <div className="text-[10px] text-slate-400 mb-1">{f.desc}</div>
                                   <div className="text-[10px] text-green-400 flex gap-1 items-center">
                                       <CheckCircle2 size={10} /> {f.solution}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 transition-colors flex items-center justify-center gap-2">
                       <Database size={12} /> Access Full History
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};