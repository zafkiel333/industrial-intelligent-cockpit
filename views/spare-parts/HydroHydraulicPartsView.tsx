
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { HydroHydraulicThreeScene } from '../../components/spare_parts_hydro_hydraulic/ThreeScene';
import { HydraulicPart } from '../../components/spare_parts_hydro_hydraulic/three-types';
import { 
  Activity, 
  Settings, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  Gauge,
  Thermometer,
  PlayCircle,
  PauseCircle,
  RotateCw,
  GitBranch,
  Sliders,
  CheckCircle2,
  Database,
  FileText,
  Droplets,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, Tooltip
} from 'recharts';

// --- MOCK DATA ---
const HYD_PARTS: HydraulicPart[] = [
  { id: 'HYD-PUMP-01', name: '主油泵 #1 (Main Pump)', type: 'pump', status: 'normal', pressure: 16.5, temperature: 48 },
  { id: 'HYD-PUMP-02', name: '主油泵 #2 (Main Pump)', type: 'pump', status: 'normal', pressure: 0, temperature: 25 },
  { id: 'HYD-VALVE-BLOCK', name: '集成阀组 (Valve Block)', type: 'valve', status: 'normal', pressure: 16.2 },
  { id: 'HYD-ACC-1', name: '蓄能器组 (Accumulators)', type: 'accumulator', status: 'normal', pressure: 15.8 },
  { id: 'HYD-FILTER', name: '回油滤油器 (Filter)', type: 'filter', status: 'warning', pressure: 0.15 }, // dP high
  { id: 'HYD-TANK', name: '主油箱 (Main Tank)', type: 'tank', status: 'normal', pressure: 0, temperature: 42 },
];

const PRESSURE_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    pressure: 16 + Math.sin(i * 0.5) * 0.5,
    temp: 45 + Math.sin(i * 0.2) * 5
}));

const SPARE_PARTS_LIST = [
  { id: 'SP-SEAL-Kit-01', name: '油缸密封包', stock: 5, lead: '7d' },
  { id: 'SP-FIL-ELEMENT', name: '滤芯 (10μm)', stock: 2, lead: '3d' }, // Low stock
  { id: 'SP-VALVE-SOL', name: '电磁换向阀', stock: 1, lead: '14d' },
  { id: 'SP-ACC-BLADDER', name: '蓄能器皮囊', stock: 0, lead: '30d' }, // Critical
];

export const HydroHydraulicPartsView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('HYD-PUMP-01');
  const [systemPressure, setSystemPressure] = useState(16.2);
  const [isRunning, setIsRunning] = useState(true);

  const activePart = HYD_PARTS.find(p => p.id === selectedId) || HYD_PARTS[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020409]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 relative group">
              <Droplets size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-lg animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Fluid Power Asset Management
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 水工液压 <span className="text-cyan-500 italic">备件与状态监测</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统压力</div>
              <div className="text-2xl font-mono font-bold text-white">{systemPressure.toFixed(1)} <span className="text-sm text-slate-600 font-normal">MPa</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">油液温度</div>
              <div className="text-2xl font-mono font-bold text-orange-400">42.5 <span className="text-sm text-slate-600 font-normal">°C</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">清洁度</div>
              <div className="text-2xl font-mono font-bold text-green-400">NAS 6</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left: Component List */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="液压站组件状态" subtitle="COMPONENTS" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {HYD_PARTS.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedId(part.id)}
                      className={`p-3 rounded border cursor-pointer transition-all relative group
                         ${selectedId === part.id 
                            ? 'bg-cyan-950/20 border-cyan-500 shadow-lg' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                      `}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-cyan-500 font-bold">{part.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                             ${part.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400'}
                          `}>{part.status}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2">{part.name}</div>
                       
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-black/20 p-1.5 rounded">
                          {part.pressure > 0 && <span>Press: {part.pressure} MPa</span>}
                          {part.temperature && <span>Temp: {part.temperature} °C</span>}
                       </div>

                       {selectedId === part.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                       )}
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <div className="bg-slate-900/60 border border-slate-800 p-4 rounded flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <AlertTriangle size={14} className="text-amber-500" /> 维护提醒
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border-l-2 border-amber-500">
                 回油滤油器压差接近报警值 (0.15MPa)，建议准备更换滤芯。
              </div>
           </div>
        </div>

        {/* Center: 3D Twin */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Settings size={14} className="animate-spin-slow" />
                          HYDRAULIC POWER UNIT TWIN
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          HPU <span className="text-cyan-500 italic">Simulator</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <button 
                         onClick={() => setIsRunning(!isRunning)}
                         className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2
                            ${isRunning ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}
                         `}
                       >
                          {isRunning ? <RotateCw className="animate-spin" size={12}/> : <PauseCircle size={12}/>}
                          {isRunning ? 'System Active' : 'System Idle'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <HydroHydraulicThreeScene 
                    parts={HYD_PARTS} 
                    activeId={selectedId}
                    onPartSelect={setSelectedId}
                    systemPressure={systemPressure}
                    isRunning={isRunning}
                 />
              </div>

              {/* Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* Trend Chart */}
           <SciFiCard title="系统压力与温度趋势" subtitle="24H_HISTORY" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PRESSURE_TREND}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} domain={[10, 20]} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={10} domain={[20, 60]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Pressure (MPa)" />
                       <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* Right: Spare Parts Inventory */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="备件库存状态" subtitle="INVENTORY_STATUS">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 {SPARE_PARTS_LIST.map((sp, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                       <div>
                          <div className="text-xs font-bold text-slate-200">{sp.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{sp.id}</div>
                       </div>
                       <div className="text-right">
                          <div className={`text-sm font-bold ${sp.stock < 2 ? 'text-red-500' : 'text-emerald-400'}`}>{sp.stock}</div>
                          <div className="text-[8px] text-slate-600">Lead: {sp.lead}</div>
                       </div>
                    </div>
                 ))}
                 <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 font-bold uppercase tracking-widest transition-all">
                    申请采购补库
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">液压原理图</div>
                    <div className="text-xs font-bold text-white">HPU_SCH_V2.pdf</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
