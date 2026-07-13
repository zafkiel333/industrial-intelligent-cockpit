
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { GenStatorThreeScene } from '../../components/spare_parts_gen_stator/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-gen-stator-rotor]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-gen-stator-rotor';
import { GenPart } from '../../components/spare_parts_gen_stator/three-types';
import { 
  Zap, 
  Activity, 
  Thermometer, 
  RotateCw, 
  Magnet, 
  Layers, 
  Search,
  AlertTriangle,
  FileText,
  CircuitBoard,
  ArrowRight,
  Scan,
  Maximize2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

const GEN_PARTS = [
  { id: 'ST-BAR-UP', name: '定子上线棒 (Upper Bar)', stock: 12, health: 95, status: 'Normal' },
  { id: 'ST-BAR-LO', name: '定子下线棒 (Lower Bar)', stock: 8, health: 92, status: 'Normal' },
  { id: 'RT-POLE', name: '转子磁极 (Rotor Pole)', stock: 2, health: 88, status: 'Warning' },
  { id: 'RT-DAMPER', name: '阻尼环组件', stock: 4, health: 75, status: 'Warning' },
  { id: 'INS-CLIP', name: '绝缘槽楔 (Slot Wedge)', stock: 500, health: 100, status: 'Normal' },
];

const AIR_GAP_DATA = Array.from({length: 36}, (_, i) => ({
    angle: i * 10,
    gap: 20 + Math.sin(i * 0.5) * 2 + Math.random() // mm
}));

const PD_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    pC: 50 + Math.random() * 20 + (i > 18 ? 30 : 0) // Partial Discharge pC
}));

const INSULATION_RADAR = [
  { subject: '介质损耗 (Tanδ)', A: 85, fullMark: 100 },
  { subject: '绝缘电阻 (IR)', A: 98, fullMark: 100 },
  { subject: '极化指数 (PI)', A: 92, fullMark: 100 },
  { subject: '局部放电 (PD)', A: 70, fullMark: 100 },
  { subject: '耐压强度', A: 90, fullMark: 100 },
];

