
import React, { useState, useEffect } from 'react';
import { MiningBrakeScene } from '../../../components/predictive/mining-brake/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-14]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-14';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend, ComposedChart
} from 'recharts';
import { 
  Thermometer, Gauge, AlertOctagon, TrendingDown, 
  Activity, Timer, ShieldCheck, Droplets, 
  Flame, Skull, RotateCcw, AlertTriangle, FileText,
  Settings
} from 'lucide-react';

// --- Mock Data ---

// Brake Fade Curve (Temp vs Friction Coeff)
const FADE_CURVE = Array.from({length: 50}, (_, i) => {
    const temp = 50 + i * 10;
    // Friction drops sharply after 350C
    let mu = 0.45;
    if (temp > 300) mu = 0.45 - Math.pow((temp-300)/200, 2) * 0.3;
    return { temp, mu: Math.max(0.1, mu), limit: 0.25 };
});

// Cooling Performance (Delta T)
const COOLING_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    inlet: 45,
    outlet: 45 + 10 * Math.sin(i*0.5) + (i > 20 ? -5 : 0) // Efficiency drop at end
}));

// RUL Weibull
const RUL_DATA = Array.from({length: 40}, (_, i) => {
    const t = i * 2; // Hours
    const prob = 100 * Math.exp(-Math.pow(t/48, 2.5)); // Failure in ~48h
    return { time: t, prob: prob.toFixed(1) };
});

// Component Matrix
const COMPONENTS = [
    { name: 'Front Disc L', temp: 240, wear: 45, status: 'normal' },
    { name: 'Front Disc R', temp: 255, wear: 48, status: 'normal' },
    { name: 'Rear Stack L', temp: 380, wear: 82, status: 'critical' }, // Overheating
    { name: 'Rear Stack R', temp: 310, wear: 65, status: 'warning' },
];

