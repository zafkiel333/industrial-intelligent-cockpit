
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { 
  Search, Database, Cpu, Activity, Settings, 
  Wind, Zap, Anchor, ChevronRight, FileText, 
  AlertCircle, CheckCircle2, BookOpen, Gauge
} from 'lucide-react';

// Mock Data for the Knowledge Base
const COMPONENT_CATEGORIES = [
  { id: 'main-engine', label: '主推进主机', icon: <Activity />, color: '#0ea5e9' },
  { id: 'propulsion', label: '推进器系统', icon: <Wind />, color: '#06b6d4' },
  { id: 'power-gen', label: '发电辅机', icon: <Zap />, color: '#eab308' },
  { id: 'boiler', label: '锅炉与热交', icon: <ThermometerIcon />, color: '#f43f5e' },
  { id: 'automation', label: '安保与监控', icon: <Cpu />, color: '#8b5cf6' },
];

const COMPONENT_DETAILS: Record<string, any> = {
  'main-engine': {
    title: '低速二冲程柴油机 (Low-Speed 2-Stroke)',
    model: 'X-DF Series 7250',
    specs: [
      { label: '额定功率', value: '25,400 kW' },
      { label: '额定转速', value: '82 RPM' },
      { label: '缸径/行程', value: '720/2800 mm' },
      { label: '热效率', value: '53.5 %' },
      { label: '燃油类型', value: 'HFO / LNG (Dual)' },
    ],
    maintenance: [
      { task: '喷油器检查', interval: '2,000 hrs', status: 'Pending' },
      { task: '活塞吊缸检修', interval: '12,000 hrs', status: 'OK' },
      { task: '排气阀研磨', interval: '6,000 hrs', status: 'OK' },
    ],
    performanceData: [
      { subject: '热效率', A: 95, fullMark: 100 },
      { subject: '可靠性', A: 98, fullMark: 100 },
      { subject: '排放合规', A: 92, fullMark: 100 },
      { subject: '振动控制', A: 85, fullMark: 100 },
      { subject: '维护便利', A: 80, fullMark: 100 },
      { subject: '负载响应', A: 88, fullMark: 100 },
    ],
    commonFaults: [
      { code: 'E-01', desc: '排气温度偏差过大', probability: 'Low' },
      { code: 'F-04', desc: '燃油喷射压力低', probability: 'Med' },
      { code: 'L-09', desc: '气缸注油率异常', probability: 'Low' },
    ]
  },
  'propulsion': {
    title: '可调螺距螺旋桨 (CPP)',
    model: 'Alpha CP-1200',
    specs: [
      { label: '直径', value: '6.5 m' },
      { label: '叶片数量', value: '4' },
      { label: '最大螺距角', value: '35 deg' },
      { label: '轮毂直径', value: '1.2 m' },
      { label: '材料', value: 'Ni-Al Bronze' },
    ],
    maintenance: [
      { task: '桨毂油样分析', interval: '1,000 hrs', status: 'OK' },
      { task: '密封环更换', interval: '5 years', status: 'OK' },
    ],
    performanceData: [
      { subject: '推进效率', A: 90, fullMark: 100 },
      { subject: '空泡余量', A: 85, fullMark: 100 },
      { subject: '操纵性', A: 98, fullMark: 100 },
      { subject: '噪音控制', A: 82, fullMark: 100 },
      { subject: '耐腐蚀', A: 95, fullMark: 100 },
      { subject: '维护便利', A: 75, fullMark: 100 },
    ],
    commonFaults: [
      { code: 'H-02', desc: '液压变距响应迟滞', probability: 'Low' },
      { code: 'S-05', desc: '艉轴密封微漏', probability: 'Med' },
    ]
  }
};

// Fallback for categories without specific mock data
const DEFAULT_DATA = COMPONENT_DETAILS['main-engine'];

function ThermometerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

