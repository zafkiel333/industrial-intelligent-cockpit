
import React, { useState, useEffect } from 'react';
import { MiningTruckThreeScene } from '../../../components/predictive/mining-truck/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import { 
  Truck, Activity, BatteryCharging, Gauge, 
  Thermometer, AlertTriangle, Settings, 
  MapPin, Clock, RotateCcw, TrendingUp,
  Cpu, Fuel, Disc, Anchor, CheckCircle2, Crosshair
} from 'lucide-react';

// --- Mock Data ---

const TIRE_DATA = [
  { id: 'FL', pressure: 105, temp: 68, wear: 25, load: 45 }, // Front Left
  { id: 'FR', pressure: 104, temp: 70, wear: 28, load: 48 }, // Front Right
  { id: 'RL', pressure: 110, temp: 82, wear: 45, load: 95 }, // Rear Left (High Load)
  { id: 'RR', pressure: 108, temp: 78, wear: 42, load: 92 }, // Rear Right
];

const ENGINE_PERFORMANCE = Array.from({length: 30}, (_, i) => ({
    time: i,
    rpm: 1600 + Math.sin(i*0.2) * 200 + Math.random()*50,
    torque: 85 + Math.cos(i*0.2) * 10,
    temp: 88 + i * 0.1
}));

const HAUL_CYCLE_STATS = [
    { name: 'Loading', value: 15, fill: '#3b82f6' },
    { name: 'Hauling (Full)', value: 45, fill: '#ef4444' }, // Loaded travel
    { name: 'Dumping', value: 5, fill: '#eab308' },
    { name: 'Return (Empty)', value: 35, fill: '#10b981' },
];

const SUSPENSION_LOAD = [
    { id: 'FL', load: 45, limit: 100 },
    { id: 'FR', load: 48, limit: 100 },
    { id: 'RL', load: 95, limit: 120 }, // Heavy rear load
    { id: 'RR', load: 92, limit: 120 },
];

