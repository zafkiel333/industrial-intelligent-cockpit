
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { GovernorThreeScene } from '../../components/spare_parts_governor/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sp-governor-support]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sp-governor-support';
import { GovernorPart } from '../../components/spare_parts_governor/three-types';
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
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, Cell, LineChart, Line, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---
const GOV_PARTS: GovernorPart[] = [
  { id: 'GOV-EH-CONV', name: '电液转换器 (E/H Converter)', type: 'valve', status: 'normal', pressure: 4.2 },
  { id: 'GOV-VALVE-MAIN', name: '主配压阀 (Main Valve)', type: 'valve', status: 'normal', position: 45 },
  { id: 'GOV-SERVO-01', name: '接力器 (Servomotor)', type: 'servomotor', status: 'normal', position: 45 },
  { id: 'GOV-ACC-01', name: '蓄能器组 (Accumulator)', type: 'accumulator', status: 'normal', pressure: 6.3 },
  { id: 'GOV-PUMP-01', name: '主油泵 (Main Pump)', type: 'pump', status: 'normal', temperature: 48 },
  { id: 'GOV-PUMP-02', name: '备用油泵 (Standby Pump)', type: 'pump', status: 'warning', temperature: 25 },
  { id: 'GOV-TANK', name: '集油槽 (Oil Tank)', type: 'tank', status: 'normal', temperature: 42 },
];

const STEP_RESPONSE = Array.from({length: 40}, (_, i) => {
  const t = i / 10;
  // Overdamped response simulation
  const target = 100;
  const current = target * (1 - Math.exp(-t) * (Math.cos(2 * t) + 0.5 * Math.sin(2 * t)));
  return { time: t.toFixed(1), setpoint: target, response: current };
});

const OIL_QUALITY = [
  { param: 'NAS Grade', value: 6, max: 8, status: 'ok' },
  { param: 'Water (ppm)', value: 120, max: 200, status: 'ok' },
  { param: 'Acid (mgKOH/g)', value: 0.08, max: 0.15, status: 'ok' },
  { param: 'Viscosity (cSt)', value: 45, min: 40, max: 50, status: 'ok' },
];

const SPARE_PARTS_LIST = [
  { id: 'SP-EH-001', name: '电液转换器线圈', stock: 2, lead: '14d' },
  { id: 'SP-SEAL-Kit', name: '主配压阀密封包', stock: 8, lead: '3d' },
  { id: 'SP-FILTER', name: '精密滤芯 (3μm)', stock: 15, lead: '1d' },
  { id: 'SP-POS-SENS', name: '位移传感器 LVDT', stock: 1, lead: '30d' },
];

