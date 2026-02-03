
import React, { useState, useEffect } from 'react';
import { EngineThreeScene } from '../../../components/predictive/mining-truck-engine/ThreeScene';
import { CylinderStatus } from '../../../components/predictive/mining-truck-engine/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, ScatterChart, Scatter, LineChart, Line, ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Activity, Flame, Zap, Wind, AlertTriangle, 
  Thermometer, Droplets, RotateCw, Gauge, 
  Layers, Scan, TrendingUp, FileText, CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

// P-V Diagram (Pressure vs Volume) - Ideal vs Actual
const PV_DATA = Array.from({length: 50}, (_, i) => {
    const angle = (i / 50) * Math.PI * 4; // 2 revolutions (4 strokes)
    // Simplified Otto/Diesel cycle shape approximation
    const vol = 1 + Math.sin(angle); // Volume change
    
    // Ideal Pressure
    let pressIdeal = 0;
    if (vol < 0.2) pressIdeal = 150; // Combustion peak
    else pressIdeal = 10 / Math.pow(Math.max(0.1, vol), 1.4); // Expansion/Compression

    // Actual Pressure (Loss of compression)
    let pressAct = pressIdeal * 0.9 + (Math.random()-0.5)*2;

    return { vol, pressIdeal, pressAct };
});

// Oil Analysis
const OIL_RADAR = [
    { subject: 'Soot', A: 85, fullMark: 100 },
    { subject: 'Viscosity', A: 92, fullMark: 100 },
    { subject: 'TBN', A: 60, fullMark: 100 }, // Total Base Number dropping (acidic)
    { subject: 'Iron (Fe)', A: 45, fullMark: 100 },
    { subject: 'Copper (Cu)', A: 20, fullMark: 100 },
    { subject: 'Silicon (Si)', A: 30, fullMark: 100 },
];

const INJECTOR_TREND = Array.from({length: 24}, (_, i) => ({
    time: `T-${24-i}h`,
    duration: 2.4 + Math.sin(i*0.5)*0.1, // ms
    pressure: 2200 + (Math.random()-0.5)*50 // bar
}));

