
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-berth]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-berth';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, Navigation, Wind, Activity, 
  ArrowRight, Target, AlertTriangle, 
  Settings, Play, Pause, RotateCcw, 
  ArrowUp, ArrowDown, Crosshair, Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const SPEED_HISTORY = Array.from({length: 60}, (_, i) => ({
    time: i,
    bow: 0,
    stern: 0
}));

export const PortBerthingSimView: React.FC = () => {
  // --- STATE ---
  const [dist, setDist] = useState(20.0); // meters from quay
  const [angle, setAngle] = useState(5.0); // degrees (Bow in/out)
  const [tug1Force, setTug1Force] = useState(0); // % Push/Pull (Positive=Push)
  const [tug2Force, setTug2Force] = useState(0); // %
  
  const [metrics, setMetrics] = useState({
    speedBow: 0, // cm/s
    speedStern: 0, // cm/s
    rot: 0, // deg/min
    wind: 5.0, // m/s
    impactRisk: 'LOW'
  });

  const [history, setHistory] = useState(SPEED_HISTORY);
  const [isRunning, setIsRunning] = useState(true);

  // Simulation Physics Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        setMetrics(prev => {
            // Forces
            // Wind pushes away (positive dist)
            const windForce = metrics.wind * 0.05;
            
            // Tugs push towards quay (negative dist)
            const t1 = tug1Force / 100 * 0.2;
            const t2 = tug2Force / 100 * 0.2;
            
            // Net velocity change
            const vBow = prev.speedBow + (windForce - t1 - 0.01) * 0.1; // Inertia/Drag
            const vStern = prev.speedStern + (windForce - t2 - 0.01) * 0.1;
            
            // Update Dist and Angle
            // Mean velocity towards quay (cm/s -> m/s / 100)
            const vMean = (vBow + vStern) / 2;
            let newDist = dist - (vMean / 100) * 0.2; // 0.2s step
            
            // Rotation (deg)
            // Diff in velocity causes rotation
            const rotSpeed = (vBow - vStern) * 0.05;
            let newAngle = angle + rotSpeed * 0.2;

            // Collision/Docking
            if (newDist <= 0.5) {
                newDist = 0.5;
                // Impact Logic
                if (Math.abs(vMean) > 8) {
                    return { ...prev, impactRisk: 'CRITICAL', speedBow: 0, speedStern: 0 };
                }
            }

            // Update State hooks for next render (this pattern effectively syncs state)
            setDist(newDist);
            setAngle(newAngle);

            return {
                ...prev,
                speedBow: vBow,
                speedStern: vStern,
                rot: rotSpeed * 60, // deg/min
                impactRisk: Math.abs(vMean) > 10 ? 'HIGH' : Math.abs(vMean) > 5 ? 'WARN' : 'LOW'
            };
        });
        
        // Chart Update
        setHistory(h => {
            const next = [...h.slice(1)];
            next.push({
                time: h[h.length-1].time + 1,
                bow: metrics.speedBow,
                stern: metrics.speedStern
            });
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, tug1Force, tug2Force, dist, angle]);

  const handleReset = () => {
      setDist(20);
      setAngle(5);
      setTug1Force(0);
      setTug2Force(0);
      setMetrics(m => ({...m, speedBow:0, speedStern:0, impactRisk:'LOW'}));
  };

  return (
    <div className="h-full w-full relative bg-[#020610] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-berth" 
            simData={{ 
                shipDist: dist,
                shipAngle: angle,
                tug1Force,
                tug2Force,
                speedBow: metrics.speedBow,
                speedStern: metrics.speedStern
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020610_100%)] pointer-events-none"></div>
          {/* Laser Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Anchor size={14} /> PRECISION DOCKING SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 船舶靠离泊 <span className="text-cyan-500">与拖轮协同仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Dist to Berth</div>
                   <div className="text-3xl font-mono font-bold text-white">{dist.toFixed(2)} m</div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Approach Speed</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.impactRisk === 'HIGH' ? 'text-red-500' : 'text-green-400'}`}>
                       {((metrics.speedBow + metrics.speedStern)/2).toFixed(1)} <span className="text-sm text-slate-500">cm/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Impact Risk</div>
                   <div className={`text-2xl font-bold ${metrics.impactRisk === 'CRITICAL' ? 'text-red-600 animate-bounce' : metrics.impactRisk === 'HIGH' ? 'text-orange-500' : 'text-blue-400'}`}>
                       {metrics.impactRisk}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Laser Docking System */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="激光靠泊监测 (LDS)" subtitle="BOW / STERN" className="flex-1 border-cyan-900/50 bg-[#060b10]/90 pointer-events-auto">
              <div className="flex flex-col gap-6 p-2 h-full justify-center">
                  
                  {/* Bow Indicator */}
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700 relative overflow-hidden">
                      <div className="absolute right-2 top-2 text-xs text-slate-500 font-bold">BOW</div>
                      <div className="flex justify-between items-end mb-2">
                          <div>
                              <div className="text-[10px] text-slate-400">Distance</div>
                              <div className="text-2xl font-mono text-white">{(dist + Math.sin(angle*Math.PI/180)*20).toFixed(2)} m</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-slate-400">Speed</div>
                              <div className={`text-xl font-mono ${Math.abs(metrics.speedBow) > 8 ? 'text-red-400' : 'text-cyan-300'}`}>
                                  {metrics.speedBow.toFixed(1)} cm/s
                              </div>
                          </div>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${metrics.speedBow > 5 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                               style={{width: `${Math.min(100, Math.abs(metrics.speedBow)*10)}%`}}></div>
                      </div>
                  </div>

                  {/* Stern Indicator */}
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700 relative overflow-hidden">
                      <div className="absolute right-2 top-2 text-xs text-slate-500 font-bold">STERN</div>
                      <div className="flex justify-between items-end mb-2">
                          <div>
                              <div className="text-[10px] text-slate-400">Distance</div>
                              <div className="text-2xl font-mono text-white">{(dist - Math.sin(angle*Math.PI/180)*20).toFixed(2)} m</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] text-slate-400">Speed</div>
                              <div className={`text-xl font-mono ${Math.abs(metrics.speedStern) > 8 ? 'text-red-400' : 'text-cyan-300'}`}>
                                  {metrics.speedStern.toFixed(1)} cm/s
                              </div>
                          </div>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${metrics.speedStern > 5 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                               style={{width: `${Math.min(100, Math.abs(metrics.speedStern)*10)}%`}}></div>
                      </div>
                  </div>
                  
                  {/* Angle */}
                  <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded border border-slate-800">
                      <span className="text-xs text-slate-300 flex items-center gap-2"><Navigation size={14}/> Angle</span>
                      <span className="font-mono text-lg text-yellow-400">{angle.toFixed(1)}°</span>
                  </div>

              </div>
          </SciFiCard>

          <SciFiCard title="速度趋势曲线" subtitle="1 MIN" className="h-[200px] border-cyan-900/50 bg-[#060b10]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                          <defs>
                              <linearGradient id="gradBow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[-15, 15]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                          <ReferenceLine y={8} stroke="red" strokeDasharray="3 3" />
                          <ReferenceLine y={-8} stroke="red" strokeDasharray="3 3" />
                          <Area type="monotone" dataKey="bow" stroke="#06b6d4" fill="url(#gradBow)" strokeWidth={2} name="Bow Spd" />
                          <Area type="monotone" dataKey="stern" stroke="#facc15" fill="none" strokeWidth={2} name="Stern Spd" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Tug Control */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#060b10]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Target size={16} className="text-green-400"/> 拖轮协同控制
              </h3>
              
              <div className="space-y-6">
                  {/* Tug 1 (Bow) */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-bold">Tug 1 (Bow)</span>
                          <span className={`font-mono ${tug1Force > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tug1Force > 0 ? `PUSH ${tug1Force}%` : tug1Force < 0 ? `PULL ${Math.abs(tug1Force)}%` : 'IDLE'}
                          </span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Pull</span>
                          <input 
                            type="range" min="-100" max="100" step="10" 
                            value={tug1Force} onChange={(e) => setTug1Force(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                          <span className="text-[10px] text-slate-500">Push</span>
                      </div>
                  </div>

                  {/* Tug 2 (Stern) */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-bold">Tug 2 (Stern)</span>
                          <span className={`font-mono ${tug2Force > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tug2Force > 0 ? `PUSH ${tug2Force}%` : tug2Force < 0 ? `PULL ${Math.abs(tug2Force)}%` : 'IDLE'}
                          </span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Pull</span>
                          <input 
                            type="range" min="-100" max="100" step="10" 
                            value={tug2Force} onChange={(e) => setTug2Force(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                          <span className="text-[10px] text-slate-500">Push</span>
                      </div>
                  </div>

                  <div className="p-3 bg-cyan-900/20 border border-cyan-800/30 rounded flex justify-between items-center text-xs">
                      <span className="text-slate-300">Total Force Applied</span>
                      <span className="font-bold text-white">{(Math.abs(tug1Force) + Math.abs(tug2Force)) * 0.5} Ton</span>
                  </div>
              </div>
          </div>

          <SciFiCard title="环境干扰" subtitle="ENV" className="flex-1 border-cyan-900/50 bg-[#060b10]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Wind size={16} className="text-blue-400"/>
                          Offshore Wind
                      </div>
                      <span className="font-mono text-white font-bold">{metrics.wind.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Waves size={16} className="text-blue-600"/>
                          Current
                      </div>
                      <span className="font-mono text-white font-bold">0.5 kn</span>
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                      <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${isRunning ? 'bg-cyan-700/50 border-cyan-500 text-white' : 'bg-green-700/50 border-green-500 text-white'}
                        `}
                      >
                          {isRunning ? <Pause size={14}/> : <Play size={14}/>} {isRunning ? 'PAUSE' : 'SIMULATE'}
                      </button>
                      <button 
                        onClick={handleReset}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RotateCcw size={14}/>
                      </button>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* BOTTOM CENTER: Action Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur px-8 py-3 rounded-full border border-cyan-500/30 flex gap-8">
               <div className="flex flex-col items-center">
                   <span className="text-[9px] text-slate-500 uppercase">ROT</span>
                   <span className="text-sm font-bold text-white">{metrics.rot.toFixed(1)} °/m</span>
               </div>
               <div className="w-px h-8 bg-slate-700"></div>
               <div className="flex flex-col items-center">
                   <span className="text-[9px] text-slate-500 uppercase">UKC</span>
                   <span className="text-sm font-bold text-green-400">2.5 m</span>
               </div>
               <div className="w-px h-8 bg-slate-700"></div>
               <div className="flex flex-col items-center">
                   <span className="text-[9px] text-slate-500 uppercase">Mode</span>
                   <span className="text-sm font-bold text-yellow-400">ASSISTED</span>
               </div>
          </div>
      </div>

    </div>
  );
};
