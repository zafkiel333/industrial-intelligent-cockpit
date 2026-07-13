
import React, { useState, useEffect } from 'react';
import { DisconnectSwitchScene } from '../../../components/predictive/hydro-disconnect/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-22]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-22';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Zap, Thermometer, Activity, AlertTriangle, 
  RotateCw, Gauge, History, Layers, 
  ChevronRight, Unlock, Lock, Fingerprint
} from 'lucide-react';

// --- Mock Data ---

// Resistance Evolution (Micro-ohms)
const RESISTANCE_DATA = Array.from({length: 30}, (_, i) => {
    const t = i;
    // Exponential degradation curve
    const baseR = 45; // Initial resistance
    const r = baseR * Math.exp(0.02 * t) + Math.random() * 2;
    return {
        day: `T-${30-i}`,
        resistance: r,
        limit: 80 // Critical limit
    };
});

// Torque Curve (Last Operation)
const TORQUE_CURVE = Array.from({length: 50}, (_, i) => {
    // Opening curve: Peak at start (breakout), then smooth
    const pos = i * 2; // 0 to 100 degrees roughly
    let torque = 0;
    if (i < 5) torque = 120 + i * 10; // Breakout friction
    else if (i < 15) torque = 180 - (i-5)*5; // Release
    else torque = 130 + Math.sin(i*0.2)*5; // Travel friction
    
    return { pos: `${pos}%`, torque };
});

// Contact Fingerprint Radar
const CONTACT_HEALTH = [
    { subject: '接触电阻', A: 65, fullMark: 100 }, // Degraded
    { subject: '触指压力', A: 85, fullMark: 100 },
    { subject: '表面镀银', A: 50, fullMark: 100 }, // Worn
    { subject: '机械对中', A: 90, fullMark: 100 },
    { subject: '热稳定性', A: 60, fullMark: 100 }, // Getting hot
    { subject: '操作力矩', A: 88, fullMark: 100 },
];

