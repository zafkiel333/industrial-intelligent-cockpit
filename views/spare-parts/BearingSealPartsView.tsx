
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { BearingSealThreeScene } from '../../components/spare_parts_bearing_seal/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-bearing-seal]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-bearing-seal';
import { BearingPart } from '../../components/spare_parts_bearing_seal/three-types';
import { 
  Disc, 
  Activity, 
  Thermometer, 
  Zap, 
  Search, 
  Filter, 
  Microscope, 
  Droplets, 
  Wind, 
  Layers, 
  Settings, 
  AlertTriangle,
  RotateCw,
  Expand,
  FileText,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend, LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const BEARING_PARTS: BearingPart[] = [
  { id: 'BRG-MAIN-01', name: '主轴承 (Main Shaft)', type: 'roller', status: 'normal', temperature: 65, vibration: 1.2 },
  { id: 'BRG-THRUST-02', name: '推力轴承 (Thrust)', type: 'roller', status: 'warning', temperature: 78, vibration: 4.5 },
  { id: 'SEAL-LIP-A', name: '骨架油封 (Lip Seal)', type: 'seal_lip', status: 'normal', temperature: 55, vibration: 0.8 },
  { id: 'SEAL-MECH-B', name: '机械密封 (Mech Seal)', type: 'seal_lip', status: 'pitting', temperature: 82, vibration: 2.1 },
];

const SPECTRUM_DATA = Array.from({ length: 50 }, (_, i) => ({
  freq: i * 20,
  amp: Math.random() * 2 + (i === 12 ? 15 : 0) + (i === 24 ? 8 : 0), // 模拟故障频率点
  limit: 10
}));

const OIL_ANALYSIS = [
  { name: 'Fe (铁)', value: 125, limit: 100, status: 'high' },
  { name: 'Cu (铜)', value: 45, limit: 50, status: 'normal' },
  { name: 'Si (硅)', value: 15, limit: 20, status: 'normal' },
  { name: 'H2O', value: 0.05, limit: 0.1, status: 'normal' },
  { name: 'PQ指数', value: 280, limit: 200, status: 'high' },
];

const RUL_PREDICTION = [
  { time: 'Now', health: 85 },
  { time: '+1M', health: 82 },
  { time: '+3M', health: 75 },
  { time: '+6M', health: 60 },
  { time: '+9M', health: 40 }, // Failure threshold
  { time: '+12M', health: 10 },
];

const STOCK_INFO = [
  { type: 'SKF 22320', count: 4, location: 'A-01' },
  { type: 'FAG 23224', count: 2, location: 'A-02' },
  { type: 'NSK 24030', count: 0, location: '-' },
];

export const BearingSealPartsView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('BRG-MAIN-01');
  const [rpm, setRpm] = useState(1500);
  const [explodeLevel, setExplodeLevel] = useState(0);
  const [showOilFilm, setShowOilFilm] = useState(false);

  const activePart = BEARING_PARTS.find(p => p.id === selectedId) || BEARING_PARTS[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#060b14]">
      
      {/* 顶部：精密部件抬头 */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-amber-400/50 relative group">
              <Disc size={36} className="text-white group-hover:rotate-180 transition-transform duration-[2s]" />
              <div className="absolute -inset-2 border border-dashed border-amber-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Precision Tribology & Sealing
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 大型轴承与密封 <span className="text-amber-500 italic">精密备件库</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">平均振动值</div>
              <div className="text-2xl font-mono font-bold text-white">2.4 <span className="text-xs text-slate-600 font-normal">mm/s</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">油液清洁度</div>
              <div className="text-2xl font-mono font-bold text-amber-500">NAS 7</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">备件完好率</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">96.5%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：备件清单与微观分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="关键部件索引" subtitle="COMPONENT_LIST" highlight className="flex-1 border-amber-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="SKF / FAG / NSK..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-amber-500" />
                 </div>
                 
                 {BEARING_PARTS.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedId(part.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedId === part.id 
                            ? 'bg-amber-950/20 border-amber-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-amber-500 font-bold">{part.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.status === 'warning' || part.status === 'pitting' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}
                          `}>{part.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{part.name}</div>
                       
                       <div className="flex items-center gap-4 text-[10px] text-slate-400">
                           <span className="flex items-center gap-1"><Thermometer size={10}/> {part.temperature}°C</span>
                           <span className="flex items-center gap-1"><Activity size={10}/> {part.vibration} mm/s</span>
                       </div>

                       {selectedId === part.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="磨损颗粒分析 (铁谱)" subtitle="FERROGRAPHY" className="h-64 border-slate-800">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-black border border-slate-700 rounded-full overflow-hidden relative">
                       <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=200" className="opacity-60 grayscale" alt="microscope" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope className="text-amber-500 opacity-80" size={24} />
                       </div>
                    </div>
                    <div className="flex-1 space-y-2">
                       {OIL_ANALYSIS.slice(0,3).map(el => (
                          <div key={el.name} className="flex items-center justify-between text-xs">
                             <span className="text-slate-400">{el.name}</span>
                             <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div className={`h-full ${el.status === 'high' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${(el.value/el.limit)*100}%`}}></div>
                                </div>
                                <span className={`font-mono ${el.status === 'high' ? 'text-red-400' : 'text-slate-200'}`}>{el.value}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div className="text-[10px] bg-slate-900 p-2 rounded text-slate-400 italic border-l-2 border-red-500">
                    警告：检测到大量切削状磨粒 (50μm+)，提示滚动体可能存在疲劳剥落。
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 轴承数字孪生 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050402] border border-amber-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-amber-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Settings size={14} className="animate-spin-slow" />
                          Digital Twin Simulation
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          <span className="text-amber-500">Bearing</span> & Seal Lab
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                        <div className="bg-black/60 border border-amber-500/30 p-3 rounded backdrop-blur-md min-w-[120px]">
                           <div className="text-[9px] text-slate-500 uppercase font-bold">Rotation Speed</div>
                           <div className="flex items-center gap-2">
                              <input 
                                type="range" min="0" max="3000" step="100" 
                                value={rpm} 
                                onChange={(e) => setRpm(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                              <span className="text-lg font-mono font-bold text-white">{rpm}</span>
                           </div>
                        </div>

                        <div className="flex gap-2">
                           <button 
                             onClick={() => setExplodeLevel(explodeLevel > 0 ? 0 : 0.5)}
                             className={`p-2 rounded border transition-all ${explodeLevel > 0 ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                             title="Exploded View"
                           >
                              <Expand size={16} />
                           </button>
                           <button 
                             onClick={() => setShowOilFilm(!showOilFilm)}
                             className={`p-2 rounded border transition-all ${showOilFilm ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                             title="Oil Film Analysis"
                           >
                              <Droplets size={16} />
                           </button>
                        </div>
                    </div>
                 </div>

                 {/* 中间状态浮窗 */}
                 {activePart.status !== 'normal' && (
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 pointer-events-auto w-48">
                        <div className="bg-red-950/80 border-l-4 border-red-500 p-4 backdrop-blur-md animate-pulse">
                           <div className="flex items-center gap-2 text-red-400 font-bold mb-1 text-xs uppercase">
                              <AlertTriangle size={12} /> Defect Detected
                           </div>
                           <div className="text-white font-bold">{activePart.status.toUpperCase()}</div>
                           <div className="text-[10px] text-red-200 mt-1">Recommend immediate inspection or replacement.</div>
                        </div>
                    </div>
                 )}
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <BearingSealThreeScene 
                    parts={BEARING_PARTS as any}
                    activeId={selectedId}
                    rpm={rpm}
                    explodeLevel={explodeLevel}
                    showOilFilm={showOilFilm}
                    onSelect={setSelectedId}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* 装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：振动频谱分析 */}
           <SciFiCard title="高频振动频谱 (FFT Spectrum)" subtitle="FAULT_DIAGNOSIS" className="h-56 border-amber-900/30">
              <div className="h-full w-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SPECTRUM_DATA}>
                       <defs>
                          <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                       <XAxis dataKey="freq" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis hide domain={[0, 20]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <ReferenceLine x={240} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'BPFO', fill: '#ef4444', fontSize: 10, position: 'insideTop'}} />
                       <Area type="monotone" dataKey="amp" stroke="#f59e0b" strokeWidth={1} fill="url(#colorFreq)" />
                       <Line type="monotone" dataKey="limit" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：寿命预测与库存 (Intelligence) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="剩余寿命预测 (RUL)" subtitle="AI_MODEL">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={RUL_PREDICTION}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" />
                       <Line type="monotone" dataKey="health" stroke="#0ea5e9" strokeWidth={2} dot={{r:3}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-slate-500 mt-1">
                 预计在 <span className="text-white font-bold">9个月后</span> 达到失效阈值
              </div>
           </SciFiCard>

           <SciFiCard title="智能库存状态" subtitle="WMS_SYNC" className="flex-1 border-slate-800">
              <div className="flex flex-col gap-4">
                 <div className="space-y-2">
                    {STOCK_INFO.map((item, i) => (
                       <div key={i} className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                          <div>
                             <div className="text-xs font-bold text-slate-200">{item.type}</div>
                             <div className="text-[9px] text-slate-500">Loc: {item.location}</div>
                          </div>
                          <div className={`text-sm font-mono font-bold ${item.count === 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                             {item.count}
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="p-3 bg-amber-900/10 border border-amber-500/20 rounded flex items-start gap-2">
                    <Fingerprint size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-tight">
                       <span className="text-amber-400 font-bold">真伪鉴别：</span> 扫描到 NSK 24030 批次号存在异常，建议暂缓领用并执行光谱复核。
                    </p>
                 </div>

                 <button className="w-full mt-auto py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> 生成采购补货单
                 </button>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
