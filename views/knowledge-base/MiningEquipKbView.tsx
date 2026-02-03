
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Search, Database, Hammer, Wrench, Pickaxe, 
  ChevronRight, FileText, AlertTriangle, CheckCircle2, 
  Settings, Zap, BarChart3, Layers, Microscope, 
  HardDrive, BookOpen
} from 'lucide-react';

// --- Mock Data ---

const EQUIPMENT_TREE = [
  { id: 'excavation', label: '采掘机械 (Excavation)', icon: <Pickaxe />, color: '#ef4444' },
  { id: 'transport', label: '运输机械 (Transport)', icon: <Layers />, color: '#f59e0b' },
  { id: 'support', label: '支护设备 (Support)', icon: <Hammer />, color: '#6366f1' },
  { id: 'ventilation', label: '通风安保 (Ventilation)', icon: <WindIcon />, color: '#10b981' },
];

const EQUIPMENT_DETAILS: Record<string, any> = {
  'excavation': {
    title: 'EBZ-260 悬臂式掘进机',
    model: 'Roadheader EBZ-260H',
    description: '适用于半煤岩及全岩巷道掘进。具备截割力大、机身稳定性好、智能截割成形控制等特点。',
    specs: [
      { label: '截割功率', value: '260 kW' },
      { label: '定位截割高度', value: '5.2 m' },
      { label: '定位截割宽度', value: '6.5 m' },
      { label: '经济截割硬度', value: '≤ 80 MPa (f8)' },
      { label: '整机重量', value: '95 t' },
      { label: '爬坡能力', value: '±18°' },
    ],
    maintenance: [
      { task: '截齿磨损检查', interval: '每班', status: 'Pending', criticality: 'High' },
      { task: '截割头润滑', interval: '8 hrs', status: 'OK', criticality: 'Medium' },
      { task: '液压油滤芯更换', interval: '500 hrs', status: 'OK', criticality: 'Low' },
    ],
    adaptability: [
      { subject: '岩石硬度适应性', A: 85, fullMark: 100 },
      { subject: '爬坡能力', A: 90, fullMark: 100 },
      { subject: '巷道断面', A: 95, fullMark: 100 },
      { subject: '排渣效率', A: 80, fullMark: 100 },
      { subject: '除尘效果', A: 88, fullMark: 100 },
      { subject: '维护便捷性', A: 75, fullMark: 100 },
    ],
    faultLibrary: [
      { code: 'H-001', title: '截割电机过载', cause: '岩石硬度突变或进刀量过大', solution: '降低推进速度，退出截割头重新进刀。' },
      { code: 'H-003', title: '星轮卡死', cause: '大块矸石或铁器卡入', solution: '停机反转星轮，人工清理异物。' },
      { code: 'E-202', title: '主泵压力异常', cause: '溢流阀设定值漂移或泵磨损', solution: '重新校定溢流阀压力，检查泵容积效率。' },
    ]
  },
  'transport': {
    title: 'SGZ-1000 刮板输送机',
    model: 'Scraper Conveyor Heavy-Duty',
    description: '综采工作面核心运输设备，高强度中部槽设计，适应大采高、大运量需求。',
    specs: [
      { label: '装机功率', value: '2 x 855 kW' },
      { label: '输送量', value: '2500 t/h' },
      { label: '链速', value: '1.45 m/s' },
      { label: '链条规格', value: '42 x 137 mm' },
    ],
    maintenance: [
      { task: '链条张紧度调整', interval: 'Weekly', status: 'OK', criticality: 'High' },
      { task: '减速机油温监测', interval: 'Real-time', status: 'OK', criticality: 'Medium' },
    ],
    adaptability: [
      { subject: '运量匹配', A: 95, fullMark: 100 },
      { subject: '耐磨性', A: 90, fullMark: 100 },
      { subject: '弯曲适应', A: 85, fullMark: 100 },
      { subject: '启动转矩', A: 92, fullMark: 100 },
      { subject: '能耗比', A: 80, fullMark: 100 },
    ],
    faultLibrary: [
      { code: 'C-101', title: '断链事故', cause: '链条疲劳或瞬间冲击载荷过大', solution: '更换受损链环，检查液压张紧装置。' },
    ]
  }
};

const PERFORMANCE_CURVE = [
  { hardness: 'f4', speed: 100, wear: 10 },
  { hardness: 'f6', speed: 85, wear: 25 },
  { hardness: 'f8', speed: 60, wear: 45 },
  { hardness: 'f10', speed: 35, wear: 70 },
  { hardness: 'f12', speed: 15, wear: 95 },
];

