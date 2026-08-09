
import React, { useState, useEffect } from 'react';
import { BrakingThreeScene } from '../../../components/predictive/mining-locomotive-braking/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-18]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-18';
import { BrakePadState } from '../../../components/predictive/mining-locomotive-braking/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  Activity, Gauge, Thermometer, AlertOctagon, 
  TrendingUp, TrendingDown, Timer, ShieldCheck, 
  Wind, Zap, StopCircle, PlayCircle, Lock, ScanLine, FileText
} from 'lucide-react';

// --- 模拟数据 ---

// 制动距离曲线 (速度 vs 距离)
const BRAKING_CURVE = Array.from({length: 50}, (_, i) => {
    const v = i * 2; // km/h
    // d = v^2 / (2 * mu * g), simplified
    const dryDist = (v * v) / 250; 
    const wetDist = (v * v) / 180;
    return { speed: v, dry: dryDist, wet: wetDist };
});

// 热衰退曲线 (温度 vs 摩擦系数)
const FADE_CURVE = Array.from({length: 40}, (_, i) => {
    const temp = 20 + i * 20;
    // Stable until 300C, then drops
    let mu = 0.38;
    if (temp > 300) mu = 0.38 - Math.pow((temp-300)/400, 2) * 0.4;
    return { temp, mu: Math.max(0.1, mu), limit: 0.25 };
});

// 闸瓦磨损趋势
const WEAR_TREND = Array.from({length: 12}, (_, i) => ({
    month: `M-${12-i}`,
    thickness: 45 - i * 1.5 - Math.random()*0.5,
    limit: 10
}));

const PAD_STATUS: BrakePadState[] = [
    { id: 'FL', thickness: 32, temperature: 45, wearRate: 1.2 },
    { id: 'FR', thickness: 30, temperature: 48, wearRate: 1.3 },
    { id: 'RL', thickness: 28, temperature: 42, wearRate: 1.1 },
    { id: 'RR', thickness: 29, temperature: 44, wearRate: 1.15 },
];