export const DisconnectSwitchWearView: React.FC = () => {
  // --- STATE ---
  const [switchState, setSwitchState] = useState<'open' | 'closed' | 'opening' | 'closing'>('closed');
  const [angle, setAngle] = useState(0); // 0 = Closed
  const [metrics, setMetrics] = useState({
      resistance: 68.5, // uOhm
      temp: 85.4, // C (Hot!)
      load: 1250, // A
      wear: 75, // %
      torquePeak: 185, // Nm
      cycles: 2450
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [showThermal, setShowThermal] = useState(true);

  // Operation Simulation
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
        interval = setInterval(() => {
            setAngle(prev => {
                const target = switchState === 'opening' ? 90 : 0;
                const step = 2;
                if (Math.abs(prev - target) < step) {
                    setIsSimulating(false);
                    setSwitchState(target === 90 ? 'open' : 'closed');
                    return target;
                }
                return prev + (target > prev ? step : -step);
            });
        }, 30);
    }
    return () => clearInterval(interval);
  }, [isSimulating, switchState]);

  // Real-time fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            temp: 85 + Math.sin(Date.now()/1000) * 0.5 + (angle === 0 ? 0 : -40), // Cools down when open
            resistance: 68.5 + Math.random() * 0.2
        }));
    }, 1000);
    return () => clearInterval(timer);
  }, [angle]);

  const toggleSwitch = () => {
      if (isSimulating) return;
      const newState = switchState === 'closed' ? 'opening' : 'closing';
      setSwitchState(newState);
      setIsSimulating(true);
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0502] text-orange-50 p-2 overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-[#2b1000] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             Contact Health Monitoring
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             隔离开关触头 <span className="text-orange-500">磨损风险预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Contact Resistance</div>
                <div className="text-3xl font-mono font-bold text-red-400">{metrics.resistance.toFixed(1)} <span className="text-sm text-slate-500">μΩ</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Hot Spot Temp</div>
                <div className={`text-2xl font-mono font-bold ${metrics.temp > 80 ? 'text-orange-500 animate-pulse' : 'text-white'}`}>
                    {metrics.temp.toFixed(1)} <span className="text-sm text-slate-500">°C</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Est. Cycles Left</div>
                <div className="text-2xl font-mono font-bold text-white">450 <span className="text-sm text-slate-500">Ops</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Resistance & Thermal Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Resistance Trend */}
           <SciFiCard title="接触电阻演变趋势" subtitle="MICRO-OHM" className="h-[300px] border-orange-900/50 bg-[#160800]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={RESISTANCE_DATA}>
                           <defs>
                               <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="day" stroke="#7c2d12" tick={{fontSize: 10}} interval={5} />
                           <YAxis stroke="#f97316" tick={{fontSize: 10}} domain={[40, 100]} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0500', borderColor: '#f97316', color: '#fff'}} />
                           <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                           <Area type="monotone" dataKey="resistance" stroke="#f97316" strokeWidth={2} fill="url(#colorRes)" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 left-16 bg-black/60 px-2 py-1 rounded border border-orange-900/50 text-[10px] text-orange-300">
                       Rate: +0.2 μΩ/day
                   </div>
               </div>
           </SciFiCard>

           {/* Health Radar */}
           <SciFiCard title="触头健康指纹 (Fingerprint)" className="flex-1 border-orange-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CONTACT_HEALTH}>
                           <PolarGrid stroke="#331c0a" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Health" dataKey="A" stroke="#fb923c" strokeWidth={2} fill="#fb923c" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0500', borderColor: '#fb923c', color: '#fff'}} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin & Controls */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#050201] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(249,115,22,0.1)]">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-3">
                   <button 
                     onClick={() => setShowThermal(!showThermal)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${showThermal ? 'bg-orange-600 border-orange-400 text-white' : 'bg-black/50 border-slate-700 text-slate-400'}`}
                   >
                       <Thermometer size={14} /> Thermal Overlay
                   </button>
               </div>

               <div className="absolute top-4 right-4 z-10">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-orange-500/20 text-right">
                       <div className="text-[10px] text-slate-400 uppercase mb-1">Wear Level</div>
                       <div className="text-xl font-bold text-white">{metrics.wear}%</div>
                       <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                           <div className="h-full bg-red-500" style={{width: `${metrics.wear}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Operation Button */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                   <button 
                     onClick={toggleSwitch}
                     disabled={isSimulating}
                     className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all shadow-lg
                        ${switchState === 'closed' 
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' 
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/50'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                     `}
                   >
                       {isSimulating ? <RotateCw className="animate-spin" /> : (switchState === 'closed' ? <Lock size={16}/> : <Unlock size={16}/>)}
                       {switchState === 'closed' ? 'OPEN SWITCH' : 'CLOSE SWITCH'}
                   </button>
               </div>

               <DisconnectSwitchScene 
                   switchState={switchState}
                   bladeAngle={angle}
                   contactTemp={metrics.temp}
                   wearLevel={metrics.wear}
                   sparkIntensity={isSimulating && angle > 5 && angle < 20 ? 1 : 0} // Spark on break/make
                   showThermal={showThermal}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Torque Curve */}
           <SciFiCard title="机械操作力矩曲线 (Torque Signature)" subtitle="LAST OPERATION" className="h-[250px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={TORQUE_CURVE}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="pos" stroke="#7c2d12" tick={{fontSize: 10}} label={{ value: 'Travel (%)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis stroke="#7c2d12" tick={{fontSize: 10}} label={{ value: 'Torque (Nm)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#7c2d12' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0c0500', borderColor: '#f97316', color: '#fff'}} />
                           <ReferenceLine y={185} stroke="yellow" strokeDasharray="3 3" label={{value:'Peak', fill:'yellow', fontSize:10}} />
                           <Line type="monotone" dataKey="torque" stroke="#f97316" strokeWidth={2} dot={false} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Diagnostics & Risk */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Contact Status */}
           <SciFiCard title="触头状态诊断" className="border-orange-900/50">
               <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded border border-slate-800">
                       <Fingerprint size={24} className="text-orange-500" />
                       <div>
                           <div className="text-xs text-slate-400">Surface Condition</div>
                           <div className="text-sm font-bold text-white">Oxidation Detected</div>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Alignment Error</span>
                           <span className="text-green-400 font-mono">1.2 mm</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full" style={{width: '20%'}}></div>
                       </div>

                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Spring Pressure</span>
                           <span className="text-yellow-400 font-mono">85% (Weak)</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-yellow-500 h-full" style={{width: '60%'}}></div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Risk Prediction */}
           <SciFiCard title="过热失效风险预测" subtitle="AI RISK MODEL" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-4 h-full">
                   <div className="flex items-center justify-center py-4">
                       <div className="relative w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center">
                           <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin" style={{animationDuration: '3s'}}></div>
                           <div className="text-center">
                               <div className="text-3xl font-bold text-white">High</div>
                               <div className="text-[10px] text-red-400 uppercase">Risk Level</div>
                           </div>
                       </div>
                   </div>
                   
                   <div className="p-3 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="text-xs font-bold text-red-300 mb-1 flex items-center gap-2">
                           <AlertTriangle size={12} /> Prediction
                       </div>
                       <p className="text-[10px] text-slate-400 leading-relaxed">
                           Thermal runaway probability &gt; 80% within 3 months if load exceeds 1500A. Contact resurfacing recommended.
                       </p>
                   </div>
                   
                   <button className="mt-auto w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-200 text-xs rounded border border-orange-900/50 transition-colors flex items-center justify-center gap-2">
                       <Layers size={12} /> Schedule Maintenance
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