export const MiningTruckHealthView: React.FC = () => {
  // --- State ---
  const [metrics, setMetrics] = useState({
      speed: 0, // km/h
      payload: 290, // tons
      fuelLevel: 65, // %
      engineTemp: 88, // C
      brakeTemp: 120, // C
      odometer: 14520, // km
      status: 'HAULING',
      healthScore: 92.5
  });

  const [simState, setSimState] = useState({
      dumpAngle: 0,
      steering: 0,
      suspension: { fl: 0.4, fr: 0.4, rl: 0.8, rr: 0.8 },
      wheelSpeed: 5
  });

  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 2000;
        
        // Simulate Truck Movement
        setMetrics(prev => ({
            ...prev,
            speed: 35 + Math.sin(t) * 5,
            engineTemp: 88 + Math.sin(t*0.1) * 2,
            brakeTemp: 120 + (Math.random() > 0.8 ? 5 : -1),
        }));

        setSimState(prev => ({
            dumpAngle: 0, // Keeping flat for hauling mode
            steering: Math.sin(t * 0.5) * 10, // Slight steering weave
            wheelSpeed: 10 + Math.sin(t) * 2,
            suspension: {
                fl: 0.4 + Math.sin(t*2)*0.02,
                fr: 0.4 + Math.cos(t*2)*0.02,
                rl: 0.8 + Math.sin(t*3)*0.05, // More movement on rear due to load
                rr: 0.8 + Math.cos(t*3)*0.05
            }
        }));

    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0a05] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      
      {/* HEADER: Heavy Machinery Theme */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#1c1200] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Truck size={32} className="text-amber-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-widest font-bold">
                    <Activity size={14} /> Ultra-Class Haul Truck Diagnostics
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    矿用自卸车 <span className="text-amber-500 font-extrabold">整车健康状态总览</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">当前载重 Payload</div>
                <div className="text-4xl font-mono font-bold text-white">{metrics.payload.toFixed(1)} <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">车辆健康度 VHI</div>
                <div className="text-3xl font-mono font-bold text-green-400">{metrics.healthScore}</div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-amber-400">作业状态</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    <RotateCcw size={20} className="text-amber-500 animate-spin-slow" /> {metrics.status}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：底盘与轮胎 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 轮胎 TPMS 矩阵 */}
           <SciFiCard title="轮胎温压监测 (TPMS)" subtitle="TIRE HEALTH" className="border-amber-900/50 bg-[#160f05]/80">
               <div className="grid grid-cols-2 gap-3 py-2">
                   {TIRE_DATA.map((tire) => (
                       <div 
                         key={tire.id} 
                         className={`p-2 rounded border transition-all cursor-pointer relative overflow-hidden group
                            ${activeComponent === `tire-${tire.id.toLowerCase()}` ? 'bg-amber-900/40 border-amber-500' : 'bg-slate-900/50 border-slate-800 hover:border-amber-500/50'}
                         `}
                         onClick={() => setActiveComponent(`tire-${tire.id.toLowerCase()}`)}
                       >
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold text-slate-300">{tire.id}</span>
                               <span className={`text-[10px] font-bold ${tire.temp > 80 ? 'text-red-500' : 'text-green-400'}`}>
                                   {tire.temp}°C
                               </span>
                           </div>
                           <div className="flex justify-between items-end">
                               <div className="text-lg font-mono text-white">{tire.pressure} <span className="text-[9px] text-slate-500">psi</span></div>
                               <Disc size={16} className={tire.wear > 40 ? 'text-orange-500' : 'text-slate-600'} />
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                               <div className={`h-full ${tire.load > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${tire.load}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* 悬挂载荷平衡 */}
           <SciFiCard title="油气悬挂载荷分布" subtitle="SUSPENSION" className="flex-1 border-amber-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SUSPENSION_LOAD} layout="vertical" margin={{left: -10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" horizontal={false} />
                           <XAxis type="number" stroke="#78350f" tick={{fontSize: 9}} hide />
                           <YAxis dataKey="id" type="category" stroke="#d97706" width={30} tick={{fontSize: 10, fontWeight: 'bold'}} />
                           <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#0c0800', borderColor: '#f59e0b'}} />
                           <Bar dataKey="load" barSize={15} radius={[0, 4, 4, 0]}>
                               {SUSPENSION_LOAD.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.load > 90 ? '#ef4444' : '#f59e0b'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Payload Bias: <span className="text-red-400 font-bold">REAR HEAVY (58%)</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-gradient-to-b from-[#0a0602] to-[#020100] border border-amber-800/40 relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(245,158,11,0.15)] group">
               
               {/* 视口 HUD */}
               <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-amber-500/30 px-5 py-4 rounded-lg flex flex-col gap-3 shadow-2xl">
                       <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Truck size={14} /> Vehicle Telemetry
                       </div>
                       <div className="flex items-center gap-10">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">行驶速度</div>
                               <div className="text-2xl font-mono font-bold text-white">{metrics.speed.toFixed(1)} <span className="text-xs">km/h</span></div>
                           </div>
                           <div className="w-[1px] h-10 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase mb-1">燃油剩余</div>
                               <div className="text-2xl font-mono font-bold text-orange-400">{metrics.fuelLevel} <span className="text-xs">%</span></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 底部 HUD：动力流状态 */}
               <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end pointer-events-none">
                   <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-black/60 px-2 py-1 rounded">DRIVE MODE</span>
                        <div className="px-3 py-1 bg-green-900/60 border border-green-500/50 rounded text-xs text-green-300 font-bold animate-pulse">
                            PROPULSION ACTIVE
                        </div>
                   </div>
                   <div className="bg-black/60 backdrop-blur border border-slate-700 p-3 rounded w-48">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Torque</span>
                            <span>18,450 Nm</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[75%]"></div>
                        </div>
                   </div>
               </div>

               <MiningTruckThreeScene 
                   dumpAngle={simState.dumpAngle}
                   steeringAngle={simState.steering}
                   wheelSpeed={simState.wheelSpeed}
                   suspensionCompression={simState.suspension}
                   payload={metrics.payload}
                   activeComponent={activeComponent}
                   isRunning={true}
               />
           </div>

           {/* 运载循环分析 */}
           <SciFiCard title="运载循环效率分析 (Haul Cycle)" subtitle="TIME DISTRIBUTION" className="h-[220px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4 flex gap-6">
                   <div className="h-full aspect-square">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie
                                   data={HAUL_CYCLE_STATS}
                                   innerRadius={40}
                                   outerRadius={60}
                                   paddingAngle={5}
                                   dataKey="value"
                               >
                                   {HAUL_CYCLE_STATS.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                               </Pie>
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           </PieChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="flex-1 flex flex-col justify-center gap-2">
                        {HAUL_CYCLE_STATS.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-1">
                                <span className="flex items-center gap-2 text-slate-300">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                                    {item.name}
                                </span>
                                <span className="font-mono font-bold text-white">{item.value}%</span>
                            </div>
                        ))}
                        <div className="mt-2 text-[10px] text-slate-500">
                            Avg Cycle Time: <span className="text-amber-400 font-bold">42 min</span>
                        </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：动力与故障诊断 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* 发动机性能曲线 */}
           <SciFiCard title="发动机性能曲线" subtitle="V16 DIESEL" className="flex-1 border-amber-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ENGINE_PERFORMANCE}>
                               <defs>
                                   <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                               <XAxis dataKey="time" hide />
                               <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0800', borderColor: '#f59e0b'}} />
                               <Area type="monotone" dataKey="rpm" stroke="#f59e0b" fill="url(#engGrad)" strokeWidth={2} name="RPM" />
                               <Line type="monotone" dataKey="torque" stroke="#ef4444" strokeWidth={2} dot={false} name="Torque %" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 mt-4">
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500">Oil Pressure</div>
                           <div className="text-lg font-mono font-bold text-white">420 <span className="text-xs">kPa</span></div>
                       </div>
                       <div className="p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                           <div className="text-[9px] text-slate-500">Coolant Temp</div>
                           <div className="text-lg font-mono font-bold text-white">{metrics.engineTemp.toFixed(1)}°C</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* 智能诊断与告警 */}
           <SciFiCard title="智能维护建议" className="h-[280px] border-amber-900/50 bg-[#1a0f00]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex items-start gap-3 shadow-inner">
                       <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
                       <div>
                           <div className="text-xs font-bold text-white uppercase">后桥悬挂压力异常</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                               左后 (RL) 悬挂柱压力偏高 15%，且压缩行程受限。疑似氮气泄漏或负载严重偏载。
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l-2 border-amber-500 pl-2">优先级任务 (Priority)</div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 检查 RL 悬挂充气阀
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-slate-800/50">
                           <CheckCircle2 size={14} className="text-green-500" /> 校准车载称重系统
                       </div>
                   </div>

                   <button 
                     onClick={() => setActiveComponent('suspension-rl')}
                     className="mt-auto w-full py-3 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded-xl text-xs text-amber-100 font-bold transition-all flex items-center justify-center gap-2 group shadow-lg"
                   >
                       <Crosshair size={16} className="group-hover:rotate-45 transition-transform" /> 
                       定位故障部位
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>

      {/* 底部装饰条 */}
      <div className="h-6 flex gap-6 text-[10px] text-slate-600 font-mono overflow-hidden items-center px-4 border-t border-slate-900 mt-2">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> VIMS_LINK: CONNECTED</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500"></div> GPS_ACCURACY: 2.5cm</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500"></div> PREDICTION_MODEL: V3.2</div>
          <div className="flex-1 text-right text-amber-900 font-bold uppercase tracking-widest italic">Autonomous Haulage System Ready</div>
      </div>
    </div>
  );
};
