
import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { MetalStructureScene } from '../../components/metal_structure/MetalStructureScene';
import { StructureHotspot } from '../../components/metal_structure/three-types';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  Zap, 
  Database, 
  Anchor, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Maximize2, 
  Wrench,
  Thermometer,
  Gauge,
  RotateCw,
  Waves,
  Fingerprint,
  CheckCircle2,
  History,
  Info,
  Target,
  Box,
  Droplets,
  ClipboardCheck,
  ShieldCheck,
  FileText,
  // Fix: Added missing icons to resolve errors at lines 282, 305 and 308
  Cpu,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend, ComposedChart, ReferenceLine, Cell, BarChart, Bar
} from 'recharts';

// --- 模拟数据 ---
const STRUCTURAL_ASSETS = [
  { id: 'MS-G-001', name: '弧形工作闸门框架', health: 88, status: 'Normal', stress: 'Moderate' },
  { id: 'MS-TR-04', name: '拦污栅 A1 单元', health: 62, status: 'Warning', stress: 'High' },
  { id: 'MS-SL-10', name: '叠梁检修闸门', health: 95, status: 'Normal', stress: 'Low' },
];

const HOTSPOTS: StructureHotspot[] = [
  { id: 'WELD-01', type: 'weld', position: [0, 4, 0], status: 'stressed', value: 0.85, label: '横梁主焊缝' },
  { id: 'ANODE-04', type: 'anode', position: [-5, -2, 2], status: 'corroded', value: 0.3, label: '牺牲阳极锌块' },
  { id: 'SUP-09', type: 'support', position: [5, 0, -2], status: 'normal', value: 0.95, label: '支铰支撑座' },
];

const STRESS_TREND = Array.from({length: 24}, (_, i) => ({
  time: `${i}:00`,
  stress: 45 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
  limit: 80
}));

const SPARE_PARTS_LIST = [
  { id: 'SP-AN-ZN', name: '高纯度牺牲阳极 (锌合金)', stock: 45, unit: 'pcs', lead: '3d', status: 'normal' },
  { id: 'SP-SE-P7', name: 'P型高分子复合水封', stock: 12, unit: 'set', lead: '15d', status: 'warning' },
  { id: 'SP-BL-M24', name: '高强防松螺栓 M24 (SS316)', stock: 500, unit: 'pcs', lead: '1d', status: 'normal' },
  { id: 'SP-PT-EP', name: '环氧富锌防腐涂料 (Gray)', stock: 5, unit: 'can', lead: '2d', status: 'critical' },
];

