
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Mountain, AlertTriangle, Activity, CloudRain, 
  Droplets, Ruler, TrendingDown, Layers, 
  Map as MapIcon, ShieldCheck, Radar, Radio,
  ArrowRight, Pause, Play, RefreshCw, BarChart4,
  Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, ComposedChart, ScatterChart, Scatter, ReferenceLine,
  Bar
} from 'recharts';

// --- Types & Data ---

// Inverse Velocity Data (Classic Slope Prediction)
// Time vs 1/Velocity. As slope fails, V increases, 1/V approaches 0.
const INVERSE_VELOCITY_DATA = Array.from({length: 30}, (_, i) => {
    // Simulate asymptotic failure curve
    const t = i;
    // Velocity accelerates: v = v0 * exp(kt)
    const v = 0.5 * Math.exp(0.15 * t);
    const invV = 1 / v; 
    return { time: `T-${30-i}`, invV, v };
});

const DISPLACEMENT_HISTORY = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    disp: 25 + Math.pow(i/24, 2) * 10 + Math.random() * 2, // Accelerating trend
    rain: i > 15 ? Math.random() * 20 : 0
}));

const SENSORS_LIST = [
    { id: 'SSR-01', name: '边坡雷达 (Radar)', status: 'Active', val: '2.4 mm/h', trend: 'Up' },
    { id: 'GNSS-05', name: 'GNSS 监测点', status: 'Active', val: '15.2 mm', trend: 'Stable' },
    { id: 'PZ-12', name: '渗压计 (Piezometer)', status: 'Warning', val: '145 kPa', trend: 'High' },
    { id: 'INC-03', name: '深部测斜仪', status: 'Active', val: '0.5 mm', trend: 'Stable' },
];

