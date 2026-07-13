
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[kb-channel-equip]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/kb-channel-equip';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { 
  Search, Database, Radio, Anchor, Sun, 
  Wifi, BatteryCharging, ChevronRight, FileText, 
  AlertTriangle, CheckCircle2, Eye, Map
} from 'lucide-react';

// Mock Data for the Knowledge Base
const COMPONENT_CATEGORIES = [
  { id: 'visual-aids', label: '视觉航标 (Visual Aids)', icon: <Eye />, color: '#eab308' },
  { id: 'electronic-aids', label: '电子导航 (e-Nav)', icon: <Radio />, color: '#3b82f6' },
  { id: 'power-sys', label: '能源系统 (Power)', icon: <Sun />, color: '#f97316' },
  { id: 'mooring', label: '锚泊系统 (Mooring)', icon: <Anchor />, color: '#64748b' },
  { id: 'telemetry', label: '遥测终端 (RTU)', icon: <Wifi />, color: '#10b981' },
];

const COMPONENT_DETAILS: Record<string, any> = {
  'visual-aids': {
    title: '智能一体化灯浮标 (Smart Buoy)',
    model: 'SB-2600-AI',
    specs: [
      { label: '标体直径', value: '2.6 m' },
      { label: '焦平面高度', value: '4.5 m' },
      { label: '灯光视距', value: '≥ 5 nm' },
      { label: '抗风能力', value: '60 m/s' },
      { label: '标体材质', value: 'UHMWPE' },
    ],
    maintenance: [
      { task: '灯器透镜清洁', interval: '3 months', status: 'OK' },
      { task: '太阳能板除垢', interval: '3 months', status: 'Pending' },
      { task: '水下附着物清理', interval: '1 year', status: 'OK' },
    ],
    performanceData: [
      { subject: '光效', A: 95, fullMark: 100 },
      { subject: '浮力储备', A: 88, fullMark: 100 },
      { subject: '抗撞击', A: 92, fullMark: 100 },
      { subject: '稳定性', A: 85, fullMark: 100 },
      { subject: '维护周期', A: 90, fullMark: 100 },
      { subject: '环保性', A: 98, fullMark: 100 },
    ],
    commonFaults: [
      { code: 'L-01', desc: '主灯光强衰减', probability: 'Low' },
      { code: 'B-03', desc: '标体倾斜度过大', probability: 'Med' },
      { code: 'P-05', desc: '太阳能充电效率低', probability: 'Med' },
    ]
  },
  'electronic-aids': {
    title: 'AIS 航标应答器 (AIS AtoN)',
    model: 'Type-3 Transponder',
    specs: [
      { label: '频率范围', value: '161.975-162.025 MHz' },
      { label: '发射功率', value: '12.5 W' },
      { label: '定位精度', value: '< 2.5 m (GNSS)' },
      { label: '报文类型', value: 'Msg 21 (AtoN)' },
      { label: '功耗', value: '< 1W (Standby)' },
    ],
    maintenance: [
      { task: '天线驻波比测试', interval: '6 months', status: 'OK' },
      { task: '固件升级', interval: '1 year', status: 'OK' },
    ],
    performanceData: [
      { subject: '覆盖范围', A: 95, fullMark: 100 },
      { subject: '信号稳定', A: 90, fullMark: 100 },
      { subject: '定位精度', A: 98, fullMark: 100 },
      { subject: '抗干扰', A: 85, fullMark: 100 },
      { subject: '能效比', A: 92, fullMark: 100 },
      { subject: '集成度', A: 88, fullMark: 100 },
    ],
    commonFaults: [
      { code: 'S-02', desc: 'GNSS 信号丢失', probability: 'Low' },
      { code: 'T-01', desc: '发射时隙冲突', probability: 'Low' },
    ]
  }
};

// Fallback
const DEFAULT_DATA = COMPONENT_DETAILS['visual-aids'];

