
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  CloudRain, Umbrella, Waves, 
  MapPin, AlertTriangle, Droplets, 
  Activity, ArrowDown, Layout, Settings2,
  Navigation, Siren
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';

// --- MOCK DATA ---
const RAINFALL_PATTERN = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    rain: i > 8 && i < 16 ? 50 + Math.random() * 50 : Math.random() * 5,
    drainage: 40 // Constant capacity line
}));

const ALERT_ZONES = [
    { id: 'Z01', name: 'Downtown Underpass', depth: 0, status: 'Safe' },
    { id: 'Z02', name: 'Riverside Market', depth: 0, status: 'Safe' },
    { id: 'Z03', name: 'Tech Park', depth: 0, status: 'Safe' },
    { id: 'Z04', name: 'Old Residential', depth: 0, status: 'Safe' },
];

export const HydroUrbanSimView: React.FC = () => {
  // --- STATE ---
  const [rainIntensity, setRainIntensity] = useState(0); // mm/h
  const [drainCapacity, setDrainCapacity] = useState(50); // mm/h equivalent
  const [simTime, setSimTime] = useState(0); // hours
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [metrics, setMetrics] = useState({
    floodDepth: 0.0, // m
    pipeLoad: 0, // %
    activeAlerts: 0,
    totalVolume: 0 // m3
  });

  const [zones, setZones] = useState(ALERT_ZONES);
  const [chartData, setChartData] = useState(RAINFALL_PATTERN);

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setSimTime(prev => (prev + 0.1) % 24);
        
        // Physics Logic
        // Inflow = Rain
        // Outflow = Drain Capacity
        // Accumulation = (Rain - Drain) * Time
        
        const currentRain = rainIntensity;
        const netAccumulationRate = Math.max(0, currentRain - drainCapacity); // mm/h
        
        // Update Metrics
        setMetrics(prev => {
            const newDepth = prev.floodDepth + (netAccumulationRate / 1000) * 0.1; // 0.1h step
            // Natural recession if rain stops (simplified)
            const recession = currentRain < drainCapacity && prev.floodDepth > 0 ? 0.01 : 0;
            const finalDepth = Math.max(0, newDepth - recession);
            
            const pipeLoad = Math.min(100, (currentRain / drainCapacity) * 80 + (finalDepth > 0 ? 20 : 0));
            
            return {
                floodDepth: finalDepth,
                pipeLoad: pipeLoad,
                activeAlerts: finalDepth > 0.3 ? 2 : finalDepth > 0.1 ? 1 : 0,
                totalVolume: prev.totalVolume + (netAccumulationRate > 0 ? netAccumulationRate * 10 : 0)
            };
        });

        // Update Zones randomly based on depth
        setZones(prev => prev.map(z => {
            const localVar = Math.random() * 0.1;
            const zDepth = Math.max(0, metrics.floodDepth + (Math.random()-0.5)*0.05);
            let status = 'Safe';
            if (zDepth > 0.3) status = 'Critical';
            else if (zDepth > 0.1) status = 'Warning';
            
            return { ...z, depth: zDepth, status };
        }));

    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, rainIntensity, drainCapacity, metrics.floodDepth]);

  return (
    <div className="h-full w-full relative bg-[#030712] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-urban" 
            simData={{ 
                rainIntensity,
                drainCapacity,
                waterLevel: metrics.floodDepth
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030712_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <CloudRain size={14} /> URBAN RESILIENCE
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 城市内涝 <span className="text-blue-500">& 排水管网运行仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Avg Inundation Depth</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.floodDepth > 0.3 ? 'text-red-500' : metrics.floodDepth > 0 ? 'text-yellow-400' : 'text-white'}`}>
                       {metrics.floodDepth.toFixed(2)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Pipe Network Load</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.pipeLoad > 90 ? 'text-red-400' : 'text-green-400'}`}>
                       {metrics.pipeLoad.toFixed(0)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Simulation Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1221]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings2 size={16} className="text-blue-500"/> 情景模拟控制
              </h3>
              
              <div className="space-y-6">
                  {/* Rain Intensity */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><CloudRain size={12}/> Rainfall Intensity</span>
                          <span className="font-mono text-cyan-300">{rainIntensity} mm/h</span>
                      </div>
                      <input 
                        type="range" min="0" max="150" step="5" 
                        value={rainIntensity} onChange={(e) => setRainIntensity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Light</span><span>Heavy</span><span>Extreme</span>
                      </div>
                  </div>

                  {/* Drainage Capacity */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Activity size={12}/> Drainage Capacity</span>
                          <span className="font-mono text-green-300">{drainCapacity} mm/h</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" step="5" 
                        value={drainCapacity} onChange={(e) => setDrainCapacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                  </div>

                  <div className="pt-4 flex gap-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-2 text-xs font-bold rounded border ${isPlaying ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-blue-600 border-blue-400 text-white'}`}
                      >
                          {isPlaying ? 'PAUSE SIM' : 'RESUME SIM'}
                      </button>
                      <button 
                         onClick={() => { setRainIntensity(0); setMetrics(m => ({...m, floodDepth: 0})); }}
                         className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded"
                      >
                          RESET
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="区域积水风险 (Risk Zones)" subtitle="LIVE STATUS" className="flex-1 border-blue-900/50 bg-[#0b1221]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {zones.map((zone, i) => (
                      <div key={i} className={`p-3 rounded border flex justify-between items-center transition-colors
                          ${zone.status === 'Critical' ? 'bg-red-900/20 border-red-500' : 
                            zone.status === 'Warning' ? 'bg-yellow-900/20 border-yellow-500' : 'bg-slate-900/40 border-slate-800'}
                      `}>
                          <div>
                              <div className="text-xs font-bold text-white mb-1">{zone.name}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <MapPin size={10}/> {zone.id}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-lg font-bold ${zone.status === 'Critical' ? 'text-red-400' : zone.status === 'Warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {zone.depth.toFixed(2)}m
                              </div>
                              <div className="text-[9px] text-slate-400 uppercase">{zone.status}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Hydrograph */}
          <SciFiCard title="降雨-径流过程线" subtitle="HYDROGRAPH" className="h-[280px] border-blue-900/50 bg-[#0b1221]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                          <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Runoff', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 10}} label={{ value: 'Rain', angle: 90, position: 'insideRight', fontSize: 10 }} reversed />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          
                          <Bar yAxisId="right" dataKey="rain" fill="#94a3b8" barSize={6} name="Rainfall" />
                          <Line yAxisId="left" type="monotone" dataKey="drainage" stroke="#22c55e" strokeWidth={2} dot={false} name="Drain Cap." />
                          {/* Simulated Runoff Line would be ideal, but for now showing capacity vs rain */}
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Pipe Network Status */}
          <div className="flex-1 bg-[#0b1221]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Layout size={16} className="text-purple-400"/> 管网运行状态
              </h3>
              
              <div className="flex flex-col gap-4 justify-center h-full">
                  <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Network Load</span>
                      <span className="text-xl font-bold text-white">{metrics.pipeLoad.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${metrics.pipeLoad > 90 ? 'bg-red-500' : metrics.pipeLoad > 75 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{width: `${metrics.pipeLoad}%`}}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Surcharged Pipes</div>
                          <div className={`text-lg font-bold ${metrics.pipeLoad > 80 ? 'text-red-400' : 'text-green-400'}`}>
                              {metrics.pipeLoad > 80 ? '12' : '0'}
                          </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Pump Station</div>
                          <div className="text-lg font-bold text-cyan-300">ON</div>
                      </div>
                  </div>

                  {metrics.activeAlerts > 0 && (
                      <div className="mt-auto p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-3 animate-in slide-in-from-bottom-2">
                          <Siren className="text-red-500 animate-pulse" size={20} />
                          <div>
                              <div className="text-xs font-bold text-red-200">FLOOD ALERT ACTIVE</div>
                              <div className="text-[10px] text-slate-400">Initiate drainage protocol immediately.</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

      </div>

    </div>
  );
};