export const GovernorSupportView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('GOV-EH-CONV');
  const [systemPressure, setSystemPressure] = useState(6.3); // MPa
  const [servoPos, setServoPos] = useState(45); // %
  const [isAuto, setIsAuto] = useState(true);
  const [pidParams, setPidParams] = useState({ p: 4.5, i: 1.2, d: 0.5 });

  const activePart = GOV_PARTS.find(p => p.id === selectedId) || GOV_PARTS[0];

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#020409]">
      
      {/* Header: Governor Dashboard */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50 relative group">
              <Activity size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-lg animate-[spin_20s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Precise Hydraulic Control
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                 调速系统 <span className="text-cyan-500 italic">备件保障与诊断</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">系统油压</div>
              <div className="text-2xl font-mono font-bold text-white">{systemPressure.toFixed(1)} <span className="text-sm text-slate-600 font-normal">MPa</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">接力器行程</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{servoPos.toFixed(1)} <span className="text-sm text-slate-600 font-normal">%</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">频偏死区</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">±0.05 <span className="text-sm text-slate-600 font-normal">Hz</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left: Component List & PID */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="核心组件状态" subtitle="COMPONENTS" highlight className="flex-1 border-cyan-900/30">
              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" placeholder="搜索阀件/模块..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500" />
                 </div>
                 
                 {GOV_PARTS.map(part => (
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
                       
                       <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                             <Activity size={10}/> Type: {part.type}
                          </div>
                          {part.pressure && <div>Press: {part.pressure} MPa</div>}
                          {part.temperature && <div>Temp: {part.temperature} °C</div>}
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
                 <Sliders size={14} className="text-cyan-500" /> PID 参数调优
              </div>
              <div className="space-y-3">
                 {Object.entries(pidParams).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                       <span className="text-xs font-mono font-bold w-4 text-slate-500 uppercase">{key}</span>
                       <input 
                         type="range" min="0" max="10" step="0.1" 
                         value={val}
                         onChange={(e) => setPidParams({...pidParams, [key]: parseFloat(e.target.value)})}
                         className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                       />
                       <span className="text-xs font-mono text-cyan-300 w-8 text-right">{val}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Center: 3D Digital Twin */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#050508] border border-cyan-900/20 rounded-lg overflow-hidden group">
              {/* HUD */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Settings size={14} className="animate-spin-slow" />
                          ELECTRO-HYDRAULIC TWIN
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          Governor <span className="text-cyan-500 italic">Simulator</span>
                       </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                       <button 
                         onClick={() => setIsAuto(!isAuto)}
                         className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2
                            ${isAuto ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}
                         `}
                       >
                          {isAuto ? <RotateCw className="animate-spin" size={12}/> : <PauseCircle size={12}/>}
                          {isAuto ? 'Auto Mode' : 'Manual Mode'}
                       </button>
                       <div className="bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-md text-right">
                          <div className="text-[10px] text-slate-500 uppercase">Selected Component</div>
                          <div className="text-sm font-bold text-white">{activePart.name}</div>
                       </div>
                    </div>
                 </div>

                 {/* Manual Controls */}
                 {!isAuto && (
                    <div className="pointer-events-auto bg-black/70 backdrop-blur border border-slate-700 p-4 rounded-lg self-center animate-in slide-in-from-bottom-4">
                       <div className="text-xs font-bold text-slate-300 mb-2 text-center">MANUAL OVERRIDE</div>
                       <div className="flex gap-4 items-center">
                          <button onClick={() => setServoPos(Math.max(0, servoPos - 5))} className="p-2 bg-slate-800 rounded hover:bg-cyan-600 transition-colors"><ChevronRight className="rotate-180" size={16}/></button>
                          <div className="w-32 text-center">
                             <div className="text-[10px] text-slate-500 uppercase">Servo Stroke</div>
                             <div className="text-xl font-mono font-bold text-cyan-400">{servoPos}%</div>
                          </div>
                          <button onClick={() => setServoPos(Math.min(100, servoPos + 5))} className="p-2 bg-slate-800 rounded hover:bg-cyan-600 transition-colors"><ChevronRight size={16}/></button>
                       </div>
                    </div>
                 )}
              </div>

              {/* 3D Scene */}
              <div className="absolute inset-0">
                 <GovernorThreeScene 
                    parts={GOV_PARTS} 
                    activeId={selectedId}
                    onPartSelect={setSelectedId}
                    systemPressure={systemPressure}
                    servoPosition={servoPos}
                    isAutoMode={isAuto}
                 />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* Step Response Chart */}
           <SciFiCard title="阶跃响应特性 (Step Response)" subtitle="STABILITY_CHECK" className="h-56 border-cyan-900/30">
              <div className="h-full w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={STEP_RESPONSE}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                       <YAxis stroke="#475569" fontSize={10} domain={[0, 120]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                       <Line type="monotone" dataKey="response" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Actual Response" />
                       <Line type="step" dataKey="setpoint" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Target Setpoint" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* Right: Oil Quality & Stock */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="油质监测 (Oil Health)" subtitle="NAS_GRADE">
              <div className="space-y-3">
                 {OIL_QUALITY.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                       <span className="text-[10px] text-slate-400">{item.param}</span>
                       <div className="text-right">
                          <div className={`text-sm font-bold font-mono ${item.status === 'ok' ? 'text-white' : 'text-red-400'}`}>{item.value}</div>
                          {item.max && <div className="text-[8px] text-slate-600">Max: {item.max}</div>}
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-4 flex gap-2">
                 <button className="flex-1 py-2 bg-slate-800 text-slate-300 text-[10px] font-bold rounded hover:bg-slate-700 transition-colors">
                    油样趋势图
                 </button>
                 <button className="flex-1 py-2 bg-slate-800 text-slate-300 text-[10px] font-bold rounded hover:bg-slate-700 transition-colors">
                    净化记录
                 </button>
              </div>
           </SciFiCard>

           <SciFiCard title="关键备件库存" subtitle="SPARE_PARTS" className="flex-1 border-cyan-900/30 bg-cyan-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {SPARE_PARTS_LIST.map((sp, i) => (
                       <div key={i} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                          <div>
                             <div className="text-xs font-bold text-slate-200">{sp.name}</div>
                             <div className="text-[9px] text-slate-500 font-mono">{sp.id}</div>
                          </div>
                          <div className="text-right">
                             <div className={`text-sm font-bold ${sp.stock < 3 ? 'text-red-500' : 'text-emerald-400'}`}>{sp.stock}</div>
                             <div className="text-[8px] text-slate-600">Lead: {sp.lead}</div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-cyan-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <Database size={14} /> 发起补货申请
                 </button>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><FileText size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">调速器维护手册</div>
                    <div className="text-xs font-bold text-white">Manual_GOV_v4.pdf</div>
                 </div>
              </div>
              <ArrowRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>
    </div>
  );
};
