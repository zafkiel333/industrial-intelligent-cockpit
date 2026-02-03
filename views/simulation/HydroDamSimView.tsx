
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldCheck, Thermometer, Droplets, Waves, 
  Settings, Activity, Layers, ArrowUp, AlertTriangle,
  GitCommit, Maximize2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const STRESS_PROFILE = Array.from({length: 20}, (_, i) => ({
    dist: i * 3, // m from heel
    stress: 0 // Calc later
}));

const SEEPAGE_HISTORY = Array.from({length: 24}, (_, i) => ({
    time: i,
    flow: 12 + Math.random(),
    pressure: 45 + Math.random() * 5
}));

export const HydroDamSimView: React.FC = () => {
  // --- STATE ---
  const [waterLevel, setWaterLevel] = useState(15.0); // m
  const [temperature, setTemperature] = useState(20.0); // C
  const [upliftFactor, setUpliftFactor] = useState(0.3); // 0-1
  const [timeOfYear, setTimeOfYear] = useState(0); // 0-12 months

  const [metrics, setMetrics] = useState({
    maxStress: 2.5, // MPa
    heelStress: 0.1, // MPa
    fos: 2.1, // Factor of Safety
    seepageRate: 12.5, // L/min
    deformation: 3.2 // mm
  });

  const [stressData, setStressData] = useState(STRESS_PROFILE);

  // Simulation Loop
  useEffect(() => {
    // 1. Seasonal Cycle
    // Temp follows sine wave over year
    // Water level follows delayed sine wave
    // If not manual override, we could automate this. But sliders are better for "Simulation".
    // Let's use Time Slider to set base values, then allow manual tweaks.
    
    // Base Calculations
    // Hydrostatic Force ~ H^2
    const h = waterLevel; 
    const hydroLoad = 0.5 * 10 * h * h; // kN/m (simplified)
    
    // Uplift Force ~ H * factor
    const upliftLoad = 0.5 * 10 * h * 60 * upliftFactor; // Base width approx 60? No, 13 in model. Let's say 15.
    
    // Thermal Stress
    const thermalLoad = (temperature - 20) * 50; // Arbitrary unit

    // Stability (Sliding)
    const weight = 24 * 15 * 20; // Density * Vol approx
    const friction = 0.7;
    const fos = ((weight - upliftLoad) * friction) / (hydroLoad + thermalLoad * 0.1);

    // Stress Distribution (Gravity Method approx)
    // Sigma = V/A +/- M*y/I
    // Simplified: Linear distribution
    const heelS = (weight / 15) - (hydroLoad * h/3) / (15*15/6); 
    const toeS = (weight / 15) + (hydroLoad * h/3) / (15*15/6);
    
    setMetrics({
        maxStress: Math.abs(toeS) / 100, // Scale for display MPa
        heelStress: heelS / 100,
        fos: Math.max(0, fos),
        seepageRate: 10 + h * 0.5 * upliftFactor,
        deformation: 2 + h * 0.1 + (temperature-20)*0.05
    });

    // Update Chart
    setStressData(prev => prev.map((pt, i) => {
        const x = pt.dist; // 0 to 60 (scaled)
        // Linear interp
        const t = i / (prev.length - 1);
        return {
            ...pt,
            stress: heelS + (toeS - heelS) * t
        };
    }));

  }, [waterLevel, temperature, upliftFactor]);

  return (
    <div className="h-full w-full relative bg-[#0b1016] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-dam" 
            simData={{ 
                waterLevel,
                temp: temperature,
                uplift: upliftFactor > 0.5
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0b1016_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e293b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ShieldCheck size={14} /> MULTI-PHYSICS COUPLING
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 大坝坝体 <span className="text-blue-500">应力-渗流-温度耦合仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Stability (FoS)</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.fos < 1.5 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.fos.toFixed(2)}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Max Stress</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.maxStress.toFixed(2)} <span className="text-sm text-slate-500">MPa</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Loads Control */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0f172a]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings size={16} className="text-blue-500"/> 荷载边界条件
              </h3>
              
              <div className="space-y-6">
                  {/* Water Level */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Waves size={12}/> Reservoir Level</span>
                          <span className="font-mono text-blue-400">{waterLevel.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="0.5" 
                        value={waterLevel} 
                        onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Thermometer size={12}/> Temperature</span>
                          <span className="font-mono text-orange-400">{temperature.toFixed(1)} °C</span>
                      </div>
                      <input 
                        type="range" min="-10" max="40" step="1" 
                        value={temperature} 
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  {/* Uplift */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><ArrowUp size={12}/> Uplift Factor</span>
                          <span className="font-mono text-cyan-400">{upliftFactor.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={upliftFactor} 
                        onChange={(e) => setUpliftFactor(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>
              </div>
          </div>

          <SciFiCard title="监测数据 (Sensors)" subtitle="REAL-TIME" className="flex-1 border-blue-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="flex flex-col gap-3 h-full">
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Droplets size={14} className="text-cyan-400"/> Seepage
                      </div>
                      <span className="text-lg font-bold text-white">{metrics.seepageRate.toFixed(1)} L/m</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Maximize2 size={14} className="text-purple-400"/> Deformation
                      </div>
                      <span className="text-lg font-bold text-white">{metrics.deformation.toFixed(2)} mm</span>
                  </div>
                  
                  {metrics.heelStress < 0 && (
                      <div className="mt-auto p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-200 flex items-center gap-2">
                          <AlertTriangle size={16}/> Warning: Heel Tension Detected!
                      </div>
                  )}
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis Results */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Stress Distribution */}
          <SciFiCard title="基底应力分布 (Heel to Toe)" subtitle="STRESS (kPa)" className="h-[280px] border-blue-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stressData}>
                          <defs>
                              <linearGradient id="gradStress" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dist (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          <ReferenceLine y={0} stroke="#fff" />
                          <Area type="monotone" dataKey="stress" stroke="#3b82f6" fill="url(#gradStress)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Seepage History */}
          <SciFiCard title="渗流量与库水位过程线" subtitle="24H" className="flex-1 border-blue-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={SEEPAGE_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis yAxisId="left" stroke="#22d3ee" tick={{fontSize: 10}} />
                          <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                          <Area yAxisId="left" type="monotone" dataKey="flow" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="Seepage" />
                          <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#facc15" strokeWidth={2} dot={false} name="Pressure" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* BOTTOM HUD: Time Control */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-slate-700 flex items-center gap-4">
          <span className="text-[10px] text-slate-400 uppercase">Season Simulation</span>
          <input 
            type="range" min="0" max="11" step="1" 
            value={timeOfYear} 
            onChange={(e) => {
                const m = parseInt(e.target.value);
                setTimeOfYear(m);
                // Auto adjust conditions based on season
                // Winter (0, 1, 11): Low temp, Low water
                // Summer (5, 6, 7): High temp, High water
                const t = Math.sin((m - 3) / 6 * Math.PI); // -1 to 1 cycle
                setTemperature(15 + t * 15);
                setWaterLevel(10 + t * 5);
            }}
            className="w-48 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-sm font-bold text-white w-12 text-center">
              {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][timeOfYear]}
          </span>
      </div>

    </div>
  );
};