export const MineSlopeStabilitySimView: React.FC = () => {
  // --- STATE ---
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('RUNNING');
  const [rainLevel, setRainLevel] = useState(0); // 0-100%
  const [waterTable, setWaterTable] = useState(50); // %
  
  // Computed Metrics
  const [metrics, setMetrics] = useState({
    fos: 1.35, // Factor of Safety (starts safe > 1.2)
    maxDispVelocity: 2.4, // mm/h
    porePressure: 45, // kPa
    failureProb: 5 // %
  });

  // Simulation Logic
  useEffect(() => {
    if (simState !== 'RUNNING') return;

    const interval = setInterval(() => {
        setMetrics(prev => {
            // Logic: Rain increases Pore Pressure -> Reduces Friction -> Lowers FoS -> Increases Velocity
            const rainFactor = rainLevel / 100;
            const pressure = 45 + rainFactor * 30 + Math.random() * 2;
            
            // FoS Drop
            let newFos = 1.35 - (pressure - 45) * 0.015;
            
            // Velocity spike if FoS < 1.1
            let velocity = 2.4;
            if (newFos < 1.1) velocity = 10 + (1.1 - newFos) * 100;
            else if (newFos < 1.2) velocity = 5 + (1.2 - newFos) * 20;

            // Probability of Failure
            const prob = newFos < 1.0 ? 100 : newFos < 1.1 ? 80 : newFos < 1.2 ? 40 : 5;

            return {
                fos: Math.max(0.5, newFos),
                maxDispVelocity: velocity + Math.random(),
                porePressure: pressure,
                failureProb: prob
            };
        });
    }, 500);

    return () => clearInterval(interval);
  }, [simState, rainLevel]);

  const getStatusColor = (fos: number) => {
      if (fos < 1.0) return 'text-red-500'; // Critical
      if (fos < 1.2) return 'text-orange-500'; // Warning
      if (fos < 1.3) return 'text-yellow-400'; // Watch
      return 'text-green-400'; // Safe
  };

  return (
    <div className="h-full w-full relative bg-[#0f0e0d] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-slope-stability" 
            simData={{ 
                rainfall: rainLevel,
                stability: (metrics.fos - 0.5) * 100 // Map FoS to 0-100 visual scale (0.5->0, 1.5->100)
            }} 
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0f0e0d_100%)] pointer-events-none"></div>
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-red-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Mountain size={14} /> GEOTECHNICAL RISK MONITOR
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 露天矿边坡 <span className="text-red-500">稳定性仿真分析</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               {/* Main KPI: FoS */}
               <div className="flex flex-col items-center bg-black/60 border border-slate-700 px-4 py-2 rounded">
                   <span className="text-[10px] text-slate-400 uppercase tracking-widest">Factor of Safety (FoS)</span>
                   <span className={`text-4xl font-black font-mono ${getStatusColor(metrics.fos)}`}>
                       {metrics.fos.toFixed(2)}
                   </span>
                   <span className="text-[9px] text-slate-500">Threshold: 1.20</span>
               </div>
               
               <div className="w-px h-10 bg-slate-700"></div>

               <div className="flex flex-col items-end">
                   <span className="text-[10px] text-slate-400 uppercase">Alert Level</span>
                   <div className={`px-3 py-1 rounded border text-sm font-bold ${metrics.fos < 1.1 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                       {metrics.fos < 1.0 ? 'CRITICAL (EVACUATE)' : metrics.fos < 1.2 ? 'WARNING (LEVEL II)' : 'NORMAL'}
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Geotech & Sensors */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Rock Mass Data */}
          <SciFiCard title="岩体参数 (Geotech Data)" subtitle="RMR" className="border-red-900/40 bg-[#1a0f0d]/90 pointer-events-auto">
              <div className="grid grid-cols-2 gap-3 p-1">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Cohesion (C)</div>
                      <div className="text-lg font-bold text-white">45 kPa</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Friction (φ)</div>
                      <div className="text-lg font-bold text-white">32°</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Rock Density</div>
                      <div className="text-lg font-bold text-white">2.6 g/cm³</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">RMR Index</div>
                      <div className="text-lg font-bold text-yellow-500">58 (Fair)</div>
                  </div>
              </div>
          </SciFiCard>

          {/* Sensor List */}
          <SciFiCard title="实时监测感知网络" subtitle="ONLINE" className="flex-1 border-red-900/40 bg-[#1a0f0d]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-1">
                  {SENSORS_LIST.map((sensor, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800 hover:border-red-500/30 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full ${sensor.id.includes('SSR') ? 'bg-red-900/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                  {sensor.id.includes('SSR') ? <Radar size={14}/> : sensor.id.includes('GNSS') ? <MapIcon size={14}/> : <Activity size={14}/>}
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-200">{sensor.name}</div>
                                  <div className="text-[9px] text-slate-500">{sensor.id}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-sm font-mono font-bold ${sensor.status === 'Warning' ? 'text-yellow-400' : 'text-white'}`}>
                                  {sensor.val}
                              </div>
                              <div className="text-[9px] text-slate-500 flex items-center justify-end gap-1">
                                  {sensor.trend === 'Up' || sensor.trend === 'High' ? <TrendingDown size={8} className="rotate-180 text-red-400"/> : null}
                                  {sensor.trend}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

          {/* Alert Box */}
          {metrics.failureProb > 20 && (
             <div className="bg-red-950/90 border-l-4 border-red-500 p-3 rounded shadow-lg animate-in slide-in-from-left-4 fade-in duration-500 pointer-events-auto">
                 <div className="flex items-start gap-3">
                     <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                     <div>
                         <div className="text-xs font-bold text-red-100 uppercase mb-1">Slope Instability Alert</div>
                         <p className="text-[10px] text-red-300 leading-tight">
                             Combined rainfall and pore pressure rise has reduced Factor of Safety below critical threshold.
                         </p>
                     </div>
                 </div>
             </div>
          )}

      </div>

      {/* 4. RIGHT PANEL: Analysis & Simulation */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Controls */}
          <div className="bg-[#1a0f0d]/90 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <Settings size={14} className="text-red-500"/> 诱发因素仿真 (Triggers)
              </h3>
              
              <div className="space-y-4">
                  {/* Rain Slider */}
                  <div>
                      <div className="flex justify-between text-xs text-blue-200 mb-2">
                          <span className="flex items-center gap-2"><CloudRain size={12}/> 降雨强度 (Rainfall)</span>
                          <span className="font-mono">{rainLevel}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={rainLevel} 
                        onChange={(e) => setRainLevel(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Water Table Slider */}
                  <div>
                      <div className="flex justify-between text-xs text-cyan-200 mb-2">
                          <span className="flex items-center gap-2"><Droplets size={12}/> 地下水位 (Water Table)</span>
                          <span className="font-mono">{metrics.porePressure.toFixed(0)} kPa</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-lg overflow-hidden">
                          <div className="h-full bg-cyan-600 transition-all duration-300" style={{width: `${(metrics.porePressure / 100) * 100}%`}}></div>
                      </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 font-bold border border-slate-600 flex items-center justify-center gap-2"
                      >
                          {simState === 'RUNNING' ? <Pause size={12}/> : <Play size={12}/>}
                          {simState === 'RUNNING' ? 'PAUSE' : 'SIMULATE'}
                      </button>
                      <button 
                        onClick={() => {setRainLevel(0); setSimState('IDLE'); setMetrics(m => ({...m, fos: 1.35}));}}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RefreshCw size={12}/>
                      </button>
                  </div>
              </div>
          </div>

          {/* Charts: Inverse Velocity */}
          <SciFiCard title="倒速度分析 (Inverse Velocity)" subtitle="FAILURE PREDICTION" className="h-[240px] border-red-900/50 bg-[#1a0f0d]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={INVERSE_VELOCITY_DATA} margin={{left: 0}}>
                          <defs>
                              <linearGradient id="gradInv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '1/V', angle: -90, position: 'insideLeft' }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                          <ReferenceLine y={0} stroke="red" label="Failure" />
                          <Area type="monotone" dataKey="invV" stroke="#f59e0b" fill="url(#gradInv)" strokeWidth={2} name="Inv. Velocity" />
                      </AreaChart>
                  </ResponsiveContainer>
                  {metrics.maxDispVelocity > 10 && (
                      <div className="absolute bottom-2 left-10 text-[10px] text-red-400 bg-black/60 px-2 rounded animate-pulse">
                          Approaching Asymptote!
                      </div>
                  )}
              </div>
          </SciFiCard>

          {/* Charts: Displacement */}
          <SciFiCard title="位移监测与降雨关联" subtitle="TREND" className="flex-1 border-red-900/50 bg-[#1a0f0d]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={DISPLACEMENT_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                          <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Disp (mm)', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Rain', angle: 90, position: 'insideRight' }} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#ef4444'}} />
                          <Bar yAxisId="right" dataKey="rain" fill="#3b82f6" barSize={8} opacity={0.5} />
                          <Line yAxisId="left" type="monotone" dataKey="disp" stroke="#ef4444" strokeWidth={2} dot={false} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>
    </div>
  );
};