export const MetalStructurePartsView: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>('WELD-01');
  const [waterPressure, setWaterPressure] = useState(0.65);
  const [showStress, setShowStress] = useState(true);

  const activeNodeInfo = useMemo(() => HOTSPOTS.find(h => h.id === activeNodeId), [activeNodeId]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a] overflow-hidden p-2">
      
      {/* 顶部：资产态势指挥台 */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-slate-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-400/50 relative group">
              <Layers size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Hydraulic Metal Structure Integrity
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 水工金属结构 <span className="text-cyan-500 italic">备件与健康管理</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">结构安全系数</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">1.85 <span className="text-sm font-normal">K</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">阳极有效消耗率</div>
              <div className="text-2xl font-mono font-bold text-amber-400">42.5%</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">探伤合格率</div>
              <div className="text-2xl font-mono font-bold text-white">100%</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* 左翼：组件树与生命周期 (Asset Tree) */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Database size={14} className="text-cyan-500" /> 关键金属构件</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1">
              {STRUCTURAL_ASSETS.map(asset => (
                <div 
                  key={asset.id}
                  className="p-4 rounded border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-cyan-500 mb-1">{asset.id}</div>
                        <h3 className="font-bold text-slate-100 text-sm truncate">{asset.name}</h3>
                     </div>
                     <div className={`p-1.5 rounded border ${asset.health > 70 ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500 animate-pulse'}`}>
                        <ShieldCheck size={14}/>
                     </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="text-slate-500">健康度: <span className="text-white font-bold">{asset.health}%</span></span>
                     <span className="text-slate-500">应力负荷: <span className="text-cyan-400 font-bold">{asset.stress}</span></span>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="腐蚀深度预测" subtitle="CORROSION_PROJECTION" className="h-44 border-slate-800">
              <div className="flex flex-col h-full justify-center">
                 <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">
                    <span>平均年腐蚀速率</span>
                    <span className="text-red-400">0.12 mm/y</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[65%]"></div>
                 </div>
                 <p className="text-[9px] text-slate-600 mt-3 italic leading-tight">
                    * 基于当前水质 pH 值 6.8 及流速 2.5m/s 进行 AI 模型推演。
                 </p>
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 结构数字孪生 (The Forge) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020408] border border-cyan-900/20 rounded-2xl overflow-hidden group">
              {/* HUD 叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Activity size={14} className="animate-pulse" />
                          Structural Integrity Scan: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          结构件 <span className="text-cyan-500 italic">应力全息场</span>
                       </h2>
                    </div>
                    <div className="flex flex-col gap-3 items-end pointer-events-auto">
                       <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">模拟静水头</div>
                          <div className="text-3xl font-mono font-bold text-blue-400 leading-none mt-1">{(waterPressure * 120).toFixed(1)} <span className="text-sm font-normal text-slate-600 uppercase">Meters</span></div>
                       </div>
                       <button 
                         onClick={() => setShowStress(!showStress)}
                         className={`px-6 py-1.5 rounded-full font-bold text-[10px] uppercase border transition-all 
                            ${showStress ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}
                         `}
                       >
                          应力云图 {showStress ? 'ON' : 'OFF'}
                       </button>
                    </div>
                 </div>

                 {/* 底部详情交互 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-4 backdrop-blur-md">
                          <Target size={24} className="text-orange-500 animate-pulse" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">焦点检测区域</div>
                             <div className="text-sm font-bold text-white uppercase">{activeNodeInfo?.label || 'GLOBAL'}</div>
                             <div className="text-[10px] text-slate-500 mt-0.5">安全系数: <span className="text-emerald-400 font-mono">1.92</span></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm pointer-events-auto flex items-center gap-4 group cursor-pointer hover:border-cyan-500/30 transition-all">
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">FEA Simulation Fidelity</div>
                          <div className="text-lg font-bold text-white font-mono leading-none">99.4%</div>
                       </div>
                       <div className="w-10 h-10 rounded bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                          <Maximize2 size={18} className="text-cyan-400" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <MetalStructureScene 
                    hotspots={HOTSPOTS} 
                    activeHotspotId={activeNodeId}
                    onNodeClick={setActiveNodeId}
                    showStressMap={showStress}
                    waterPressure={waterPressure}
                 />
              </div>

              {/* 装饰层 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
           </div>

           {/* 底部：应力脉冲曲线图 */}
           <SciFiCard title="主受力构件应力脉冲分析" subtitle="DYNAMIC_STRESS_LOG" className="h-60 border-indigo-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={STRESS_TREND}>
                       <defs>
                          <linearGradient id="colorStressM" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} interval={2} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="stress" stroke="#ef4444" fill="url(#colorStressM)" strokeWidth={2} name="实时应力 (MPa)" />
                       <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '屈服极限', fill: 'red', fontSize: 10, position: 'right' }} />
                       <Legend verticalAlign="top" height={36} iconType="diamond" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：备件保障与审计 (Supply & Audit) */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="防腐备件资源库" subtitle="ANTI_CORROSION_HUB" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {SPARE_PARTS_LIST.map(part => (
                       <div key={part.id} className="p-3 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{part.name}</span>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                ${part.status === 'critical' ? 'bg-red-900/30 text-red-400' : part.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                             `}>{part.status}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                             <span className="font-mono">ID: {part.id}</span>
                             <span>库存: <span className="text-white">{part.stock} {part.unit}</span></span>
                          </div>
                          <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${part.status === 'critical' ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${(part.stock/50)*100}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
                    <div className="p-3 bg-cyan-950/20 border-l-4 border-cyan-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                       <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-cyan-400 animate-pulse" />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">AI 补货指令</span>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-normal italic">
                          “识别到 <span className="text-white font-bold">牺牲阳极</span> 消耗曲线陡增。预计在下季度机组大修前需补充 120 组锌块，已自动向战略供应商发起询价。”
                       </p>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <ShieldCheck size={16} /> 下达防腐治理指令集
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded flex items-center justify-center bg-slate-800"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">水工结构标准图谱库</div>
                    <div className="text-xs font-bold text-white">GB_STRUCT_V4.dwg</div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                 <ArrowRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
              </div>
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.6); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
