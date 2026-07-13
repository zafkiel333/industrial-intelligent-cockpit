
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { TurbineThreeScene } from '../../components/spare_parts_turbine/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-turbine-parts]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-turbine-parts';
import { TurbinePart } from '../../components/spare_parts_turbine/three-types';
import { 
  Waves, 
  RotateCw, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  Gauge, 
  Wind, 
  Layers,
  Database,
  Search,
  ArrowRight,
  TrendingDown,
  Box,
  Droplets,
  AlertTriangle,
  Factory,
  FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

const TURBINE_PARTS: TurbinePart[] = [
  { id: 'TP-RUNNER-01', type: 'runner', health: 82, stress: 0.75, cavitation: 0.4 },
  { id: 'TP-GV-SET', type: 'guide_vane', health: 91, stress: 0.4, cavitation: 0.1 },
  { id: 'TP-SHAFT-MAIN', type: 'shaft', health: 95, stress: 0.2, cavitation: 0 },
  { id: 'TP-CS-VOLUTE', type: 'casing', health: 88, stress: 0.6, cavitation: 0.3 },
];

const PART_DETAILS: Record<string, any> = {
  'TP-RUNNER-01': { name: '高压混流转轮 (Runner)', material: '0Cr13Ni5Mo', weight: '45t', stock: 1, leadTime: '8 months' },
  'TP-GV-SET': { name: '活动导叶组 (Guide Vanes)', material: 'ZG06Cr13Ni4Mo', weight: '2.5t/ea', stock: 4, leadTime: '3 months' },
  'TP-SHAFT-MAIN': { name: '水轮机主轴 (Main Shaft)', material: '20SiMn', weight: '28t', stock: 0, leadTime: '6 months' },
  'TP-CS-VOLUTE': { name: '蜗壳衬板 (Spiral Case)', material: 'Q345R', weight: '120t', stock: 2, leadTime: '4 months' },
};

const EFFICIENCY_DATA = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  efficiency: 92 + Math.sin(i * 0.3) * 3 - (i > 18 ? 2 : 0), // Dip at night
  cavitation: 10 + Math.cos(i * 0.3) * 5 + Math.random() * 2
}));

const SUPPLY_CHAIN_STATUS = [
  { stage: '原材料', status: 'Ready', days: 0 },
  { stage: '粗加工', status: 'In-Process', days: 15 },
  { stage: '热处理', status: 'Pending', days: 5 },
  { stage: '精加工', status: 'Pending', days: 20 },
  { stage: '动平衡', status: 'Pending', days: 3 },
];

const CAVITATION_RADAR = [
  { subject: '叶片进水边', A: 85, fullMark: 100 },
  { subject: '叶片出水边', A: 45, fullMark: 100 }, // Risk area
  { subject: '上冠密封', A: 90, fullMark: 100 },
  { subject: '下环间隙', A: 75, fullMark: 100 },
  { subject: '泄水锥', A: 95, fullMark: 100 },
];

