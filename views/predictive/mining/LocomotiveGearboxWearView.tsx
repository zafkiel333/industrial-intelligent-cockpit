
import React, { useState, useEffect } from 'react';
import { LocoGearboxScene } from '../../../components/predictive/mining-locomotive-gearbox/ThreeScene';
import { GearComponent } from '../../../components/predictive/mining-locomotive-gearbox/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ComposedChart, Legend, ScatterChart, Scatter
} from 'recharts';
import { 
  Settings, Activity, AlertTriangle, Droplets, 
  Thermometer, TrendingUp, Search, Microscope, 
  GitCommit, RefreshCw, Zap, Hexagon,
  FileText, CheckCircle2, ShieldAlert
} from 'lucide-react';

// --- 模拟数据 ---

const VIBRATION_SPECTRUM = Array.from({length: 80}, (_, i) => {
    const f = i * 10; // Hz
    // Simulate GMF peaks
    const gmf = 450; // Gear Mesh Frequency
    let amp = Math.random() * 0.2;
    
    // GMF and harmonics
    if (Math.abs(f - gmf) < 20) amp = 2.5 + Math.random();
    if (Math.abs(f - 2*gmf) < 20) amp = 1.2 + Math.random();
    // Sidebands indicating wear
    if (Math.abs(f - (gmf - 50)) < 15) amp = 0.8;
    if (Math.abs(f - (gmf + 50)) < 15) amp = 0.8;

    return { freq: f, amp, limit: 3.0 };
});

const WEAR_PREDICTION = Array.from({length: 24}, (_, i) => {
    const month = i + 1;
    // Exponential wear model
    const wear = 10 * Math.exp(0.08 * month);
    return {
        month: `M+${month}`,
        wear: wear.toFixed(2),
        upper: (wear * 1.1).toFixed(2),
        lower: (wear * 0.9).toFixed(2),
        limit: 80
    };
});

const DEBRIS_ANALYSIS = [
    { type: 'Normal Rubbing', count: 1200, size: 'Small (<5µm)', risk: 'Low' },
    { type: 'Fatigue Spall', count: 45, size: 'Large (>15µm)', risk: 'High' },
    { type: 'Cutting Wear', count: 12, size: 'Med (5-15µm)', risk: 'Med' },
    { type: 'Laminar', count: 85, size: 'Small', risk: 'Low' },
];

const COMPONENT_STATUS: GearComponent[] = [
    { id: 'pinion', name: '主动小齿轮 (Pinion)', type: 'pinion', wearLevel: 65, temperature: 92, vibration: 4.5 },
    { id: 'wheel', name: '从动大齿轮 (Bull Gear)', type: 'wheel', wearLevel: 35, temperature: 85, vibration: 2.1 },
    { id: 'bearing-in', name: '输入端轴承', type: 'bearing', wearLevel: 20, temperature: 75, vibration: 1.2 },
    { id: 'bearing-out', name: '输出端轴承', type: 'bearing', wearLevel: 25, temperature: 78, vibration: 1.5 },
];

