
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { 
  Bomb, Activity, Play, RotateCcw, 
  AlertTriangle, Settings, Radio, 
  ArrowRight, Maximize, Ruler, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line
} from 'recharts';

// --- Types ---
interface WaveformPoint {
  time: number;
  velocity: number;
}

// --- Mock Data ---
const ATTENUATION_DATA = Array.from({length: 20}, (_, i) => {
    const dist = 50 + i * 20;
    // Sadovsky: V = K * (Q^1/3 / R)^alpha
    // Simplified decay
    const ppv = 200 * Math.pow(dist, -1.5);
    return { dist, ppv, limit: 2.0 }; // limit 2 cm/s
});

export const MineBlastSimView: React.FC = () => {
  // State
  const [trigger, setTrigger] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [blastConfig, setBlastConfig] = useState({
      chargeWeight: 120, // kg
      distance: 150, // m
      kFactor: 150, // Site constant
      alpha: 1.6 // Attenuation index
  });

  const [ppvResult, setPpvResult] = useState(0);
  const [waveData, setWaveData] = useState<WaveformPoint[]>([]);

  // Real-time calculation
  useEffect(() => {
      // V = K * (Q^(1/2) / R)^alpha  (Usually cube root or square root depending on standard, using square for simplicity)
      // Standard: V = K * (R / Q^0.5)^-alpha
      const { chargeWeight, distance, kFactor, alpha } = blastConfig;
      const sd = distance / Math.sqrt(chargeWeight); // Scaled Distance
      const v = kFactor * Math.pow(sd, -alpha);
      setPpvResult(v);
  }, [blastConfig]);

  // Waveform Animation on Trigger
  useEffect(() => {
      if (trigger) {
          // Generate a synthetic seismic waveform
          const newData = [];
          for(let i=0; i<100; i++) {
              const t = i * 0.01; // seconds
              // Ricker wavelet-ish shape
              const val = (1 - 2 * Math.PI * Math.PI * 25 * (t - 0.2) ** 2) * Math.exp(-Math.PI * Math.PI * 25 * (t - 0.2) ** 2);
              newData.push({ time: i, velocity: val * ppvResult });
          }
          setWaveData(newData);
      }
  }, [trigger, ppvResult]);

  const handleFire = () => {
      setTrigger(false); // Reset first if needed
      setTimeout(() => {
          setTrigger(true);
          setStartTime(0); // In the ThreeScene, we use clock.getElapsedTime, so we might need to sync. 
          // Actually, passing a timestamp or just a boolean toggle is better.
          // Let's pass current THREE clock time? No, we pass a trigger signal.
          // We'll reset the builder animation by passing a new start time reference.
          // Since ThreeScene uses its own clock, we can pass Date.now() / 1000 as a sync point relative to mount?
          // Easier: Pass a 'reset' signal.
      }, 50);
  };

  return (
    <div className="h-full w-full relative bg-[#0f0505] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D Background */}
      <div className="absolute inset-0 z-0">
          {/* We pass a prop that changes to trigger the blast */}
          <SimThreeScene 
            type="mine-blast" 
            simData={{ trigger, startTime: trigger ? 0 : -1 }} 
            // Note: The builder uses clock.getElapsedTime. 
            // To sync, we'd ideally pass the time we clicked 'Fire'.
            // For this demo, the builder logic receives 'trigger' and uses internal time delta logic.
            // We'll rely on the builder to handle the sequence once triggered.
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0f0505_100%)] pointer-events-none"></div>
      </div>

      {/* 2. Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-red-950/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Bomb size={14} /> SEISMIC MONITORING
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 爆破震动 <span className="text-orange-600">& 冲击波传播仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-6 pointer-events-auto">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Est. PPV</span>
                  <span className={`font-mono font-bold text-2xl ${ppvResult > 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                      {ppvResult.toFixed(2)} <span className="text-sm">cm/s</span>
                  </span>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <button 
                onClick={handleFire}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400 flex items-center gap-2 transition-transform active:scale-95"
              >
                  <Activity size={18} /> 起爆 (FIRE)
              </button>
          </div>
      </div>

      {/* 3. Left Panel: Blast Design */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          <div className="bg-[#1a0a0a]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Settings size={16} className="text-orange-500"/> 爆破参数设计
              </h3>
              
              <div className="space-y-6">
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Charge per Delay (Q)</span>
                          <span className="font-mono text-orange-400">{blastConfig.chargeWeight} kg</span>
                      </div>
                      <input 
                        type="range" min="50" max="500" step="10"
                        value={blastConfig.chargeWeight} 
                        onChange={(e) => setBlastConfig({...blastConfig, chargeWeight: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Monitoring Distance (R)</span>
                          <span className="font-mono text-cyan-400">{blastConfig.distance} m</span>
                      </div>
                      <input 
                        type="range" min="50" max="500" step="10"
                        value={blastConfig.distance} 
                        onChange={(e) => setBlastConfig({...blastConfig, distance: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <span className="text-[10px] text-slate-500">Site Factor (K)</span>
                          <input 
                            type="number" value={blastConfig.kFactor}
                            onChange={(e) => setBlastConfig({...blastConfig, kFactor: parseFloat(e.target.value)})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                      </div>
                      <div className="space-y-1">
                          <span className="text-[10px] text-slate-500">Attenuation (α)</span>
                          <input 
                            type="number" value={blastConfig.alpha}
                            onChange={(e) => setBlastConfig({...blastConfig, alpha: parseFloat(e.target.value)})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* Sequence Chart */}
          <div className="flex-1 bg-[#1a0a0a]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Radio size={16} className="text-red-500"/> 微差起爆时序
              </h3>
              <div className="flex-1 flex items-center justify-center">
                  <div className="w-full space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-8">Row 1</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative overflow-hidden">
                              {trigger && <div className="absolute left-0 top-0 bottom-0 bg-orange-500 w-full animate-[progress_0.5s_linear]"></div>}
                          </div>
                          <span className="w-8 text-right">0ms</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-8">Row 2</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative overflow-hidden">
                              {trigger && <div className="absolute left-0 top-0 bottom-0 bg-orange-500 w-full animate-[progress_0.5s_linear_0.5s_backwards]"></div>}
                          </div>
                          <span className="w-8 text-right">50ms</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-8">Row 3</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative overflow-hidden">
                              {trigger && <div className="absolute left-0 top-0 bottom-0 bg-orange-500 w-full animate-[progress_0.5s_linear_1s_backwards]"></div>}
                          </div>
                          <span className="w-8 text-right">100ms</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 4. Right Panel: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* PPV Chart */}
          <div className="h-[250px] bg-[#1a0a0a]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity size={16} className="text-red-500"/> 振动衰减曲线 (PPV)
              </h3>
              <div className="h-full pb-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ATTENUATION_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#442a1d" vertical={false} />
                          <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'PPV (cm/s)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#f97316', color: '#fff'}} />
                          <ReferenceLine y={2.0} stroke="red" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                          <Line type="monotone" dataKey="ppv" stroke="#f97316" strokeWidth={2} dot={false} />
                          {/* Current Point */}
                          <ReferenceLine x={blastConfig.distance} stroke="white" strokeDasharray="2 2" />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Waveform Monitor */}
          <div className="flex-1 bg-[#1a0a0a]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500"/> 实时波形监测
              </h3>
              <div className="flex-1 w-full relative bg-black/50 rounded border border-slate-800 overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  
                  {waveData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={waveData}>
                              <YAxis domain={['auto', 'auto']} hide />
                              <Line type="monotone" dataKey="velocity" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                          Waiting for trigger...
                      </div>
                  )}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>Sensor: Geophone-01</span>
                  <span>Sample Rate: 1000Hz</span>
              </div>
          </div>

          {/* Safety Check */}
          <div className={`p-4 rounded-lg border flex items-center gap-4 transition-colors
              ${ppvResult > 5.0 ? 'bg-red-900/80 border-red-500' : 
                ppvResult > 2.0 ? 'bg-orange-900/80 border-orange-500' : 'bg-green-900/80 border-green-500'}
          `}>
              <AlertTriangle size={24} className={ppvResult > 2.0 ? 'text-white animate-bounce' : 'text-white'} />
              <div>
                  <div className="text-xs font-bold text-white uppercase">Safety Compliance</div>
                  <div className="text-sm font-bold text-white">
                      {ppvResult > 5.0 ? 'DANGER: EVACUATE' : 
                       ppvResult > 2.0 ? 'WARNING: HIGH VIB' : 'SAFE TO BLAST'}
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};