export const GenStatorRotorView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'airgap'>('standard');
  const [rpm, setRpm] = useState(500); // Rated RPM

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a]">
      
      {/* 顶部：发电机核心态势 */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] border-2 border-purple-400/50 relative group">
              <Zap size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-purple-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Generator Core Asset Management
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 发电机 <span className="text-purple-500 italic">定转子备件管理</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均气隙</div>
              <div className="text-2xl font-mono font-bold text-white">20.4 <span className="text-sm text-slate-600 font-normal">mm</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">最大局放</div>
              <div className="text-2xl font-mono font-bold text-amber-500">120 <span className="text-sm text-slate-600 font-normal">pC</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">绝缘寿命</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">92%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：核心备件库 (Core Inventory) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="定转子关键组件" subtitle="CORE_COMPONENTS" highlight className="flex-1 border-purple-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索线棒/磁极..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-purple-500" />
                 </div>
                 
                 {GEN_PARTS.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedPartId(part.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedPartId === part.id 
                            ? 'bg-purple-950/20 border-purple-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-purple-400 font-bold">{part.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.status === 'Warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{part.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{part.name}</div>
                       <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>库存: <span className="text-white font-mono">{part.stock}</span></span>
                          <span className="flex items-center gap-1">
                             <Activity size={10} /> 健康度: {part.health}%
                          </span>
                       </div>
                       {selectedPartId === part.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <AlertTriangle size={14} className="text-amber-500" /> 绝缘老化预警
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-amber-500">
                 检测到 C 相上层线棒局部放电呈上升趋势，建议在下次 C 级检修中安排<span className="text-white font-bold">介损试验</span>。
              </div>
           </div>
        </div>

        {/* 中枢：3D 发电机数字孪生 (Digital Twin) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020205] border border-purple-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <RotateCw size={14} className={rpm > 0 ? "animate-spin" : ""} />
                          Electromagnetic Field Simulation
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          Stator & Rotor <span className="text-purple-500 italic">Twin</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-purple-500/30 p-2 rounded backdrop-blur-md">
                          <div className="text-[9px] text-slate-500 uppercase font-bold">View Mode</div>
                          <div className="flex gap-2 mt-1">
                             <button onClick={() => setViewMode('standard')} className={`p-1.5 rounded ${viewMode === 'standard' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Layers size={14}/></button>
                             <button onClick={() => setViewMode('thermal')} className={`p-1.5 rounded ${viewMode === 'thermal' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Thermometer size={14}/></button>
                             <button onClick={() => setViewMode('airgap')} className={`p-1.5 rounded ${viewMode === 'airgap' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}><Scan size={14}/></button>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 底部信息 */}
                 <div className="flex justify-between items-end pointer-events-auto">
                    <div className="flex flex-col gap-2">
                       <label className="text-[9px] text-slate-500 uppercase font-bold">Rotor Speed</label>
                       <div className="flex items-center gap-3">
                          <input 
                            type="range" min="0" max="600" step="10" 
                            value={rpm} 
                            onChange={(e) => setRpm(parseFloat(e.target.value))}
                            className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                          <span className="text-sm font-mono text-purple-400 font-bold">{rpm} RPM</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <GenStatorThreeScene 
                    parts={[]} // Mocked inside
                    activePartId={selectedPartId}
                    rpm={rpm}
                    viewMode={viewMode}
                    onPartSelect={setSelectedPartId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：气隙圆图与局放趋势 */}
           <div className="grid grid-cols-2 gap-6 h-56">
              <SciFiCard title="动态气隙分布 (Air Gap)" subtitle="POLAR_PLOT" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={AIR_GAP_DATA}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="angle" tick={false} axisLine={false} />
                          <PolarRadiusAxis angle={90} domain={[15, 25]} tick={false} axisLine={false} />
                          <Radar name="Gap" dataKey="gap" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.1} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                       </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 right-2 text-[10px] text-cyan-500 font-mono">Min: 18.2mm</div>
                 </div>
              </SciFiCard>

              <SciFiCard title="局放趋势 (Partial Discharge)" subtitle="ONLINE_MONITOR" noPadding>
                 <div className="h-full w-full p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PD_TREND}>
                          <defs>
                             <linearGradient id="colorPD" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#f59e0b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
                          <Area type="step" dataKey="pC" stroke="#f59e0b" strokeWidth={2} fill="url(#colorPD)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </SciFiCard>
           </div>
        </div>

        {/* 右翼：绝缘评估与技术资料 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="绝缘状态多维评估" subtitle="INSULATION_HEALTH">
              <div className="h-56 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={INSULATION_RADAR}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Health" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 text-center border border-slate-800">
                 "定子绕组绝缘电阻 (IR) 处于优良状态，PI指数 &gt; 4.0"
              </div>
           </SciFiCard>

           <SciFiCard title="关键参数监测" subtitle="METRICS" className="flex-1 border-purple-900/30">
              <div className="space-y-4">
                 {[
                   { label: '定子线圈最高温', val: '85.4 °C', icon: <Thermometer size={14}/>, status: 'normal' },
                   { label: '转子电流', val: '1240 A', icon: <Zap size={14}/>, status: 'normal' },
                   { label: '机座振动 (Vib)', val: '1.2 mm/s', icon: <Activity size={14}/>, status: 'normal' },
                   { label: '轴电压', val: '12 V', icon: <CircuitBoard size={14}/>, status: 'warning' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="text-slate-500">{item.icon}</span> {item.label}
                       </div>
                       <span className={`font-mono text-sm font-bold ${item.status === 'warning' ? 'text-amber-500' : 'text-white'}`}>
                          {item.val}
                       </span>
                    </div>
                 ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 transition-all">
                     <Maximize2 size={14} /> 启动在线消磁
                  </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">查看大修工艺文件</div>
                    <div className="text-xs font-bold text-white">OVERHAUL_PROC_V3.pdf</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
