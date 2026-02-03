
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertTriangle, Navigation, Radar, Anchor, 
  MapPin, ShieldAlert, Crosshair, Ship,
  Settings, Play, Pause, RotateCcw, Target
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const RISK_HISTORY = Array.from({length: 30}, (_, i) => ({
    time: i,
    dcpa: 500, // meters
    tcpa: 300, // seconds
    risk: 10
}));

export const PortCollisionSimView: React.FC = () => {
  // State
  const [ownSpeed, setOwnSpeed] = useState(12); // kn
  const [ownHeading, setOwnHeading] = useState(0); // deg
  const [targetSpeed, setTargetSpeed] = useState(12); // kn
  const [targetHeading, setTargetHeading] = useState(180); // deg
  const [simTime, setSimTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const [metrics, setMetrics] = useState({
    dcpa: 0, // Distance to CPA (m)
    tcpa: 0, // Time to CPA (s)
    collisionRisk: 0, // %
    ukc: 5.0, // m
  });

  const [chartData, setChartData] = useState(RISK_HISTORY);

  // Simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        setSimTime(t => (t + 0.1) % 60);

        // Simple Geometric Calc for CPA
        // Ship 1 (Own) at (0, -30) moving North (0 deg) speed 12
        // Ship 2 (Target) at (0, 30) moving South (180 deg) speed 12
        // If headings intersect, CPA is low.
        
        // Relative Vel
        // V_rel = V_own - V_target
        // Pos_rel = Pos_own - Pos_target
        // ... simplified for demo visual feedback
        
        // Impact of heading difference
        const headingDiff = Math.abs(ownHeading - (targetHeading - 180));
        const approachSpeed = (ownSpeed + targetSpeed) * Math.cos(headingDiff * Math.PI/180);
        
        // Simulated CPA metrics based on heading convergence
        // Perfect head-on (0 diff) -> DCPA ~ 0
        const estimatedDCPA = Math.abs(Math.sin((ownHeading - targetHeading)*Math.PI/180)) * 500 + 50; 
        const estimatedTCPA = Math.max(0, 300 - simTime * 10);
        
        const risk = estimatedDCPA < 200 && estimatedTCPA < 60 ? 90 : 
                     estimatedDCPA < 500 ? 50 : 10;

        setMetrics({
            dcpa: estimatedDCPA,
            tcpa: estimatedTCPA,
            collisionRisk: risk,
            ukc: 5.0 - (ownSpeed / 20) // Squat effect
        });

        // Update Charts
        setChartData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: prev[prev.length-1].time + 1,
                dcpa: estimatedDCPA,
                tcpa: estimatedTCPA,
                risk: risk
            });
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, ownSpeed, ownHeading, targetHeading, targetSpeed, simTime]);

  return (
    <div className="h-full w-full relative bg-[#020617] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-collision" 
            simData={{ 
                ownSpeed, ownHeading,
                targetSpeed, targetHeading,
                simTime
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_100%)] pointer-events-none"></div>
          {/* Radar Ring Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none"></div>
          
          {/* Collision Alert */}
          {metrics.collisionRisk > 80 && (
              <div className="absolute inset-0 border-[20px] border-red-500/30 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                  <div className="bg-red-900/80 text-white px-8 py-4 rounded border-2 border-red-500 text-2xl font-bold tracking-widest shadow-[0_0_50px_red]">
                      COLLISION WARNING
                  </div>
              </div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ShieldAlert size={14} /> MARITIME SAFETY SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 船舶碰撞 <span className="text-cyan-500">& 搁浅事故仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">DCPA</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.dcpa < 200 ? 'text-red-500' : 'text-white'}`}>
                       {metrics.dcpa.toFixed(0)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">TCPA</div>
                   <div className="text-3xl font-mono font-bold text-yellow-400">
                       {metrics.tcpa.toFixed(0)} <span className="text-sm text-slate-500">s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Risk Prob.</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.collisionRisk > 50 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.collisionRisk.toFixed(0)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0c1620]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Navigation size={16} className="text-cyan-500"/> 本船操控 (Own Ship)
              </h3>
              
              <div className="space-y-6">
                  {/* Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Telegraph (Speed)</span>
                          <span className="font-mono text-cyan-300">{ownSpeed} kn</span>
                      </div>
                      <input 
                        type="range" min="0" max="25" step="1" 
                        value={ownSpeed} onChange={(e) => setOwnSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Heading */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Rudder (Heading)</span>
                          <span className="font-mono text-white">{ownHeading}°</span>
                      </div>
                      <input 
                        type="range" min="-45" max="45" step="1" 
                        value={ownHeading} onChange={(e) => setOwnHeading(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>Port</span><span>Center</span><span>Stbd</span>
                      </div>
                  </div>

                  {/* Target Controls */}
                  <div className="pt-4 border-t border-slate-700 space-y-4">
                      <div className="text-xs font-bold text-red-400 flex items-center gap-2">
                          <Target size={12}/> Target Ship Behavior
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Heading Offset</span>
                              <span>{targetHeading}°</span>
                          </div>
                          <input 
                            type="range" min="135" max="225" step="5" 
                            value={targetHeading} onChange={(e) => setTargetHeading(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                      </div>
                  </div>
              </div>

              <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${isRunning ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
                    `}
                  >
                      {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                      {isRunning ? 'PAUSE' : 'SIMULATE'}
                  </button>
                  <button 
                    onClick={() => { setOwnHeading(0); setOwnSpeed(12); setSimTime(0); }}
                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                  >
                      <RotateCcw size={14}/>
                  </button>
              </div>
          </div>

          <SciFiCard title="避碰参数曲线" subtitle="CPA TREND" className="flex-1 border-cyan-900/50 bg-[#0c1620]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" hide />
                          <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                          <Area yAxisId="left" type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#gradRisk)" strokeWidth={2} name="Risk %" />
                          <Line yAxisId="right" type="monotone" dataKey="dcpa" stroke="#0ea5e9" strokeWidth={2} dot={false} name="DCPA" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Radar & Grounding */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Radar Plot */}
          <SciFiCard title="雷达矢量图 (ARPA)" subtitle="RANGE 6nm" className="h-[300px] border-cyan-900/50 bg-[#0c1620]/90 pointer-events-auto">
              <div className="relative w-full h-full flex items-center justify-center p-2">
                  {/* Radar Circles */}
                  <div className="absolute inset-4 rounded-full border border-cyan-900/50"></div>
                  <div className="absolute inset-12 rounded-full border border-cyan-900/30"></div>
                  <div className="absolute inset-20 rounded-full border border-cyan-900/20"></div>
                  {/* Crosshair */}
                  <div className="absolute w-full h-[1px] bg-cyan-900/50"></div>
                  <div className="absolute h-full w-[1px] bg-cyan-900/50"></div>
                  
                  {/* Own Ship (Center) */}
                  <div className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-cyan-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Target Ship (Relative) */}
                  {/* Map relative pos. Own at (0,0). Target roughly at (0, 60) in 3D world space relative to camera? No relative to ship. */}
                  {/* In 3D: Ship starts at -30, Target at 30. Dist 60. */}
                  {/* Relative vector: Target - Own. */}
                  {/* Visual approx: Target is North-East of Own usually? */}
                  {/* We map simTime to position on radar */}
                  <div 
                     className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                     style={{ 
                         top: `${30 + (simTime/60)*40}%`, 
                         left: `${60 - (simTime/60)*20}%` 
                     }}
                  >
                      {/* Vector Line */}
                      <div className="absolute top-1/2 left-1/2 w-8 h-[2px] bg-red-500 origin-left transform rotate-135"></div>
                  </div>
              </div>
          </SciFiCard>

          {/* Grounding Status */}
          <div className="flex-1 bg-[#0c1620]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Anchor size={16} className="text-orange-500"/> 搁浅风险监测 (UKC)
              </h3>
              
              <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Water Depth</span>
                      <span className="text-white font-bold">12.0 m</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Static Draft</span>
                      <span className="text-white font-bold">6.5 m</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mb-4">
                      <span>Dynamic Squat</span>
                      <span className="text-orange-400 font-bold">{(ownSpeed/20).toFixed(2)} m</span>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700 text-center">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Net UKC</div>
                      <div className={`text-4xl font-bold ${metrics.ukc < 1.0 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                          {metrics.ukc.toFixed(2)} <span className="text-sm">m</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-2">Safety Threshold: 1.0m</div>
                  </div>
              </div>
              
              {metrics.ukc < 1.5 && (
                  <div className="p-2 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-xs text-red-200">
                      <AlertTriangle size={16}/> Shallow Water Alert!
                  </div>
              )}
          </div>

      </div>

    </div>
  );
};
