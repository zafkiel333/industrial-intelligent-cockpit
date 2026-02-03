import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ArrowUp, ArrowDown, Settings, Activity, 
  Waves, AlertOctagon, Maximize2, Zap, 
  Gauge, TrendingUp, Anchor
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, BarChart, Bar
} from 'recharts';

// --- MOCK DATA ---
const VIBRATION_DATA = Array.from({length: 40}, (_, i) => ({
    freq: i * 2,
    amp: Math.random() * 0.5 // Will be updated by simulation
}));

const PRESSURE_DIST = Array.from({length: 10}, (_, i) => ({
    height: i, // m from bottom
    pressure: (10 - i) * 10 // kPa (Hydrostatic)
}));

export const HydroGateSimView: React.FC = () => {
  // --- STATE ---
  const [opening, setOpening] = useState(0); // %
  const [headLevel, setHeadLevel] = useState(10.0); // m
  const [hoistSpeed, setHoistSpeed] = useState(0.5); // m/min
  const [isMoving, setIsMoving] = useState(false);
  const [moveDir, setMoveDir] = useState(0); // 1 = Open, -1 = Close

  const [metrics, setMetrics] = useState({
    discharge: 0, // m3/s
    velocity: 0, // m/s
    maxStress: 120, // MPa
    vibration: 0.2 // mm/s
  });

  const [vibData, setVibData] = useState(VIBRATION_DATA);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // 1. Gate Movement
        if (isMoving) {
            setOpening(prev => {
                const next = prev + moveDir * hoistSpeed * 0.5; // Speed scaler
                if (next >= 100) { setIsMoving(false); return 100; }
                if (next <= 0) { setIsMoving(false); return 0; }
                return next;
            });
        }

        // 2. Physics Calculation
        const openM = (opening / 100) * 8; // Max opening 8m
        // Q = C * L * a * sqrt(2gh)
        const discharge = 0.6 * 10 * Math.max(0.1, openM) * Math.sqrt(2 * 9.81 * headLevel);
        const velocity = discharge / (10 * Math.max(0.1, openM));
        
        // FSI Effects
        // Stress prop to Head * (1 - Opening)
        const stress = (headLevel * 10) * (1 - opening/150) + Math.random()*2;
        
        // Vibration peaks at partial openings (40-60%)
        const vibFactor = Math.exp(-Math.pow((opening - 40)/20, 2));
        const vib = 0.2 + vibFactor * 2.5 + Math.random() * 0.1;

        setMetrics({
            discharge,
            velocity,
            maxStress: stress,
            vibration: vib
        });

        // Update Charts
        setVibData(prev => prev.map(p => ({
            ...p,
            amp: (p.freq < 10 ? vib * 2 : vib * 0.5) * Math.random()
        })));

    }, 100);
    return () => clearInterval(interval);
  }, [isMoving, opening, headLevel, moveDir, hoistSpeed]);

  return (
    <div className="h-full w-full relative bg-[#0b0c16] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-gate" 
            simData={{ 
                opening,
                headLevel
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0b0c16_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e293b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Activity size={14} /> FSI ANALYSIS
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 闸门启闭 <span className="text-cyan-500">流固耦合仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Max Stress</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.maxStress > 150 ? 'text-red-500' : 'text-white'}`}>
                       {metrics.maxStress.toFixed(1)} <span className="text-sm text-slate-500">MPa</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Flow Velocity</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.velocity.toFixed(1)} <span className="text-sm text-slate-500">m/s</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0f1729]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 启闭机控制
              </h3>
              
              <div className="space-y-6">
                  {/* Opening Indicator */}
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700 flex flex-col items-center">
                      <div className="text-4xl font-black text-white mb-1">{opening.toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-400 uppercase">Gate Opening</div>
                      <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{width: `${opening}%`}}></div>
                      </div>
                  </div>

                  {/* Manual Controls */}
                  <div className="flex gap-2">
                      <button 
                        onMouseDown={() => { setIsMoving(true); setMoveDir(1); }}
                        onMouseUp={() => setIsMoving(false)}
                        className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                          <ArrowUp size={16}/> RAISE
                      </button>
                      <button 
                        onMouseDown={() => { setIsMoving(true); setMoveDir(-1); }}
                        onMouseUp={() => setIsMoving(false)}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                          <ArrowDown size={16}/> LOWER
                      </button>
                  </div>

                  {/* Parameters */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>Headwater Level</span>
                              <span className="text-blue-400">{headLevel} m</span>
                          </div>
                          <input 
                            type="range" min="5" max="15" step="0.5" 
                            value={headLevel} onChange={(e) => setHeadLevel(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>
                      <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>Hoist Speed</span>
                              <span className="text-yellow-400">{hoistSpeed} m/min</span>
                          </div>
                          <input 
                            type="range" min="0.1" max="2.0" step="0.1" 
                            value={hoistSpeed} onChange={(e) => setHoistSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                          />
                      </div>
                  </div>
              </div>
          </div>

          <SciFiCard title="水力特性参数" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50 bg-[#0f1729]/90 pointer-events-auto">
              <div className="grid grid-cols-2 gap-3 p-1">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Discharge</div>
                      <div className="text-lg font-bold text-white">{metrics.discharge.toFixed(0)}</div>
                      <div className="text-[9px] text-cyan-500">m³/s</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Energy</div>
                      <div className="text-lg font-bold text-white">{(metrics.discharge * headLevel * 9.81 / 1000).toFixed(1)}</div>
                      <div className="text-[9px] text-yellow-500">MW</div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Vibration Spectrum */}
          <SciFiCard title="流激振动频谱 (FIV)" subtitle="mm/s" className="h-[280px] border-cyan-900/50 bg-[#0f1729]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={vibData}>
                          <defs>
                              <linearGradient id="gradVib" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Hz', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                          <Area type="monotone" dataKey="amp" stroke="#f59e0b" fill="url(#gradVib)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Pressure Distribution */}
          <SciFiCard title="闸门面板压力分布" subtitle="HYDROSTATIC" className="flex-1 border-cyan-900/50 bg-[#0f1729]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={PRESSURE_DIST} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis dataKey="height" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Height (m)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000'}} />
                              <Bar dataKey="pressure" fill="#0ea5e9" barSize={15} radius={[0, 4, 4, 0]} name="Pressure (kPa)" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800 flex items-center gap-2">
                      <AlertOctagon size={16} className={metrics.maxStress > 140 ? "text-red-500" : "text-green-500"} />
                      <div className="text-[10px] text-slate-300">
                          Structural Integrity: <span className="font-bold text-white">{metrics.maxStress > 140 ? 'CRITICAL' : 'GOOD'}</span>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};