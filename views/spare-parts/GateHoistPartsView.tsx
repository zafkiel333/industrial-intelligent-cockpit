
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { GateHoistThreeScene } from '../../components/spare_parts_gate_hoist/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-gate-hoist]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-gate-hoist';
import { GatePart } from '../../components/spare_parts_gate_hoist/three-types';
import { 
  Anchor, 
  Settings, 
  Activity, 
  Droplets, 
  ShieldAlert, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Wrench,
  Gauge,
  Thermometer,
  Layers,
  Database,
  History,
  AlertTriangle,
  MousePointer2,
  RefreshCw,
  FileText,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, ReferenceLine, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Line
} from 'recharts';

// --- MOCK DATA ---

const GATE_PARTS: GatePart[] = [
  { id: 'GP-SEAL-01', type: 'seal', health: 72, status: 'warning', label: '侧水封 (P型)' },
  { id: 'GP-CYL-01', type: 'cylinder', health: 95, status: 'normal', label: '液压启闭机缸体' },
  { id: 'GP-TRUN-01', type: 'trunnion', health: 88, status: 'normal', label: '主铰座轴承' },
  { id: 'GP-SKIN-01', type: 'skin_plate', health: 65, status: 'warning', label: '闸门面板 (Skin Plate)' },
  { id: 'GP-HOIST-01', type: 'hoist_unit', health: 92, status: 'normal', label: '液压泵站单元' },
];

const PART_DETAILS: Record<string, any> = {
  'GP-SEAL-01': { spec: 'P-Type Rubber', material: 'EPDM', stock: 120, nextChange: '3 mo' },
  'GP-CYL-01': { spec: '320mm Bore', material: 'Steel/Chrome', stock: 1, nextChange: '5 yr' },
  'GP-TRUN-01': { spec: 'Self-Lubricating', material: 'Bronze Alloy', stock: 2, nextChange: '2 yr' },
  'GP-SKIN-01': { spec: 'R=9m Arc', material: 'Q345C', stock: 0, nextChange: 'Repair' },
  'GP-HOIST-01': { spec: '2x45kW', material: 'Assembly', stock: 1, nextChange: 'Condition' },
};

const HYDRAULIC_DATA = Array.from({length: 30}, (_, i) => ({
  time: i,
  pressure: 12 + Math.sin(i * 0.2) * 2 + (i > 20 ? 4 : 0), // Pressure rise
  position: Math.min(100, i * 3) // Opening position
}));

const CORROSION_DATA = [
  { zone: '水线波动区', rate: 0.12, limit: 0.1 },
  { zone: '水下全浸区', rate: 0.05, limit: 0.1 },
  { zone: '大气飞溅区', rate: 0.08, limit: 0.1 },
  { zone: '底坎接触区', rate: 0.15, limit: 0.12 },
];

const RISK_RADAR = [
  { subject: '腐蚀', A: 85, fullMark: 100 },
  { subject: '磨损', A: 60, fullMark: 100 },
  { subject: '疲劳', A: 75, fullMark: 100 },
  { subject: '老化', A: 90, fullMark: 100 },
  { subject: '变形', A: 40, fullMark: 100 },
];