export const LocomotiveGearboxWearView: React.FC = () => {
  // --- 状态 ---
  const [rpm, setRpm] = useState(2400);
  const [load, setLoad] = useState(75);
  const [activeComponent, setActiveComponent] = useState<string | null>('pinion');
  const [viewMode, setViewMode] = useState<'mechanical' | 'stress' | 'particles'>('mechanical');
  const [metrics, setMetrics] = useState({
      rul: 2450, // Hours
      oee: 88.5, // %
      wearIndex: 42, // Composite index
      oilTemp: 88.4,
      fePpm: 125
  });

  // 仿真循环
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // 动态负载模拟
        const loadVar = Math.sin(t * 0.5) * 15;
        setLoad(75 + loadVar);
        setRpm(2400 - loadVar * 10);
        
        setMetrics(prev => ({
            ...prev,
            oilTemp: 88 + Math.sin(t*0.1) * 2,
            fePpm: 125 + (Math.random() > 0.9 ? 1 : 0), // Slowly increasing
            wearIndex: 42 + Math.sin(t*0.05) // Fluctuate slightly
        }));

    }, 200);
    return () => clearInterval(interval);
  }, []);

  const activeData = COMPONENT_STATUS.find(c => c.id === activeComponent) || COMPONENT_STATUS[0];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#030510] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* 顶部：机械健康指挥舱 */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#1a1002] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Settings size={28} className="text-amber-400 animate-spin-slow" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 mb-1 uppercase tracking-widest font-bold">
                    <Microscope size={14} /> Tribology & Vibration Analysis
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    电机车齿轮箱 <span className="text-amber-500 font-extrabold">磨损趋势预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">剩余有效寿命 (RUL)</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.rul} <span className="text-sm text-slate-500">hrs</span></div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">油液铁屑浓度</div>
                <div className={`text-3xl font-mono font-bold ${metrics.fePpm > 200 ? 'text-red-500' : 'text-amber-400'}`}>
                    {metrics.fePpm} <span className="text-sm">ppm</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">综合磨损指数</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    <Activity size={20} className="text-amber-500" /> {metrics.wearIndex.toFixed(1)} / 100
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：摩擦学与振动分析 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 振动频谱 */}
           <SciFiCard title="啮合频率频谱 (GMF)" subtitle="VIBRATION FFT" className="h-[300px] border-amber-900/50 bg-[#0c0502]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={VIBRATION_SPECTRUM} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="freq" stroke="#78350f" tick={{fontSize: 9}} interval={10} />
                           <YAxis stroke="#78350f" tick={{fontSize: 9}} />
                           <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#000', borderColor: '#f97316', color: '#fff'}} />
                           <ReferenceLine y={3.0} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:9}} />
                           <Bar dataKey="amp" fill="#f97316" radius={[2, 2, 0, 0]}>
                               {VIBRATION_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.amp > 2 ? '#ef4444' : '#f97316'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 right-4 text-[9px] text-slate-500 bg-black/60 px-2 py-1 rounded border border-slate-800">
                       Sideband Energy High
                   </div>
               </div>
           </SciFiCard>

           {/* 铁谱分析 */}
           <SciFiCard title="铁谱磨粒特征识别" subtitle="PARTICLE TYPE" className="flex-1 border-amber-900/50">
               <div className="flex flex-col gap-3 h-full">
                   {DEBRIS_ANALYSIS.map((d, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800">
                           <div>
                               <div className="text-xs font-bold text-slate-200">{d.type}</div>
                               <div className="text-[10px] text-slate-500">{d.size}</div>
                           </div>
                           <div className="text-right">
                               <div className="text-sm font-mono font-bold text-white">{d.count}</div>
                               <span className={`text-[9px] px-1.5 rounded font-bold uppercase ${d.risk === 'High' ? 'bg-red-900/40 text-red-400' : d.risk === 'Med' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>
                                   {d.risk}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-[#050202] border border-amber-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(245,158,11,0.15)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-amber-500/30 px-4 py-3 rounded flex flex-col gap-2 shadow-2xl pointer-events-auto">
                       <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Hexagon size={14} /> Gear Dynamics Twin
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">Input RPM</div>
                               <div className="text-xl font-mono font-bold text-white">{rpm.toFixed(0)}</div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">Load Torque</div>
                               <div className="text-xl font-mono font-bold text-white">{load.toFixed(0)} <span className="text-xs text-slate-500">%</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 右侧：视图控制 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-slate-900/80 p-1 rounded border border-slate-700 flex flex-col gap-1 shadow-2xl">
                       <button onClick={() => setViewMode('mechanical')} className={`p-2 rounded ${viewMode === 'mechanical' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Mechanical"><Settings size={18}/></button>
                       <button onClick={() => setViewMode('stress')} className={`p-2 rounded ${viewMode === 'stress' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Stress"><Activity size={18}/></button>
                       <button onClick={() => setViewMode('particles')} className={`p-2 rounded ${viewMode === 'particles' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Oil Debris"><Droplets size={18}/></button>
                   </div>
               </div>

               {/* 底部：组件状态 */}
               <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-2 overflow-x-auto pb-2 custom-scrollbar pointer-events-auto">
                   {COMPONENT_STATUS.map(comp => (
                       <div 
                         key={comp.id}
                         onClick={() => setActiveComponent(comp.id)}
                         className={`min-w-[140px] p-2 rounded border cursor-pointer transition-all flex flex-col gap-1 backdrop-blur-md
                            ${activeComponent === comp.id ? 'bg-amber-900/60 border-amber-500' : 'bg-black/60 border-slate-700 hover:border-slate-500'}
                         `}
                       >
                           <div className="text-[10px] font-bold text-slate-300 truncate">{comp.name}</div>
                           <div className="flex justify-between items-center">
                               <div className={`text-xs font-bold ${comp.wearLevel > 60 ? 'text-red-400' : 'text-green-400'}`}>Wear: {comp.wearLevel}%</div>
                               <Thermometer size={10} className="text-orange-400"/>
                           </div>
                       </div>
                   ))}
               </div>

               <LocoGearboxScene 
                   rpm={rpm}
                   torqueLoad={load}
                   oilDebrisDensity={metrics.fePpm / 500}
                   viewMode={viewMode}
                   components={COMPONENT_STATUS}
                   activeComponentId={activeComponent}
                   onComponentSelect={setActiveComponent}
               />
           </div>

           {/* 磨损预测曲线 */}
           <SciFiCard title="齿面磨损深度演化预测" subtitle="WEAR DEPTH" className="h-[240px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={WEAR_PREDICTION}>
                           <defs>
                               <linearGradient id="wearGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 9}} interval={4} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:9}} />
                           <Area type="monotone" dataKey="wear" stroke="#ef4444" fill="url(#wearGrad)" strokeWidth={2} name="Mean Wear" />
                           <Area type="monotone" dataKey="lower" stroke="none" fill="#331c0a" fillOpacity={0.5} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：诊断与维护 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 选定部件详情 */}
           <SciFiCard title="选定部件诊断详情" className="flex-1 border-amber-900/50 bg-[#1a0f02]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded">
                       <div className="text-xs font-bold text-white mb-2 border-b border-amber-900/50 pb-1">{activeData.name}</div>
                       <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400">
                           <div>
                               <span className="block text-slate-600">Temperature</span>
                               <span className="text-lg font-mono text-white">{activeData.temperature}°C</span>
                           </div>
                           <div>
                               <span className="block text-slate-600">Vibration</span>
                               <span className="text-lg font-mono text-white">{activeData.vibration} mm/s</span>
                           </div>
                           <div>
                               <span className="block text-slate-600">Wear Status</span>
                               <span className={`text-lg font-mono font-bold ${activeData.wearLevel > 60 ? 'text-red-500' : 'text-green-500'}`}>{activeData.wearLevel}%</span>
                           </div>
                           <div>
                               <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                                   <div className={`h-full ${activeData.wearLevel > 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${activeData.wearLevel}%`}}></div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="mt-auto space-y-2">
                       <div className="flex items-start gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                           <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                           <div>
                               <div className="text-xs font-bold text-red-300">Failure Mode: Pitting</div>
                               <p className="text-[9px] text-slate-400 leading-tight">
                                   Localized pitting detected on tooth surface. Risk of spalling within 300 hrs.
                               </p>
                           </div>
                       </div>
                       
                       <button className="w-full py-2 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded text-xs text-amber-100 transition-colors flex items-center justify-center gap-2 group">
                           <FileText size={14} /> Schedule Inspection
                       </button>
                   </div>
               </div>
           </SciFiCard>

           {/* 润滑油状态 */}
           <SciFiCard title="润滑油综合状态" className="h-[200px] border-amber-900/50">
               <div className="flex flex-col justify-center h-full gap-4">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Viscosity Index</span>
                       <span className="text-white font-bold">98</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500" style={{width: '90%'}}></div>
                   </div>
                   
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Water Content</span>
                       <span className="text-yellow-400 font-bold">180 ppm</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-500" style={{width: '65%'}}></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Oxidation</span>
                       <span className="text-white font-bold">Low</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