export const MiningBrakeFailureView: React.FC = () => {
  // --- State ---
  const [speed, setSpeed] = useState(40);
  const [brakePressure, setBrakePressure] = useState(0);
  const [temp, setTemp] = useState(120);
  const [wear, setWear] = useState(0.4); // 40%
  const [isBraking, setIsBraking] = useState(false);
  const [viewMode, setViewMode] = useState<'thermal' | 'mechanical' | 'wear'>('thermal');
  const [simTime, setSimTime] = useState(0);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setSimTime(prev => prev + 1);
        
        // Brake Cycle Simulation
        // Cycle: Accelerate -> Brake -> Cool -> Accelerate
        const cycle = (Date.now() / 3000) % 2; // 2 phases
        const braking = cycle > 1.2; // Braking phase

        setIsBraking(braking);

        if (braking) {
            setBrakePressure(prev => Math.min(180, prev + 10));
            setSpeed(prev => Math.max(0, prev - 2));
            setTemp(prev => Math.min(450, prev + 5)); // Heat up
        } else {
            setBrakePressure(prev => Math.max(0, prev - 20));
            setSpeed(prev => Math.min(55, prev + 1));
            setTemp(prev => Math.max(80, prev - 1)); // Cool down
        }

    }, 50);
    return () => clearInterval(interval);
  }, []);

  const ttf = Math.max(0, 48 - (temp > 350 ? (temp-350)/10 : 0)); // Dynamic TTF based on heat

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050101] text-red-50 p-2 overflow-y-auto custom-scrollbar selection:bg-red-500/30">
      
      {/* HEADER: Critical Alert Style */}
      <div className="flex justify-between items-end border-b border-red-900/40 pb-4 bg-gradient-to-r from-[#2b0505] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-red-600/20 rounded-lg border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <AlertOctagon size={32} className="text-red-500 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-red-400 mb-1 uppercase tracking-widest font-bold">
                    <Activity size={14} /> Critical Safety System
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    制动系统 <span className="text-red-500 italic">失效时间窗口预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">预测失效倒计时 (TTF)</div>
                <div className={`text-4xl font-mono font-bold ${ttf < 24 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {ttf.toFixed(1)} <span className="text-sm text-slate-500">Hours</span>
                </div>
            </div>
            <div className="h-10 w-[1px] bg-red-900/50"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">当前制动效能</div>
                <div className="text-3xl font-mono font-bold text-yellow-400">
                    {(100 - (temp > 300 ? (temp-300)/5 : 0)).toFixed(1)}%
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400">热衰退风险</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase">
                    {temp > 350 ? <Flame className="text-red-500 animate-bounce" /> : <ShieldCheck className="text-green-500" />}
                    {temp > 350 ? 'CRITICAL FADE' : 'STABLE'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Thermal & Pressure */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* Thermal Fade Analysis */}
           <SciFiCard title="热衰退特性曲线 (Fade Curve)" subtitle="FRICTION vs TEMP" className="h-[300px] border-red-900/50 bg-[#120404]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={FADE_CURVE}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" />
                           <XAxis dataKey="temp" stroke="#7f1d1d" tick={{fontSize: 10}} label={{ value: 'Temp (°C)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#7f1d1d" tick={{fontSize: 10}} domain={[0, 0.6]} label={{ value: 'Coeff (μ)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="mu" stroke="#ef4444" fill="url(#colorFade)" strokeWidth={2} />
                           <ReferenceLine y={0.25} stroke="yellow" strokeDasharray="3 3" label={{value:'Limit', fill:'yellow', fontSize:9}} />
                           
                           {/* Operating Point */}
                           <ReferenceLine x={temp} stroke="white" label={{value:'Current', fill:'white', fontSize:9}} />
                           
                           <defs>
                               <linearGradient id="colorFade" x1="0" y1="0" x2="1" y2="0">
                                   <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                                   <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
                               </linearGradient>
                           </defs>
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Hydraulic Pressure Monitor */}
           <SciFiCard title="制动液压响应" subtitle="HYDRAULICS" className="flex-1 border-red-900/50">
               <div className="flex flex-col gap-4 h-full py-2">
                   <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="flex items-center gap-2 text-xs text-slate-300">
                           <Gauge size={16} className="text-cyan-400" /> Rear Brake Pressure
                       </div>
                       <div className="text-2xl font-mono text-white font-bold">{brakePressure.toFixed(0)} <span className="text-xs text-slate-500">bar</span></div>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between text-xs text-slate-400">
                           <span>Accumulator Charge</span>
                           <span className="text-green-400">92%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{width: '92%'}}></div>
                       </div>
                       
                       <div className="flex justify-between text-xs text-slate-400 mt-2">
                           <span>Pump Flow Rate</span>
                           <span className="text-yellow-400">185 L/min</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-yellow-500" style={{width: '75%'}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[450px] bg-[#0a0202] border border-red-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(220,38,38,0.15)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setViewMode('thermal')} className={`px-3 py-1.5 rounded text-xs border font-bold transition-all ${viewMode === 'thermal' ? 'bg-red-600 text-white border-red-500' : 'bg-black/50 text-slate-400 border-slate-700'}`}>
                       <Thermometer size={12} className="inline mr-1"/> Thermal
                   </button>
                   <button onClick={() => setViewMode('mechanical')} className={`px-3 py-1.5 rounded text-xs border font-bold transition-all ${viewMode === 'mechanical' ? 'bg-red-600 text-white border-red-500' : 'bg-black/50 text-slate-400 border-slate-700'}`}>
                       <Settings size={12} className="inline mr-1"/> Mechanical
                   </button>
               </div>

               {/* Central HUD */}
               <div className="absolute top-4 right-4 z-10 text-right">
                   <div className="bg-black/60 backdrop-blur border border-red-500/20 px-4 py-2 rounded">
                       <div className="text-[10px] text-red-400 uppercase font-bold mb-1">Disc Temperature</div>
                       <div className="text-3xl font-mono font-bold text-white">{temp.toFixed(0)}°C</div>
                       <div className="text-[10px] text-slate-500 mt-1">Peak: 480°C</div>
                   </div>
               </div>
               
               {/* Status Badge */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className={`px-6 py-2 rounded-full font-bold text-sm border flex items-center gap-2 backdrop-blur
                        ${isBraking ? 'bg-red-600/80 border-red-400 text-white shadow-[0_0_20px_red]' : 'bg-slate-800/80 border-slate-600 text-slate-300'}
                    `}>
                        {isBraking ? 'BRAKING ACTIVE' : 'COASTING'}
                    </div>
               </div>

               <MiningBrakeScene 
                   rotationSpeed={speed * 10}
                   brakePressure={brakePressure}
                   temperature={temp}
                   isBraking={isBraking}
                   wearLevel={wear}
                   viewMode={viewMode}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Cooling Efficiency */}
           <SciFiCard title="湿式制动冷却效率 (Cooling ΔT)" subtitle="HEAT DISSIPATION" className="h-[220px] border-red-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COOLING_DATA}>
                           <defs>
                               <linearGradient id="coolGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                           <Area type="monotone" dataKey="outlet" stroke="#3b82f6" fill="url(#coolGrad)" name="Outlet Temp" />
                           <Line type="monotone" dataKey="inlet" stroke="#10b981" strokeDasharray="5 5" name="Inlet Temp" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Prognostics & Maintenance */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* RUL Weibull */}
           <SciFiCard title="失效概率分布 (Survival)" subtitle="WEIBULL" className="h-[300px] border-red-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={RUL_DATA}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" />
                           <XAxis dataKey="time" stroke="#7f1d1d" tick={{fontSize: 10}} label={{value: 'Hours', position: 'insideBottom', offset: -5, fontSize: 10}} />
                           <YAxis stroke="#7f1d1d" tick={{fontSize: 10}} label={{value: 'Reliability %', angle: -90, position: 'insideLeft', fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="prob" stroke="#ef4444" fill="#ef444433" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-2">
                       Probability of thermal failure exceeds 80% in 48 hours.
                   </div>
               </div>
           </SciFiCard>

           {/* Component Status */}
           <SciFiCard title="组件健康状态矩阵" className="flex-1 border-red-900/50 bg-[#160808]/80">
               <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1">
                   {COMPONENTS.map((comp, i) => (
                       <div key={i} className={`p-2 rounded border flex justify-between items-center ${comp.status === 'critical' ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/40 border-slate-800'}`}>
                           <div>
                               <div className="text-xs font-bold text-white">{comp.name}</div>
                               <div className="text-[9px] text-slate-400">Wear: {comp.wear}%</div>
                           </div>
                           <div className="text-right">
                               <div className={`text-sm font-mono font-bold ${comp.temp > 300 ? 'text-red-500' : 'text-yellow-400'}`}>{comp.temp}°C</div>
                           </div>
                       </div>
                   ))}
               </div>
               <button className="mt-4 w-full py-2 bg-red-700/30 hover:bg-red-600/50 border border-red-500/50 rounded text-xs text-red-100 font-bold transition-all flex items-center justify-center gap-2">
                   <FileText size={14} /> 生成紧急维修工单
               </button>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