export const GateHoistPartsView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string>('GP-CYL-01');
  const [gateOpening, setGateOpening] = useState(0.0); // 0-1
  const [waterLevel, setWaterLevel] = useState(0.8); // 0-1
  const [isCorrosionView, setIsCorrosionView] = useState(false);

  const activePartDetail = PART_DETAILS[selectedPartId] || PART_DETAILS['GP-CYL-01'];
  const activePartStat = GATE_PARTS.find(p => p.id === selectedPartId);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#0b1116]">
      
      {/* 顶部：水工机械状态栏 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-4 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-700 to-slate-800 rounded flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] border-2 border-orange-500/50 relative group">
              <Anchor size={36} className="text-white group-hover:rotate-12 transition-transform" />
              <div className="absolute -inset-2 border border-orange-500/20 rounded animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Hydraulic Structures Asset Management
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 闸门及启闭机 <span className="text-orange-500 italic">备件保障服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">闸门开度</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{(gateOpening * 100).toFixed(1)}%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">启闭力</div>
              <div className="text-2xl font-mono font-bold text-white">2,450 <span className="text-sm font-normal text-slate-600">kN</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统油压</div>
              <div className="text-2xl font-mono font-bold text-orange-400">16.5 <span className="text-sm font-normal text-slate-600">MPa</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：备件清单与状态 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="关键备件状态" subtitle="COMPONENT_LIST" highlight className="flex-1 border-orange-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索备件..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500" />
                 </div>
                 
                 {GATE_PARTS.map(part => {
                    const detail = PART_DETAILS[part.id];
                    return (
                      <div 
                        key={part.id}
                        onClick={() => setSelectedPartId(part.id)}
                        className={`p-3 rounded border cursor-pointer transition-all relative group
                           ${selectedPartId === part.id 
                              ? 'bg-orange-950/30 border-orange-500 shadow-lg' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                        `}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{part.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${part.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                            `}>{part.status}</span>
                         </div>
                         <div className="text-sm font-bold text-white mb-2">{part.label}</div>
                         
                         <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 bg-black/20 p-2 rounded">
                             <div>Spec: <span className="text-slate-300">{detail.spec}</span></div>
                             <div className="text-right">Stock: <span className={detail.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-300'}>{detail.stock}</span></div>
                             <div>Mat: <span className="text-slate-300">{detail.material}</span></div>
                             <div className="text-right">Next: <span className="text-orange-400">{detail.nextChange}</span></div>
                         </div>
                         
                         {selectedPartId === part.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                         )}
                      </div>
                    );
                 })}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <ShieldAlert size={14} className="text-red-500" /> 腐蚀预警
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-red-500">
                 底坎接触区涂层检测到脱落风险，建议在下一个枯水期安排 <span className="text-white font-bold">防腐涂装</span> 维护。
              </div>
           </div>
        </div>

        {/* 中枢：3D 闸门数字孪生 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050608] border border-orange-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-orange-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Settings size={14} className="animate-spin-slow" />
                          Mechanical Simulation
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          Radial <span className="text-orange-500 italic">Gate</span> System
                       </h2>
                    </div>
                    
                    {/* Control Panel */}
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                        <div className="bg-black/60 border border-orange-500/30 p-3 rounded backdrop-blur-md">
                           <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Gate Control</div>
                           <div className="flex gap-2">
                              <button 
                                onMouseDown={() => setGateOpening(prev => Math.min(1, prev + 0.1))}
                                className="p-2 bg-slate-800 hover:bg-orange-600 rounded border border-slate-600 transition-colors"
                              >
                                 <ArrowUp size={16} />
                              </button>
                              <button 
                                onMouseDown={() => setGateOpening(prev => Math.max(0, prev - 0.1))}
                                className="p-2 bg-slate-800 hover:bg-orange-600 rounded border border-slate-600 transition-colors"
                              >
                                 <ArrowDown size={16} />
                              </button>
                           </div>
                        </div>
                        
                        <div className="bg-black/60 border border-orange-500/30 p-3 rounded backdrop-blur-md w-40">
                           <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Water Level</div>
                           <input 
                             type="range" min="0" max="1" step="0.1" 
                             value={waterLevel}
                             onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                        </div>

                        <button 
                          onClick={() => setIsCorrosionView(!isCorrosionView)}
                          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold border transition-all
                             ${isCorrosionView ? 'bg-red-900/40 border-red-500 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-300'}
                          `}
                        >
                           <Layers size={14} /> 腐蚀视图 {isCorrosionView ? 'ON' : 'OFF'}
                        </button>
                    </div>
                 </div>

                 {/* Bottom Stats */}
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-black/40 px-2 py-1 rounded">
                       <Gauge size={12} className="text-orange-400"/> Cylinder Stroke: {(gateOpening * 6).toFixed(1)}m
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-black/40 px-2 py-1 rounded">
                       <Activity size={12} className="text-cyan-400"/> Flow Rate: {(gateOpening * waterLevel * 2400).toFixed(0)} m³/s
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <GateHoistThreeScene 
                    parts={GATE_PARTS}
                    selectedPartId={selectedPartId}
                    gateOpening={gateOpening}
                    waterLevel={waterLevel}
                    isCorrosionView={isCorrosionView}
                    onPartSelect={setSelectedPartId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：液压与腐蚀分析 */}
           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="液压启闭特性曲线" subtitle="HYDRAULIC_LOAD" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={HYDRAULIC_DATA}>
                          <defs>
                             <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" fontSize={10} width={30} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                          <Area type="monotone" dataKey="pressure" stroke="#f97316" fill="url(#colorPress)" strokeWidth={2} name="油压 (MPa)" />
                          <Line type="monotone" dataKey="position" stroke="#0ea5e9" strokeWidth={2} dot={false} name="开度 (%)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>

              <SciFiCard title="腐蚀速率监测" subtitle="CORROSION_RATE" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={CORROSION_DATA} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 0.2]} />
                          <YAxis dataKey="zone" type="category" stroke="#94a3b8" width={60} fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                          <Bar dataKey="rate" barSize={15} radius={[0, 4, 4, 0]}>
                             {CORROSION_DATA.map((entry, index) => (
                                <Cell key={index} fill={entry.rate > entry.limit ? '#ef4444' : '#10b981'} />
                             ))}
                          </Bar>
                          <ReferenceLine x={0.1} stroke="#f59e0b" strokeDasharray="3 3" />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：诊断与维护 (Diagnostics) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="失效风险多维评估" subtitle="RISK_RADAR">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Risk" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 italic">
                 "老化与腐蚀是当前主要风险源，建议加强涂层维护。"
              </div>
           </SciFiCard>

           <SciFiCard title="维护与更换建议" subtitle="MAINTENANCE" className="flex-1 border-orange-900/30 bg-orange-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-slate-900/50 border-l-4 border-orange-500 rounded-r">
                    <div className="flex items-center gap-2 mb-1">
                       <Wrench size={14} className="text-orange-400" />
                       <span className="text-xs font-bold text-white">液压杆密封更换</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                       检测到微量内泄，建议在下次启闭操作前更换 V 型密封圈。
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <Database size={12} className="text-cyan-500" /> 备件可用性 (Stock)
                    </div>
                    {GATE_PARTS.slice(0, 3).map((part, i) => {
                       const det = PART_DETAILS[part.id];
                       return (
                         <div key={i} className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                            <span className="text-[10px] text-slate-300 truncate w-32">{part.label}</span>
                            <span className={`text-[10px] font-mono font-bold ${det.stock > 0 ? 'text-green-400' : 'text-red-500'}`}>
                               {det.stock > 0 ? `${det.stock} Avail` : 'Out of Stock'}
                            </span>
                         </div>
                       );
                    })}
                 </div>

                 <button className="mt-auto w-full py-2 bg-orange-700/20 hover:bg-orange-700/40 text-orange-400 text-[10px] uppercase font-bold border border-orange-700/50 rounded transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> 生成维保工单
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><History size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">启闭历史记录</div>
                    <div className="text-xs font-bold text-white">LOG_2024_Q1.csv</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-orange-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