function WindIcon(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </svg>
  );
}

// Fallback
const DEFAULT_DATA = EQUIPMENT_DETAILS['excavation'];

export const MiningEquipKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('excavation');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = EQUIPMENT_DETAILS[activeCategory] || DEFAULT_DATA;
  const activeColor = EQUIPMENT_TREE.find(c => c.id === activeCategory)?.color || '#ef4444';

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-red-900/50 pb-4 bg-gradient-to-r from-[#1a0f0f] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-wider">
             <Database size={14} /> Mining Asset Library / 矿山资产库
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             采掘设备 <span className="text-red-500">智能知识库</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-end mt-4 md:mt-0">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索设备型号、截齿参数或故障库..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition-colors text-slate-200 placeholder:text-slate-600"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT SIDEBAR: Equipment Tree */}
        <div className="w-full lg:w-64 flex flex-col gap-2 overflow-y-auto pr-1">
           <div className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1 flex items-center gap-2">
               <Layers size={12} /> Equipment Categories
           </div>
           {EQUIPMENT_TREE.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`group flex items-center gap-3 p-3 rounded-sm border-l-4 transition-all duration-300 text-left
                 ${activeCategory === cat.id 
                   ? 'bg-gradient-to-r from-red-950/40 to-transparent border-red-500 text-white' 
                   : 'bg-slate-900/20 border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}
               `}
             >
               <div className={`${activeCategory === cat.id ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                 {cat.icon}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-sm leading-tight">{cat.label.split('(')[0]}</div>
                 <div className="text-[10px] opacity-60 uppercase tracking-wider">{cat.label.split('(')[1].replace(')', '')}</div>
               </div>
               {activeCategory === cat.id && <ChevronRight size={14} className="text-red-500" />}
             </button>
           ))}

           {/* Quick Tools */}
           <div className="mt-auto space-y-2">
               <button className="w-full py-2 bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors">
                   <HardDrive size={14} /> 下载完整设备手册
               </button>
               <button className="w-full py-2 bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors">
                   <Microscope size={14} /> 岩石硬度对照表
               </button>
           </div>
        </div>

        {/* CENTER AREA: Technical Workbench */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Top Section: Digital Twin & Specs */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[420px]">
              
              {/* 3D Model Area */}
              <div className="xl:col-span-2 relative bg-[#0c0a09] border border-red-900/30 rounded overflow-hidden group shadow-lg flex flex-col">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent z-20"></div>
                 <div className="absolute top-4 left-4 z-10 max-w-lg pointer-events-none">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-black text-[10px] font-bold rounded-sm uppercase">Heavy Machinery</span>
                        <span className="text-xs text-red-400 font-mono tracking-widest uppercase">ID: {currentData.model}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-none mb-2">{currentData.title}</h2>
                    <p className="text-sm text-slate-400 line-clamp-2 bg-black/40 p-1 rounded backdrop-blur-sm">{currentData.description}</p>
                 </div>
                 
                 {/* Spec Grid Overlay */}
                 <div className="absolute right-4 top-4 z-10 flex flex-col gap-1 items-end pointer-events-none">
                     {currentData.specs.slice(0, 3).map((spec: any, i: number) => (
                         <div key={i} className="bg-black/60 border border-slate-700 px-3 py-1 rounded backdrop-blur-sm text-right">
                             <div className="text-[10px] text-slate-400 uppercase">{spec.label}</div>
                             <div className="text-sm font-bold text-white font-mono">{spec.value}</div>
                         </div>
                     ))}
                 </div>

                 {/* Interactive 3D */}
                 <div className="flex-1 relative">
                    <ThreeScene type="tbm" color={activeColor} />
                    
                    {/* Schematic Overlay Lines (Decorative) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <svg width="100%" height="100%">
                            <line x1="20%" y1="80%" x2="40%" y2="60%" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="20%" cy="80%" r="2" fill="#ef4444" />
                            <text x="21%" y="80%" fill="#ef4444" fontSize="10">Cutting Head</text>
                            
                            <line x1="70%" y1="70%" x2="60%" y2="50%" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="70%" cy="70%" r="2" fill="#ef4444" />
                            <text x="71%" y="70%" fill="#ef4444" fontSize="10">Hydraulics</text>
                        </svg>
                    </div>
                 </div>
              </div>

              {/* Right Column: Adaptability Radar & Docs */}
              <div className="flex flex-col gap-4">
                  <SciFiCard title="地质工况适应性" subtitle="ADAPTABILITY" className="flex-1 border-red-900/50" noPadding>
                     <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentData.adaptability}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Adaptability" dataKey="A" stroke={activeColor} strokeWidth={2} fill={activeColor} fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: activeColor, color: '#e2e8f0'}} />
                          </RadarChart>
                        </ResponsiveContainer>
                     </div>
                  </SciFiCard>

                  <SciFiCard title="设备关键参数" subtitle="FULL SPECS">
                     <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentData.specs.map((spec: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800 pb-1 last:border-0 hover:bg-slate-800/30 px-1 rounded transition-colors">
                              <span className="text-slate-400">{spec.label}</span>
                              <span className="font-mono font-bold text-slate-100">{spec.value}</span>
                           </div>
                        ))}
                     </div>
                  </SciFiCard>
              </div>
           </div>

           {/* Middle: Performance Curves & Maintenance */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SciFiCard title="截割效率与硬度关系" subtitle="PERFORMANCE CURVE" className="border-red-900/50">
                 <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={PERFORMANCE_CURVE} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="hardness" stroke="#666" tick={{fontSize: 10}} label={{ value: 'Rock Hardness (f)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }} />
                           <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Cutting Speed (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#ef4444' }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fontSize: 10}} label={{ value: 'Pick Wear Rate', angle: 90, position: 'insideRight', fontSize: 10, fill: '#f59e0b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#ef4444'}} />
                           <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={2} dot={{r:3}} name="Cutting Speed" />
                           <Line yAxisId="right" type="monotone" dataKey="wear" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} name="Pick Wear" />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="text-[10px] text-slate-500 mt-2 text-center">
                    注: 数据基于标准截齿配置,f&gt;8时建议更换重型截齿。
                 </div>
              </SciFiCard>

              <SciFiCard title="维护保养计划" subtitle="MAINTENANCE" className="border-red-900/50">
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-slate-500 uppercase font-bold border-b border-slate-800 pb-2">
                        <span>Task Item</span>
                        <div className="flex gap-4 pr-2">
                            <span>Interval</span>
                            <span>State</span>
                        </div>
                    </div>
                    {currentData.maintenance.map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between group p-1.5 rounded hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`w-1.5 h-1.5 rounded-full ${item.criticality === 'High' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                             <span className="text-sm text-slate-300">{item.task}</span>
                          </div>
                          <div className="flex gap-4 items-center text-xs w-32 justify-between">
                             <span className="text-slate-500 font-mono">{item.interval}</span>
                             <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.status === 'OK' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                {item.status}
                             </span>
                          </div>
                       </div>
                    ))}
                    <div className="mt-auto pt-2 border-t border-slate-800">
                        <button className="w-full py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs rounded border border-red-900/50 flex items-center justify-center gap-2 transition-colors">
                            <Settings size={12} /> 生成本班次检修工单
                        </button>
                    </div>
                 </div>
              </SciFiCard>

           </div>

           {/* Bottom: Expert Fault Library */}
           <SciFiCard title="专家故障诊断库" subtitle="TROUBLESHOOTING" className="border-slate-800/60">
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-300">
                        <tr>
                           <th className="px-4 py-3 rounded-tl">故障代码</th>
                           <th className="px-4 py-3">故障现象</th>
                           <th className="px-4 py-3">原因分析</th>
                           <th className="px-4 py-3 rounded-tr">推荐解决方案</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {currentData.faultLibrary.map((fault: any, idx: number) => (
                           <tr key={idx} className="hover:bg-red-900/10 transition-colors group cursor-pointer">
                              <td className="px-4 py-3 font-mono text-red-400 font-bold">{fault.code}</td>
                              <td className="px-4 py-3 text-white group-hover:text-red-200">{fault.title}</td>
                              <td className="px-4 py-3">{fault.cause}</td>
                              <td className="px-4 py-3 text-slate-300">
                                 <div className="flex items-center gap-2">
                                     <CheckCircle2 size={14} className="text-green-500" />
                                     {fault.solution}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="mt-4 flex justify-between items-center text-xs text-slate-500 px-2">
                   <span>共检索到 {currentData.faultLibrary.length} 条相关记录</span>
                   <button className="flex items-center gap-1 hover:text-white transition-colors">
                       <BookOpen size={12} /> 查看完整维修手册
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
