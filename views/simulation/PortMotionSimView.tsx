
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-motion]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-motion';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Anchor, Wind, Compass, 
  Activity, AlertTriangle, RotateCcw, 
  Play, Pause, Gauge, Navigation
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---
const ROLL_DATA_TEMPLATE = Array.from({length: 60}, (_, i) => ({ t: i, val: 0 }));

export const PortMotionSimView: React.FC = () => {
  // State
  const [isRunning, setIsRunning] = useState(true);
  const [waveHeight, setWaveHeight] = useState(2.5); // m
  const [wavePeriod, setWavePeriod] = useState(8.0); // s
  const [waveDir, setWaveDir] = useState(45); // deg
  const [shipSpeed, setShipSpeed] = useState(12); // kn
  
  // Metrics
  const [metrics, setMetrics] = useState({
    roll: 0, // deg
    pitch: 0, // deg
    heave: 0, // m
    stabilityGZ: 0.5, // m
    dangerLevel: 'SAFE'
  });

  const [rollHistory, setRollHistory] = useState(ROLL_DATA_TEMPLATE);
  const [pitchHistory, setPitchHistory] = useState(ROLL_DATA_TEMPLATE);

  // Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // Sample physics state (simulated)
        // In a real app, we'd get this back from the 3D scene or a dedicated worker physics engine
        // Here we approximate based on inputs for UI feedback
        const time = Date.now() / 1000;
        
        // Response functions (RAO approx)
        // Roll resonance near 10s period usually
        const rollAmp = waveHeight * (1 + Math.sin(Math.abs(wavePeriod - 10))); 
        const pitchAmp = waveHeight * 0.8;
        
        // Encounter frequency
        // w_e = w - (w^2 * V * cos(beta) / g)
        
        const roll = Math.sin(time * 2) * rollAmp * Math.sin(waveDir * Math.PI/180);
        const pitch = Math.cos(time * 1.5) * pitchAmp * Math.cos(waveDir * Math.PI/180);
        const heave = Math.sin(time) * waveHeight * 0.5;
        
        // GZ Curve (Righting Arm) - Simplified static stability
        // Decreases as roll increases
        const gz = Math.max(0, 2.5 * Math.sin((30 - Math.abs(roll)) * Math.PI/180));

        let danger = 'SAFE';
        if (Math.abs(roll) > 20 || gz < 0.1) danger = 'CRITICAL';
        else if (Math.abs(roll) > 10) danger = 'WARNING';

        setMetrics({
            roll,
            pitch,
            heave,
            stabilityGZ: gz,
            dangerLevel: danger
        });

        // Update Charts
        setRollHistory(prev => [...prev.slice(1), { t: time, val: roll }]);
        setPitchHistory(prev => [...prev.slice(1), { t: time, val: pitch }]);

    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, waveHeight, wavePeriod, waveDir]);

  return (
    <div className="h-full w-full relative bg-[#082f49] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-motion" 
            simData={{ 
                waveHeight,
                wavePeriod,
                waveDir,
                shipSpeed
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#082f49_100%)] pointer-events-none"></div>
          
          {/* Danger Overlay */}
          {metrics.dangerLevel === 'CRITICAL' && (
              <div className="absolute inset-0 border-[10px] border-red-500/50 animate-pulse pointer-events-none z-10"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-300 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Anchor size={14} /> MARINE DYNAMICS LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 船舶运动 <span className="text-cyan-400">& 稳性仿真分析</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-300 uppercase">Max Roll</div>
                   <div className={`text-3xl font-mono font-bold ${Math.abs(metrics.roll) > 10 ? 'text-orange-400' : 'text-white'}`}>
                       {Math.abs(metrics.roll).toFixed(1)}°
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-500"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-300 uppercase">Stability GZ</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.stabilityGZ < 0.2 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.stabilityGZ.toFixed(2)} m
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Sea State Control */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0c4a6e]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                  <Waves size={16} className="text-cyan-400"/> 海况参数设定
              </h3>
              
              <div className="space-y-6">
                  {/* Hs */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Wave Height (Hs)</span>
                          <span className="font-mono text-cyan-200">{waveHeight.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" step="0.5" 
                        value={waveHeight} onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                  </div>

                  {/* Tp */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Wave Period (Tp)</span>
                          <span className="font-mono text-white">{wavePeriod} s</span>
                      </div>
                      <input 
                        type="range" min="4" max="20" step="1" 
                        value={wavePeriod} onChange={(e) => setWavePeriod(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                  </div>

                  {/* Dir */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Wave Direction</span>
                          <span className="font-mono text-white">{waveDir}°</span>
                      </div>
                      <input 
                        type="range" min="0" max="360" step="15" 
                        value={waveDir} onChange={(e) => setWaveDir(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-300"
                      />
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button 
                         onClick={() => { setWaveHeight(8); setWavePeriod(12); setWaveDir(90); }}
                         className="flex-1 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 rounded text-xs text-red-200 font-bold"
                      >
                          STORM
                      </button>
                      <button 
                         onClick={() => { setWaveHeight(1); setWavePeriod(6); }}
                         className="flex-1 py-2 bg-green-900/40 hover:bg-green-900/60 border border-green-500/50 rounded text-xs text-green-200 font-bold"
                      >
                          CALM
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="相对波向图" subtitle="POLAR" className="flex-1 border-cyan-500/30 bg-[#0c4a6e]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative flex items-center justify-center">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <Navigation size={32} className="text-white transform rotate-[-45deg]" /> 
                   </div>
                   {/* Visualizing Wave Vector */}
                   <div 
                      className="absolute w-1 h-32 bg-gradient-to-t from-cyan-500 to-transparent origin-bottom"
                      style={{ transform: `rotate(${waveDir}deg) translateY(-50%)` }}
                   ></div>
                   <div className="absolute text-xs text-cyan-400 font-bold" style={{ transform: `rotate(${waveDir}deg) translateY(-70px)` }}>
                       WAVE
                   </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Motion Graphs */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="横摇角 (Roll Angle)" subtitle="DEGREES" className="h-[200px] border-cyan-500/30 bg-[#0c4a6e]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rollHistory}>
                          <YAxis domain={[-30, 30]} hide />
                          <ReferenceLine y={20} stroke="red" strokeDasharray="3 3" />
                          <ReferenceLine y={-20} stroke="red" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="纵摇角 (Pitch Angle)" subtitle="DEGREES" className="h-[200px] border-cyan-500/30 bg-[#0c4a6e]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pitchHistory}>
                          <YAxis domain={[-10, 10]} hide />
                          <Line type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <div className="flex-1 bg-[#0c4a6e]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                  <Activity size={16} className="text-cyan-400"/> 6-DOF 实时数据
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300 flex-1">
                  <div className="bg-black/30 p-2 rounded flex flex-col justify-center">
                      <span className="text-slate-500">Heave</span>
                      <span className="text-lg text-white">{metrics.heave.toFixed(2)} m</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex flex-col justify-center">
                      <span className="text-slate-500">Surge</span>
                      <span className="text-lg text-white">{(shipSpeed*0.514 + Math.random()*0.5).toFixed(1)} m/s</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex flex-col justify-center">
                      <span className="text-slate-500">Sway</span>
                      <span className="text-lg text-white">{(Math.sin(Date.now()/2000)*0.5).toFixed(2)} m/s</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded flex flex-col justify-center">
                      <span className="text-slate-500">Yaw</span>
                      <span className="text-lg text-white">{(Math.cos(Date.now()/5000)*2).toFixed(1)}°</span>
                  </div>
              </div>
          </div>

      </div>

      {/* CENTER HUD: Attitude Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="w-64 h-64 rounded-full border-4 border-slate-600 bg-black/50 relative overflow-hidden flex items-center justify-center shadow-2xl">
               {/* Artificial Horizon */}
               <div 
                  className="absolute w-[200%] h-[200%] bg-gradient-to-b from-sky-500 to-amber-700 transition-transform duration-100"
                  style={{ transform: `rotate(${-metrics.roll}deg) translateY(${metrics.pitch * 5}px)` }}
               >
                  <div className="absolute top-1/2 w-full h-1 bg-white"></div>
               </div>
               
               {/* Fixed Plane Icon */}
               <div className="z-10 text-white drop-shadow-md">
                   <div className="w-20 h-1 bg-yellow-400 rounded-full"></div>
                   <div className="w-2 h-10 bg-yellow-400 mx-auto -mt-5 rounded-full"></div>
               </div>
               
               {/* Graduations */}
               <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
          </div>
      </div>

    </div>
  );
};