export const ChannelEquipKbView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('visual-aids');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = COMPONENT_DETAILS[activeCategory] || DEFAULT_DATA;
  const activeColor = COMPONENT_CATEGORIES.find(c => c.id === activeCategory)?.color || '#eab308';

  // Mock Solar Charging Data
  const solarData = [
    { time: '06:00', power: 0 }, { time: '08:00', power: 15 }, 
    { time: '10:00', power: 45 }, { time: '12:00', power: 60 },
    { time: '14:00', power: 55 }, { time: '16:00', power: 30 },
    { time: '18:00', power: 5 }
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-yellow-900/50 pb-4 bg-gradient-to-r from-[#1a1600] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 uppercase tracking-wider">
             <Map size={14} /> Channel Infrastructure / 航道设施
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             航道设备组件 <span className="text-yellow-500">智能知识库</span>
          </h1>
        </div>
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
             type="text" 
             placeholder="输入设备ID、规格或维护记录..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-500 transition-colors text-slate-200 placeholder:text-slate-600"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-64 flex flex-col gap-3 overflow-y-auto pr-2">
           {COMPONENT_CATEGORIES.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`group flex items-center gap-3 p-4 rounded border transition-all duration-300 relative overflow-hidden text-left
                 ${activeCategory === cat.id 
                   ? 'bg-yellow-950/40 border-yellow-500/50 text-white shadow-[0_0_15px_rgba(234,179,8,0.15)]' 
                   : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'}
               `}
             >
               {activeCategory === cat.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
               )}
               <div className={`${activeCategory === cat.id ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                 {cat.icon}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-sm">{cat.label.split('(')[0]}</div>
                 <div className="text-[10px] opacity-60 uppercase tracking-wider">{cat.label.split('(')[1].replace(')', '')}</div>
               </div>
               {activeCategory === cat.id && <ChevronRight size={14} className="text-yellow-500" />}
             </button>
           ))}

           {/* Quick Stats Summary */}
           <div className="mt-auto p-4 bg-slate-900/30 border border-slate-800 rounded">
              <div className="text-xs text-slate-500 uppercase mb-2">Inventory Stats</div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <div className="text-xl font-mono text-white">458</div>
                    <div className="text-[10px] text-slate-600">Active Units</div>
                 </div>
                 <div>
                    <div className="text-xl font-mono text-yellow-400">99.8%</div>
                    <div className="text-[10px] text-slate-600">Availability</div>
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
                    <div className="text-xs text-yellow-500 uppercase font-bold tracking-widest mb-1">Digital Twin Model</div>
                    <div className="text-2xl font-bold text-white">{currentData.model}</div>
                 </div>
                 <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <div className="px-3 py-1 bg-black/60 text-xs rounded border border-slate-600 text-slate-300">
                        Buoyancy: <span className="text-white font-bold">2450 kg</span>
                    </div>
                 </div>
                 <ThreeScene type="buoy" color={activeColor} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Performance Radar */}
              <SciFiCard title="设备性能雷达" className="border-slate-800/60 bg-[#0b1221]/50" noPadding>
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

           {/* Middle: Specs, Energy, Maintenance */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Specs */}
              <SciFiCard title="技术规格" subtitle="DATASHEET">
                 <div className="grid grid-cols-1 gap-2">
                    {currentData.specs.map((spec: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-900/40 border border-slate-800/50 rounded hover:border-yellow-500/30 transition-colors">
                          <span className="text-slate-400 text-xs">{spec.label}</span>
                          <span className="font-mono font-bold text-sm text-slate-100">{spec.value}</span>
                       </div>
                    ))}
                 </div>
              </SciFiCard>

              {/* Energy Profile (Special for Buoys) */}
              <SciFiCard title="能源效率曲线" subtitle="SOLAR/BATT">
                 <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={solarData}>
                            <defs>
                                <linearGradient id="colorSolarKb" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                            <YAxis hide />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: activeColor, color: '#e2e8f0'}} />
                            <Area type="monotone" dataKey="power" stroke={activeColor} strokeWidth={2} fill="url(#colorSolarKb)" />
                        </AreaChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-2">
                    <span>Avg Generation: 350 Wh/day</span>
                    <span>Autonomy: 15 Days</span>
                 </div>
              </SciFiCard>

              {/* Maintenance */}
              <SciFiCard title="维保任务" subtitle="SCHEDULE">
                 <div className="flex flex-col gap-3">
                    {currentData.maintenance.map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-3 p-2 bg-slate-900/40 border border-slate-800/50 rounded">
                          <div className={`p-1.5 rounded-full ${item.status === 'OK' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                             {item.status === 'OK' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          </div>
                          <div className="flex-1">
                             <div className="text-xs font-bold text-slate-200">{item.task}</div>
                             <div className="text-[10px] text-slate-500">{item.interval}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </SciFiCard>

           </div>

           {/* Bottom: Fault Knowledge Base */}
           <SciFiCard title="故障诊断知识库" subtitle="DIAGNOSTICS" className="border-slate-800/60">
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-300">
                        <tr>
                           <th className="px-4 py-3 rounded-tl">Code</th>
                           <th className="px-4 py-3">Fault Description</th>
                           <th className="px-4 py-3">Probability</th>
                           <th className="px-4 py-3 rounded-tr">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                        {currentData.commonFaults.map((fault: any, idx: number) => (
                           <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-yellow-400">{fault.code}</td>
                              <td className="px-4 py-3 text-slate-200">{fault.desc}</td>
                              <td className="px-4 py-3">
                                 <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full ${fault.probability === 'High' ? 'bg-red-500' : fault.probability === 'Med' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{width: fault.probability === 'High' ? '80%' : fault.probability === 'Med' ? '50%' : '20%'}}
                                     ></div>
                                 </div>
                              </td>
                              <td className="px-4 py-3">
                                 <button className="text-xs text-yellow-400 hover:text-yellow-300 underline flex items-center gap-1">
                                    <FileText size={10} /> Guide
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
