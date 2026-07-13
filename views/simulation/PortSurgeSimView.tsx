
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-surge]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-surge';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  CloudRain, Wind, Waves, AlertTriangle, 
  Settings, Zap, TrendingUp, Anchor, 
  Droplets, Activity, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

const SURGE_FORECAST = Array.from({length: 48}, (_, i) => {
    // Tide is sine wave
    const tide = 2.0 + Math.sin(i * 0.5) * 1.5; 
    // Surge is Gaussian peak around t=24
    const surge = 3.0 * Math.exp(-Math.pow(i - 24, 2) / 50);
    return { 
        hour: `T+${i}h`, 
        tide, 
        surge, 
        total: tide + surge 
    };
});

const ZONE_RISK = [
    { zone: 'Quay Apron', elev: 4.5, status: 'Safe' },
    { zone: 'Yard Block A', elev: 5.0, status: 'Safe' },
    { zone: 'Gate Complex', elev: 6.0, status: 'Safe' },
    { zone: 'Power Sub', elev: 5.5, status: 'Safe' },
];

export const PortSurgeSimView: React.FC = () => {
  // --- STATE ---
  const [windSpeed, setWindSpeed] = useState(25); // m/s (Storm force)
  const [pressureDrop, setPressureDrop] = useState(30); // hPa drop
  const [simTime, setSimTime] = useState(0); // 0-48h
  const [isPaused, setIsPaused] = useState(false);
  
  const [metrics, setMetrics] = useState({
    currentLevel: 2.0, // m
    surgeComponent: 0.0, // m
    waveRunup: 1.2, // m
    overtoppingRate: 0, // L/s/m
    alertStatus: 'NORMAL'
  });

  const [riskZones, setRiskZones] = useState(ZONE_RISK);

  // Simulation Logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
        setSimTime(prev => {
            const next = prev + 0.2;
            return next > 48 ? 0 : next; // Loop
        });

        // Calculate Physics based on time and inputs
        const idx = Math.floor(simTime);
        const nextIdx = Math.min(47, idx + 1);
        const frac = simTime - idx;
        
        // Interpolate Forecast
        const d1 = SURGE_FORECAST[idx];
        const d2 = SURGE_FORECAST[nextIdx];
        
        // Base forecast values
        const baseSurge = d1.surge + (d2.surge - d1.surge) * frac;
        const baseTide = d1.tide + (d2.tide - d1.tide) * frac;
        
        // Adjust based on user inputs (Wind/Pressure)
        // Wind setup ~ V^2
        const windEffect = (Math.pow(windSpeed, 2) / 625) * 1.5; // Normalized so 25m/s -> ~1.5m extra
        const pressureEffect = pressureDrop * 0.01; // 1cm per hPa approx. 30hPa -> 0.3m
        
        const totalSurge = baseSurge + windEffect + pressureEffect;
        const totalLevel = baseTide + totalSurge;
        
        // Wave Runup
        // R = 0.5 * Hs (Significant wave height). Hs ~ Wind^2
        const waveH = Math.pow(windSpeed, 2) * 0.01; 
        const runup = 0.6 * waveH;
        
        // Overtopping (q) if Level + Runup > Crest (4.5m)
        const crest = 4.5;
        const freeboard = crest - totalLevel;
        let q = 0;
        if (totalLevel + runup > crest) {
             q = Math.pow(totalLevel + runup - crest, 1.5) * 100;
        }

        // Update Risk Zones
        const newZones = riskZones.map(z => {
            const waterH = totalLevel + (z.zone === 'Quay Apron' ? runup : 0); // Runup only at edge
            let status = 'Safe';
            if (waterH > z.elev) status = 'Flooded';
            else if (waterH > z.elev - 0.5) status = 'Warning';
            return { ...z, status };
        });
        setRiskZones(newZones);

        setMetrics({
            currentLevel: totalLevel,
            surgeComponent: totalSurge,
            waveRunup: runup,
            overtoppingRate: q,
            alertStatus: q > 50 ? 'CRITICAL' : q > 0 ? 'WARNING' : 'NORMAL'
        });

    }, 100);

    return () => clearInterval(interval);
  }, [simTime, windSpeed, pressureDrop, isPaused]);

  return (
    <div className="h-full w-full relative bg-[#050b14] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-surge" 
            simData={{ 
                waterLevel: metrics.currentLevel,
                windSpeed: windSpeed,
                waveHeight: metrics.waveRunup * 2 // Approx Hs
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Stormy Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#050b14_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20"></div>
          
          {/* Critical Alert Flash */}
          {metrics.alertStatus === 'CRITICAL' && (
              <div className="absolute inset-0 border-[20px] border-red-600/30 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                  <div className="bg-red-900/90 text-white px-8 py-4 rounded border-2 border-red-500 text-3xl font-black tracking-widest shadow-[0_0_80px_red]">
                      FLOODING IMMINENT
                  </div>
              </div>
          )}
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <CloudRain size={14} /> EXTREME WEATHER SIM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 港区风暴潮 <span className="text-cyan-500">& 极端水位影响仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Total Water Level</div>
                   <div className={`text-4xl font-mono font-bold ${metrics.currentLevel > 4.5 ? 'text-red-500' : 'text-white'}`}>
                       {metrics.currentLevel.toFixed(2)} <span className="text-lg text-slate-500">m</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Surge Anomaly</div>
                   <div className="text-3xl font-mono font-bold text-yellow-400">
                       +{metrics.surgeComponent.toFixed(2)} m
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1624]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 风暴参数设定
              </h3>
              
              <div className="space-y-6">
                  {/* Wind Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Wind size={12}/> Wind Speed</span>
                          <span className="font-mono text-cyan-300">{windSpeed} m/s</span>
                      </div>
                      <input 
                        type="range" min="0" max="60" step="1" 
                        value={windSpeed} onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Breeze</span><span>Gale</span><span>Hurricane</span>
                      </div>
                  </div>

                  {/* Pressure Drop */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Gauge size={12}/> Pressure Drop</span>
                          <span className="font-mono text-yellow-400">{pressureDrop} hPa</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={pressureDrop} onChange={(e) => setPressureDrop(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                  </div>

                  {/* Timeline Control */}
                  <div className="pt-4 border-t border-slate-800">
                      <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Simulation Time</span>
                          <span className="text-white font-mono">T+{simTime.toFixed(1)}h</span>
                      </div>
                      <input 
                        type="range" min="0" max="48" step="0.1" 
                        value={simTime} onChange={(e) => setSimTime(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <div className="flex gap-2 mt-3">
                          <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold border border-slate-600">
                              {isPaused ? 'RESUME' : 'PAUSE'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <SciFiCard title="风险区域状态" subtitle="ZONES" className="flex-1 border-cyan-900/50 bg-[#0b1624]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar">
                  {riskZones.map((z, i) => (
                      <div key={i} className={`flex justify-between items-center p-3 rounded border transition-colors
                          ${z.status === 'Flooded' ? 'bg-red-900/30 border-red-500' : 
                            z.status === 'Warning' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-slate-900/40 border-slate-800'}
                      `}>
                          <div>
                              <div className="text-xs font-bold text-white">{z.zone}</div>
                              <div className="text-[9px] text-slate-500">Elev: {z.elev}m</div>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              z.status === 'Flooded' ? 'bg-red-500 text-white' : 
                              z.status === 'Warning' ? 'bg-yellow-500 text-black' : 'bg-green-900/30 text-green-400'
                          }`}>
                              {z.status}
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analytics */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="水位过程线 (Hydrograph)" subtitle="TIDE + SURGE" className="h-[280px] border-cyan-900/50 bg-[#0b1624]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SURGE_FORECAST}>
                          <defs>
                              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={5} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'm', angle: -90, position: 'insideLeft' }} domain={[0, 8]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                          
                          <ReferenceLine y={4.5} stroke="red" strokeDasharray="3 3" label={{value:'Quay', fill:'red', fontSize:10}} />
                          <Area type="monotone" dataKey="total" stroke="#0ea5e9" fill="url(#gradTotal)" strokeWidth={2} name="Total Level" />
                          <Line type="monotone" dataKey="tide" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Astro Tide" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Impact Dashboard */}
          <div className="flex-1 bg-[#0b1624]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Activity size={16} className="text-red-500"/> 影响评估 (Impact)
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Wave Runup</div>
                      <div className="text-xl font-bold text-white">{metrics.waveRunup.toFixed(2)} m</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Overtopping</div>
                      <div className={`text-xl font-bold ${metrics.overtoppingRate > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {metrics.overtoppingRate.toFixed(0)} <span className="text-xs text-slate-500">L/s/m</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Anchor size={14} className={windSpeed > 20 ? "text-red-500" : "text-green-500"}/>
                      <span>Crane Operation: <strong className={windSpeed > 20 ? "text-red-400" : "text-green-400"}>{windSpeed > 20 ? 'STOPPED' : 'NORMAL'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                      <TrendingUp size={14} className={metrics.surgeComponent > 1.0 ? "text-yellow-500" : "text-green-500"}/>
                      <span>Surge Trend: <strong className="text-white">{simTime > 20 && simTime < 30 ? 'PEAKING' : 'STABLE'}</strong></span>
                  </div>
              </div>

              <div className="mt-auto">
                  <button className="w-full py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 rounded text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                      <AlertTriangle size={14} /> DEPLOY FLOOD GATES
                  </button>
              </div>
          </div>

      </div>

    </div>
  );
};