export const MiningTruckEngineHealthView: React.FC = () => {
  // --- STATE ---
  const [rpm, setRpm] = useState(1800);
  const [load, setLoad] = useState(85); // %
  const [cylinders, setCylinders] = useState<CylinderStatus[]>([]);
  const [activeCyl, setActiveCyl] = useState<number | null>(5);
  const [viewMode, setViewMode] = useState<'thermal' | 'mechanical' | 'exploded'>('thermal');
  const [metrics, setMetrics] = useState({
      power: 2850, // hp
      torque: 11500, // Nm
      fuelRate: 450, // L/h
      oilPress: 4.5, // bar
      coolantTemp: 88, // C
      boostPress: 2.8, // bar
  });

  // Init Cylinders
  useEffect(() => {
      const initCyls = Array.from({length: 16}, (_, i) => ({
          id: i + 1,
          temp: 580 + Math.random() * 50,
          pressure: 180 + Math.random() * 10,
          injection: 0,
          health: 90 + Math.random() * 10
      }));
      // Simulate Fault on Cyl 5
      initCyls[4].temp = 420; // Low temp = Misfire/Injector fail
      initCyls[4].health = 45;
      initCyls[4].pressure = 120;
      
      setCylinders(initCyls);
  }, []);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Fluctuate RPM & Load
        setRpm(1800 + Math.sin(t) * 20);
        setLoad(85 + Math.cos(t*0.5) * 5);

        // Update Cylinders
        setCylinders(prev => {
            if (prev.length === 0) return prev;
            return prev.map(c => {
                const noise = (Math.random() - 0.5) * 5;
                if (c.id === 5) {
                    return { ...c, temp: 420 + noise, pressure: 120 + noise * 0.5 };
                }
                return { ...c, temp: 580 + noise, pressure: 180 + noise * 0.5 };
            });
        });

        setMetrics(prev => ({
            ...prev,
            power: 2850 + Math.sin(t)*50,
            boostPress: 2.8 + Math.sin(t)*0.05
        }));

    }, 200);
    return () => clearInterval(interval);
  }, []);

  const activeCylData = (activeCyl && cylinders.length > 0) ? cylinders[activeCyl - 1] : null;

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020202] text-amber-50 p-2 overflow-y-auto custom-scrollbar selection:bg-amber-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#211102] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Flame size={14} className="animate-pulse" />
             High-Horsepower Engine Diagnostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             矿卡发动机 <span className="text-amber-500">健康状态评估 (V16-QSK)</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Engine Load</div>
                <div className="text-3xl font-mono font-bold text-white">{load.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Output Power</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{metrics.power.toFixed(0)} <span className="text-sm text-slate-500">HP</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Specific Fuel</div>
                <div className="text-2xl font-mono font-bold text-green-400">198 <span className="text-sm text-slate-500">g/kWh</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Combustion Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* P-V Diagram */}
           <SciFiCard title="示功图分析 (P-V Diagram)" subtitle="COMBUSTION EFF" className="h-[300px] border-amber-900/50 bg-[#0c0800]/80" noPadding>
               <div className="w-full h-full p-4 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: -10}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                           <XAxis type="number" dataKey="vol" name="Volume" stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Vol', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                           <YAxis type="number" dataKey="pressIdeal" name="Pressure" stroke="#78350f" tick={{fontSize: 10}} label={{ value: 'Bar', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Scatter name="Ideal" data={PV_DATA} fill="#334155" line={{stroke: '#334155', strokeWidth: 1, strokeDasharray: '5 5'}} shape={() => null} />
                           <Scatter name="Actual" data={PV_DATA} fill="#f59e0b" line={{stroke: '#f59e0b', strokeWidth: 2}} shape={() => null} />
                       </ScatterChart>
                   </ResponsiveContainer>
                   <div className="absolute top-4 right-4 text-[9px] text-amber-500 bg-amber-950/50 px-2 py-1 border border-amber-500/30 rounded">
                       PFP Loss: 12%
                   </div>
               </div>
           </SciFiCard>

           {/* EGT Deviation */}
           <SciFiCard title="排气温度偏差 (EGT Deviation)" className="flex-1 border-amber-900/50">
               <div className="h-full w-full flex flex-col">
                   <div className="flex-1 min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={cylinders} margin={{left: -20}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                               <XAxis dataKey="id" stroke="#78350f" tick={{fontSize: 9}} interval={0} />
                               <YAxis stroke="#78350f" tick={{fontSize: 9}} domain={[300, 700]} />
                               <Tooltip cursor={{fill: '#2a1a05'}} contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                               <Bar dataKey="temp" radius={[2, 2, 0, 0]}>
                                   {cylinders.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.temp < 500 ? '#3b82f6' : entry.temp > 620 ? '#ef4444' : '#f59e0b'} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-2 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-2 text-xs text-red-300">
                       <AlertTriangle size={14} /> Cyl #5: Cold Cylinder (Misfire)
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#050200] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setViewMode('thermal')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'thermal' ? 'bg-amber-600 text-black' : 'bg-black/50 text-slate-400'}`}>Thermal</button>
                   <button onClick={() => setViewMode('mechanical')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'mechanical' ? 'bg-amber-600 text-black' : 'bg-black/50 text-slate-400'}`}>Mechanical</button>
                   <button onClick={() => setViewMode('exploded')} className={`px-3 py-1 rounded text-xs border ${viewMode === 'exploded' ? 'bg-amber-600 text-black' : 'bg-black/50 text-slate-400'}`}>Exploded</button>
               </div>

               {/* Right Stats */}
               <div className="absolute top-4 right-4 z-10 text-right space-y-1">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-amber-500/20">
                       <div className="text-[10px] text-slate-400 uppercase">Engine Speed</div>
                       <div className="text-xl font-mono font-bold text-white">{rpm.toFixed(0)} <span className="text-xs">RPM</span></div>
                   </div>
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-amber-500/20">
                       <div className="text-[10px] text-slate-400 uppercase">Boost Pressure</div>
                       <div className="text-xl font-mono font-bold text-cyan-400">{metrics.boostPress.toFixed(2)} <span className="text-xs">bar</span></div>
                   </div>
               </div>

               {/* Selected Cylinder Info */}
               {activeCyl && activeCylData && (
                   <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur p-3 rounded border-l-4 border-amber-500 w-64 animate-in slide-in-from-bottom-4">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-white">Cylinder #{activeCyl}</span>
                           <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeCylData.health < 60 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                               Health: {activeCylData.health.toFixed(0)}%
                           </span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                           <div>EGT: <span className="text-white font-mono">{activeCylData.temp.toFixed(0)}°C</span></div>
                           <div>PFP: <span className="text-white font-mono">{activeCylData.pressure.toFixed(0)}bar</span></div>
                           <div>Inj: <span className="text-white font-mono">120mg</span></div>
                           <div>Blowby: <span className="text-white font-mono">Low</span></div>
                       </div>
                   </div>
               )}

               <EngineThreeScene 
                   rpm={rpm}
                   cylinders={cylinders}
                   turboSpeed={rpm * 25}
                   viewMode={viewMode}
                   activeCylinder={activeCyl}
                   onCylinderSelect={(id) => setActiveCyl(id === -1 ? null : id)}
                   vibrationIntensity={0.2}
               />
           </div>

           {/* Injector Performance */}
           <SciFiCard title="喷油器性能趋势 (Injector)" subtitle="DURATION & PRESSURE" className="h-[220px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={INJECTOR_TREND}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="time" stroke="#78350f" tick={{fontSize: 9}} interval={4} />
                           <YAxis yAxisId="left" stroke="#f59e0b" tick={{fontSize: 9}} label={{ value: 'Press (bar)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#f59e0b' }} domain={[2000, 2400]} />
                           <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 9}} label={{ value: 'Dur (ms)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10b981' }} domain={[2, 3]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#f59e0b" strokeWidth={2} dot={false} />
                           <Line yAxisId="right" type="step" dataKey="duration" stroke="#10b981" strokeWidth={2} dot={false} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Oil & Mechanical */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Oil Analysis */}
           <SciFiCard title="机油理化分析" subtitle="OIL LAB" className="h-[300px] border-amber-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={OIL_RADAR}>
                           <PolarGrid stroke="#331c0a" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Oil Status" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="flex justify-between items-center text-xs mt-2 border-t border-slate-800 pt-2">
                       <span className="text-slate-500">TBN (Total Base Number)</span>
                       <span className="text-yellow-400 font-bold">5.2 mgKOH/g</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Maintenance Decision */}
           <SciFiCard title="维护决策建议" className="flex-1 border-amber-900/50">
               <div className="flex flex-col gap-3 h-full">
                   <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                       <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                       <div>
                           <div className="text-xs font-bold text-white">Injector #5 Failure</div>
                           <p className="text-[10px] text-slate-400">Cold cylinder detected. Likely solenoid failure or nozzle clogging.</p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-xs">
                       <CheckCircle2 size={14} className="text-green-500" />
                       <span className="text-slate-300">Oil change due in 250 hrs</span>
                   </div>

                   <button className="mt-auto w-full py-2 bg-amber-700/30 hover:bg-amber-600/50 border border-amber-500/50 rounded text-xs text-amber-100 transition-colors flex items-center justify-center gap-2">
                       <FileText size={12} /> Schedule Injector Swap
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