export const LocomotiveBrakingReliabilityView: React.FC = () => {
  // --- 状态 ---
  const [speed, setSpeed] = useState(60);
  const [brakePressure, setBrakePressure] = useState(0); // kPa
  const [mrPressure, setMrPressure] = useState(850); // Main Reservoir
  const [temp, setTemp] = useState(45);
  const [isBraking, setIsBraking] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'thermal'>('visual');
  const [reliability, setReliability] = useState(98.5);

  // 仿真循环
  useEffect(() => {
    const interval = setInterval(() => {
        if (isBraking) {
            setSpeed(prev => Math.max(0, prev - (isEmergency ? 2.5 : 1.0)));
            setBrakePressure(prev => Math.min(isEmergency ? 450 : 300, prev + 50));
            setMrPressure(prev => Math.max(600, prev - 2));
            setTemp(prev => Math.min(700, prev + (speed > 10 ? 5 : 0)));
        } else {
            // Accelerate / Coast
            setSpeed(prev => Math.min(100, prev + 0.5));
            setBrakePressure(prev => Math.max(0, prev - 30));
            setMrPressure(prev => Math.min(900, prev + 1)); // Compressor refill
            setTemp(prev => Math.max(25, prev - 1)); // Cooling
        }
        
        // Reliability drops with high temp
        setReliability(prev => {
            const decay = temp > 400 ? 0.05 : 0;
            return Math.max(0, prev - decay);
        });

    }, 50);
    return () => clearInterval(interval);
  }, [isBraking, isEmergency, speed, temp]);

  // Derived Metrics
  const stoppingDist = (speed * speed) / 200; // Est distance
  const efficiency = temp > 400 ? (1 - (temp-400)/400) * 100 : 100;

  const toggleBrake = () => {
      setIsBraking(!isBraking);
      if (isBraking) setIsEmergency(false); // Reset emergency when releasing
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-rose-50 p-2 overflow-y-auto custom-scrollbar selection:bg-rose-500/30">
      
      {/* 顶部：制动安全看板 */}
      <div className="flex justify-between items-end border-b border-rose-900/40 pb-4 bg-gradient-to-r from-[#210202] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-rose-600/20 rounded-lg border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                <AlertOctagon size={28} className="text-rose-500 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-rose-400 mb-1 uppercase tracking-widest font-bold">
                    <ShieldCheck size={14} /> Pneumatic Safety Systems
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    电机车制动系统 <span className="text-rose-500 font-extrabold">可靠性预测</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">制动可靠性指数</div>
                <div className={`text-4xl font-mono font-bold ${reliability > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {reliability.toFixed(1)}%
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">当前制动效能</div>
                <div className="text-3xl font-mono font-bold text-white">
                    {efficiency.toFixed(0)}<span className="text-sm">%</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-cyan-400">预计停车距离</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white uppercase font-mono">
                    {speed > 0 ? stoppingDist.toFixed(1) : '0.0'} <span className="text-sm text-slate-500">m</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* 左侧：气路与控制 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 风压监测 */}
           <SciFiCard title="气动管路压力监测" subtitle="PNEUMATICS" className="border-rose-900/50 bg-[#0f0404]/80">
               <div className="flex flex-col gap-4 py-2">
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 relative overflow-hidden">
                       <div className="flex justify-between items-center mb-1 relative z-10">
                           <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                               <Wind size={14} className="text-cyan-400"/> 总风缸 (MR)
                           </span>
                           <span className="text-xl font-mono text-cyan-300">{mrPressure.toFixed(0)} <span className="text-xs">kPa</span></span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
                           <div className="bg-cyan-500 h-full transition-all duration-300" style={{width: `${(mrPressure/1000)*100}%`}}></div>
                       </div>
                   </div>

                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 relative overflow-hidden">
                       <div className="flex justify-between items-center mb-1 relative z-10">
                           <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                               <Gauge size={14} className="text-rose-400"/> 制动缸 (BC)
                           </span>
                           <span className="text-xl font-mono text-white">{brakePressure.toFixed(0)} <span className="text-xs">kPa</span></span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
                           <div className="bg-rose-500 h-full transition-all duration-100" style={{width: `${(brakePressure/600)*100}%`}}></div>
                       </div>
                   </div>

                   <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                       <span className="text-xs text-slate-500">空气压缩机状态</span>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded ${mrPressure < 750 ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                           {mrPressure < 750 ? 'LOADING' : 'UNLOADED'}
                       </span>
                   </div>
               </div>
           </SciFiCard>

           {/* 阀组状态 */}
           <SciFiCard title="DK-2 制动控制器状态" className="flex-1 border-rose-900/50">
               <div className="grid grid-cols-2 gap-3 h-full content-start">
                   <div className={`p-2 rounded border text-center transition-all ${!isBraking ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/30 border-slate-800'}`}>
                       <div className="text-[10px] text-slate-400 uppercase">充气缓解</div>
                       <div className="text-lg font-bold text-white">{!isBraking ? 'ACTIVE' : 'OFF'}</div>
                   </div>
                   <div className={`p-2 rounded border text-center transition-all ${isBraking && !isEmergency ? 'bg-yellow-900/30 border-yellow-500' : 'bg-slate-900/30 border-slate-800'}`}>
                       <div className="text-[10px] text-slate-400 uppercase">常用制动</div>
                       <div className="text-lg font-bold text-white">{isBraking && !isEmergency ? 'APPLY' : 'OFF'}</div>
                   </div>
                   <div className={`p-2 rounded border text-center col-span-2 transition-all ${isEmergency ? 'bg-red-900/40 border-red-500 animate-pulse' : 'bg-slate-900/30 border-slate-800'}`}>
                       <div className="text-[10px] text-slate-400 uppercase">紧急制动 (EB)</div>
                       <div className="text-lg font-bold text-white">{isEmergency ? 'EMERGENCY ACTIVE' : 'READY'}</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* 中间：3D 数字孪生 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D 视口 */}
           <div className="flex-1 min-h-[450px] bg-[#050101] border border-rose-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(225,29,72,0.15)] group">
               
               {/* 顶部 HUD */}
               <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-black/70 backdrop-blur border border-rose-500/30 px-4 py-3 rounded flex flex-col gap-2">
                       <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} /> Braking Physics Twin
                       </div>
                       <div className="flex items-center gap-8">
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">行驶速度</div>
                               <div className="text-3xl font-mono font-bold text-white">{speed.toFixed(1)} <span className="text-xs">km/h</span></div>
                           </div>
                           <div className="w-[1px] h-8 bg-slate-800"></div>
                           <div>
                               <div className="text-[9px] text-slate-500 uppercase">盘面温度</div>
                               <div className={`text-3xl font-mono font-bold ${temp > 400 ? 'text-red-500' : 'text-orange-400'}`}>
                                   {temp.toFixed(0)} <span className="text-xs">°C</span>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 底部控制 */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                   <button 
                     onClick={toggleBrake}
                     className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg border
                        ${isBraking ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-cyan-700 border-cyan-500 text-white'}
                     `}
                   >
                       {isBraking ? <PlayCircle size={16}/> : <StopCircle size={16}/>}
                       {isBraking ? 'RELEASE' : 'APPLY BRAKE'}
                   </button>

                   <button 
                     onClick={() => { setIsBraking(true); setIsEmergency(true); }}
                     className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg border border-red-500
                        ${isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-red-950/50 text-red-400 hover:bg-red-900'}
                     `}
                   >
                       <AlertOctagon size={16}/> EMERGENCY
                   </button>
               </div>

               {/* 视图切换 */}
               <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-auto">
                   <button onClick={() => setViewMode('visual')} className={`p-2 rounded border ${viewMode === 'visual' ? 'bg-rose-600 border-rose-400' : 'bg-black/60 border-slate-700 text-slate-400'}`}>
                       <ScanLine size={16}/>
                   </button>
                   <button onClick={() => setViewMode('thermal')} className={`p-2 rounded border ${viewMode === 'thermal' ? 'bg-orange-600 border-orange-400' : 'bg-black/60 border-slate-700 text-slate-400'}`}>
                       <Thermometer size={16}/>
                   </button>
               </div>

               <BrakingThreeScene 
                   speed={speed}
                   brakePressure={brakePressure}
                   discTemperature={temp}
                   isEmergencyBraking={isEmergency}
                   pads={PAD_STATUS}
                   viewMode={viewMode}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* 制动距离预测曲线 */}
           <SciFiCard title="制动距离预测 (Safe Stop Envelope)" subtitle="SPEED vs DISTANCE" className="h-[220px] border-rose-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={BRAKING_CURVE}>
                           <defs>
                               <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" vertical={false} />
                           <XAxis dataKey="speed" stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Speed (km/h)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} label={{ value: 'Dist (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#050101', borderColor: '#ef4444'}} />
                           <Area type="monotone" dataKey="wet" stroke="#0ea5e9" fill="none" strokeDasharray="3 3" name="湿滑路面" />
                           <Area type="monotone" dataKey="dry" stroke="#ef4444" fill="url(#distGrad)" name="干燥路面" />
                           {/* Current Speed Ref */}
                           <ReferenceLine x={speed} stroke="#fff" label={{value:'Curr', fill:'#fff', fontSize:10}} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* 右侧：热衰退与磨损 */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 pointer-events-auto">
           
           {/* 热衰退曲线 */}
           <SciFiCard title="热衰退特性 (Fade Characteristics)" subtitle="FRICTION COEFF" className="h-[280px] border-rose-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={FADE_CURVE}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#2a0a0a" />
                           <XAxis dataKey="temp" stroke="#7f1d1d" tick={{fontSize: 9}} />
                           <YAxis stroke="#7f1d1d" tick={{fontSize: 9}} domain={[0, 0.5]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <Line type="monotone" dataKey="mu" stroke="#f97316" strokeWidth={2} dot={false} />
                           <ReferenceLine y={0.25} stroke="red" strokeDasharray="3 3" label={{value:'Failure', fill:'red', fontSize:9}} />
                           <ReferenceLine x={temp} stroke="white" />
                       </ComposedChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-1">
                       High Temp = Low Friction Risk
                   </div>
               </div>
           </SciFiCard>

           {/* 闸瓦磨损趋势 */}
           <SciFiCard title="闸瓦磨损预测 (RUL)" className="flex-1 border-rose-900/50 bg-[#160404]/20">
               <div className="flex flex-col gap-4 h-full">
                   <div className="h-32 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={WEAR_TREND}>
                               <Bar dataKey="thickness" fill="#334155">
                                   {WEAR_TREND.map((e, i) => (
                                       <Cell key={i} fill={e.thickness < 15 ? '#ef4444' : '#334155'} />
                                   ))}
                               </Bar>
                               <ReferenceLine y={10} stroke="red" />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">Est. Mileage Left</span>
                           <span className="text-white font-mono">12,450 km</span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-1">
                           <span className="text-slate-400">Next Service</span>
                           <span className="text-yellow-400 font-mono">15 Days</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-rose-700/30 hover:bg-rose-700/50 border border-rose-500/50 rounded text-xs text-rose-100 font-bold transition-all flex items-center justify-center gap-2">
                       <FileText size={14} /> Schedule Pad Replacement
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