export const TurbinePartsView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string>('TP-RUNNER-01');
  const [rpm, setRpm] = useState(150); // Rated RPM
  const [flow, setFlow] = useState(0.8); // 80% Load

  const activeDetail = PART_DETAILS[selectedPartId] || PART_DETAILS['TP-RUNNER-01'];
  const activePartStat = TURBINE_PARTS.find(p => p.id === selectedPartId);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：水力机组状态栏 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 relative group">
              <Waves size={36} className="text-white group-hover:animate-pulse" />
              <div className="absolute -inset-2 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Hydro-Power Core Asset Assurance
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 水轮机 <span className="text-cyan-500 italic">关键备件保障服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">机组负荷</div>
              <div className="text-2xl font-mono font-bold text-white">{(flow * 100).toFixed(0)}%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">实时转速</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{rpm} <span className="text-xs text-slate-600">RPM</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">水力效率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">94.2%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：核心备件目录 (Core Inventory) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="核心部件全息目录" subtitle="CORE_ASSETS" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="输入部件代码..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500" />
                 </div>
                 
                 {TURBINE_PARTS.map(part => {
                    const detail = PART_DETAILS[part.id];
                    return (
                      <div 
                        key={part.id}
                        onClick={() => setSelectedPartId(part.id)}
                        className={`p-3 rounded border cursor-pointer transition-all relative group
                           ${selectedPartId === part.id 
                              ? 'bg-cyan-950/20 border-cyan-500 shadow-lg' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                        `}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-mono text-cyan-500 font-bold">{part.id}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase
                               ${part.health < 60 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}
                            `}>Health: {part.health}%</span>
                         </div>
                         <div className="text-xs font-bold text-white mb-2">{detail.name}</div>
                         
                         <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                             <div className="flex flex-col">
                                <span>库存: <span className={detail.stock === 0 ? 'text-red-500 font-bold' : 'text-white'}>{detail.stock}</span></span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span>周期: <span className="text-white">{detail.leadTime}</span></span>
                             </div>
                         </div>
                         
                         {selectedPartId === part.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                         )}
                      </div>
                    );
                 })}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <AlertTriangle size={14} className="text-amber-500" /> 供应链预警
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-amber-500">
                 主轴备件当前库存为 0，且原材料采购周期延长。建议立即启动 <span className="text-white font-bold">应急预案 B</span>。
              </div>
           </div>
        </div>

        {/* 中枢：3D 水轮机数字孪生 (Digital Twin) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020610] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <RotateCw size={14} className={flow > 0 ? "animate-spin" : ""} />
                          Hydro-Dynamic Simulation
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          Francis <span className="text-cyan-500 italic">Turbine</span> Core
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right pointer-events-auto">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">实时气蚀指数</div>
                       <div className="text-3xl font-mono font-bold text-white leading-none mt-1">
                          {(activePartStat?.cavitation || 0).toFixed(2)} <span className="text-sm font-normal text-slate-600">σ</span>
                       </div>
                    </div>
                 </div>

                 {/* 底部控制器 */}
                 <div className="flex justify-between items-end pointer-events-auto">
                    <div className="flex flex-col gap-2">
                       <label className="text-[9px] text-slate-500 uppercase font-bold">Load Control (Flow)</label>
                       <input 
                         type="range" min="0" max="1.2" step="0.1" 
                         value={flow} 
                         onChange={(e) => setFlow(parseFloat(e.target.value))}
                         className="w-40 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                    </div>
                    <div className="flex gap-2">
                       <button className="px-4 py-1.5 bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 text-[10px] rounded hover:bg-cyan-500 hover:text-black transition-colors">
                          流场分析
                       </button>
                       <button className="px-4 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded hover:bg-slate-700 transition-colors">
                          应力云图
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <TurbineThreeScene 
                    parts={TURBINE_PARTS}
                    activePartId={selectedPartId}
                    rpm={rpm * flow} // RPM related to flow for visual effect
                    flowRate={flow}
                    onPartSelect={setSelectedPartId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：效率与气蚀曲线 */}
           <SciFiCard title="机组工况与健康趋势" subtitle="PERFORMANCE" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={EFFICIENCY_DATA}>
                       <defs>
                          <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} domain={[80, 100]} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                       <Area yAxisId="left" type="monotone" dataKey="efficiency" name="水力效率 (%)" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorEff)" />
                       <Area yAxisId="right" type="monotone" dataKey="cavitation" name="气蚀噪声 (dB)" stroke="#f59e0b" strokeWidth={2} fill="none" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：深度分析与供应链 (Deep Analysis) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="气蚀风险雷达" subtitle="CAVITATION_RISK">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CAVITATION_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Health" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 text-center border border-slate-800">
                 "叶片出水边存在中度气蚀风险，建议加强涂层监测。"
              </div>
           </SciFiCard>

           <SciFiCard title="定制化制造进度" subtitle="MANUFACTURING" className="flex-1 border-cyan-900/30 bg-cyan-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>Order: PO-2024-098</span>
                    <span className="text-white">ETA: 45 Days</span>
                 </div>
                 
                 <div className="space-y-4 relative pl-4">
                    <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-800"></div>
                    {SUPPLY_CHAIN_STATUS.map((step, i) => (
                       <div key={i} className="relative flex items-center justify-between group">
                          <div className={`absolute -left-[14px] w-2.5 h-2.5 rounded-full border-2 
                             ${step.status === 'Ready' || step.status === 'In-Process' ? 'bg-cyan-500 border-cyan-300' : 'bg-slate-900 border-slate-600'}
                          `}></div>
                          <span className={`text-xs font-bold ${step.status === 'Pending' ? 'text-slate-500' : 'text-slate-200'}`}>{step.stage}</span>
                          <span className="text-[10px] font-mono text-slate-600">{step.days > 0 ? `${step.days}d` : '-'}</span>
                       </div>
                    ))}
                 </div>

                 <button className="mt-auto w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 transition-all">
                    <Factory size={14} /> 联系制造厂催单
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">查看技术规格书</div>
                    <div className="text-xs font-bold text-white">SPEC_HL_240.pdf</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