export const ShipPowerKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('main-engine');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = COMPONENT_DETAILS[activeCategory] || DEFAULT_DATA;
  const activeColor = COMPONENT_CATEGORIES.find(c => c.id === activeCategory)?.color || '#0ea5e9';

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0c1221] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Database size={14} /> Knowledge Base / 知识库
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶动力部件 <span className="text-cyan-500">数字档案</span>
          </h1>
        </div>
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder="搜索部件型号、故障代码或参数..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-slate-200 placeholder:text-slate-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDEBAR: Categories */}
        <div className="w-full lg:w-64 flex flex-col gap-3 overflow-y-auto pr-2">
           {COMPONENT_CATEGORIES.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`group flex items-center gap-3 p-4 rounded border transition-all duration-300 relative overflow-hidden text-left
                 ${activeCategory === cat.id 
                   ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'}
               `}
             >
               {activeCategory === cat.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
               )}
               <div className={`${activeCategory === cat.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                 {cat.icon}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-sm">{cat.label}</div>
                 <div className="text-[10px] opacity-60 uppercase tracking-wider">System ID: {cat.id.slice(0,3).toUpperCase()}</div>
               </div>
               {activeCategory === cat.id && <ChevronRight size={14} className="text-cyan-500" />}
             </button>
           ))}

           {/* Quick Stats Summary */}
           <div className="mt-auto p-4 bg-slate-900/30 border border-slate-800 rounded">
              <div className="text-xs text-slate-500 uppercase mb-2">Database Stats</div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <div className="text-xl font-mono text-white">1,240</div>
                    <div className="text-[10px] text-slate-600">Components</div>
                 </div>
                 <div>
                    <div className="text-xl font-mono text-cyan-400">85</div>
                    <div className="text-[10px] text-slate-600">Manuals</div>
                 </div>
              </div>
           </div>
        </div>

        {/* CENTER AREA: Main Content */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
           
           {/* Top: 3D Visualization & Radar Chart */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[350px]">
              
              {/* 3D Preview */}
              <div className="md:col-span-2 relative bg-[#02040a] border border-slate-800 rounded overflow-hidden group">
                 <div className="absolute top-4 left-4 z-10">
                    <div className="text-xs text-cyan-500 uppercase font-bold tracking-widest mb-1">Interactive Model</div>
                    <div className="text-2xl font-bold text-white">{currentData.model}</div>
                 </div>
                 <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button className="px-3 py-1 bg-slate-800/80 hover:bg-cyan-600 text-xs rounded border border-slate-600 transition-colors">Explode View</button>
                    <button className="px-3 py-1 bg-slate-800/80 hover:bg-cyan-600 text-xs rounded border border-slate-600 transition-colors">Schematic</button>
                 </div>
                 <ThreeScene type="ship" color={activeColor} />
              </div>

              {/* Performance Radar */}
              <SciFiCard title="性能评估雷达" className="border-slate-800/60 bg-[#0b1221]/50" noPadding>
                 <div className="w-full h-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentData.performanceData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Performance" dataKey="A" stroke={activeColor} strokeWidth={2} fill={activeColor} fillOpacity={0.3} />
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: activeColor, color: '#e2e8f0'}} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>

           {/* Middle: Specs & Maintenance */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <SciFiCard title="技术参数规格" subtitle="SPECIFICATIONS">
                 <div className="grid grid-cols-1 gap-2">
                    {currentData.specs.map((spec: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/40 border border-slate-800/50 rounded hover:border-cyan-500/30 transition-colors">
                          <span className="text-slate-400 text-sm">{spec.label}</span>
                          <span className="font-mono font-bold text-slate-100">{spec.value}</span>
                       </div>
                    ))}
                 </div>
              </SciFiCard>

              <SciFiCard title="维保计划与周期" subtitle="MAINTENANCE">
                 <div className="flex flex-col gap-3">
                    {currentData.maintenance.map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/40 border border-slate-800/50 rounded">
                          <div className={`p-2 rounded-full ${item.status === 'OK' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                             {item.status === 'OK' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1">
                             <div className="text-sm font-bold text-slate-200">{item.task}</div>
                             <div className="text-xs text-slate-500">Cycle: {item.interval}</div>
                          </div>
                          <div className="text-right">
                             <div className={`text-xs font-bold ${item.status === 'OK' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {item.status}
                             </div>
                          </div>
                       </div>
                    ))}
                    <button className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2 transition-colors">
                        <BookOpen size={12} /> 查看完整维保手册
                    </button>
                 </div>
              </SciFiCard>

           </div>

           {/* Bottom: Fault Knowledge Base */}
           <SciFiCard title="常见故障与解决方案库" subtitle="TROUBLESHOOTING" className="border-slate-800/60">
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-300">
                        <tr>
                           <th className="px-4 py-3 rounded-tl">故障代码</th>
                           <th className="px-4 py-3">故障描述</th>
                           <th className="px-4 py-3">发生概率</th>
                           <th className="px-4 py-3 rounded-tr">推荐处置方案</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                        {currentData.commonFaults.map((fault: any, idx: number) => (
                           <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-cyan-400">{fault.code}</td>
                              <td className="px-4 py-3 text-slate-200">{fault.desc}</td>
                              <td className="px-4 py-3">
                                 <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold 
                                    ${fault.probability === 'High' ? 'bg-red-900/30 text-red-400' : 
                                      fault.probability === 'Med' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'}`}>
                                    {fault.probability}
                                 </span>
                              </td>
                              <td className="px-4 py-3">
                                 <button className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1">
                                    <FileText size={10} /> 查看方案
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
