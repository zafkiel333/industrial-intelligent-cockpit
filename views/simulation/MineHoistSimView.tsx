
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-hoist]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-hoist';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ArrowUp, ArrowDown, Activity, Gauge, 
  Settings, Play, Pause, RefreshCw, 
  AlertTriangle, Anchor, Zap, Scale,
  ChevronsUp
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const TENSION_DATA = Array.from({length: 60}, (_, i) => ({
    time: i,
    rope1: 150 + Math.random() * 2,
    rope2: 151 + Math.random() * 2,
    rope3: 149 + Math.random() * 2,
    rope4: 150 + Math.random() * 2,
}));

export const MineHoistSimView: React.FC = () => {
  // --- STATE ---
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [payload, setPayload] = useState(25); // tons
  const [maxSpeed, setMaxSpeed] = useState(12); // m/s
  const [depth, setDepth] = useState(0); // 0 (Top) to 800 (Bottom)
  
  // Real-time Physics State
  const [physics, setPhysics] = useState({
    velocity: 0,
    acceleration: 0,
    tensionMean: 150, // kN
    brakePressure: 15, // MPa
    motorCurrent: 0, // A
    stage: 'STOP' // ACCEL, CONST, DECEL, CREEP, STOP
  });

  const [tensionHistory, setTensionHistory] = useState(TENSION_DATA);
  const [cycleProgress, setCycleProgress] = useState(0); // 0-1 for S-curve visual

  // --- SIMULATION LOOP ---
  useEffect(() => {
    if (simState !== 'RUNNING') return;

    const interval = setInterval(() => {
        setPhysics(prev => {
            let nextVel = prev.velocity;
            let nextAcc = 0;
            let stage = prev.stage;
            let nextDepth = depth;

            // Simple Cycle Logic:
            // 0-100m: Accel
            // 100-700m: Const
            // 700-800m: Decel
            
            // Assume we are going DOWN (0 -> 800) or UP (800 -> 0)
            // For demo loop: Go Down, Wait, Go Up, Wait
            
            // Let's implement a simple oscillator for demo: 0 -> 800 -> 0
            // Using a time-based phase for smoothness
            const time = Date.now() / 1000;
            const cycleTime = 20; // seconds one way
            const totalCycle = cycleTime * 2;
            const t = time % totalCycle;
            
            let targetV = 0;
            
            // DOWN Phase
            if (t < cycleTime) {
                if (t < 2) { stage = 'ACCEL'; targetV = maxSpeed; }
                else if (t < 18) { stage = 'CONST'; targetV = maxSpeed; }
                else { stage = 'DECEL'; targetV = 0; }
                nextVel = targetV; // Simplified physics
                nextDepth = (t / cycleTime) * 800;
            } 
            // UP Phase
            else {
                const tUp = t - cycleTime;
                if (tUp < 2) { stage = 'ACCEL'; targetV = -maxSpeed; }
                else if (tUp < 18) { stage = 'CONST'; targetV = -maxSpeed; }
                else { stage = 'DECEL'; targetV = 0; }
                nextVel = targetV;
                nextDepth = 800 - (tUp / cycleTime) * 800;
            }

            // Calculate Tension: F = m(g + a)
            // Mass = Cage + Payload + Rope(depth)
            const ropeMass = nextDepth * 10; // kg
            const cageMass = 15000; // kg
            const loadMass = payload * 1000; // kg
            const totalMass = cageMass + loadMass + ropeMass;
            
            // Approx accel
            const acc = (nextVel - prev.velocity) * 10; // dt=0.1s
            const tension = (totalMass * (9.81 + acc)) / 1000 / 4; // kN per rope (4 ropes)
            
            setDepth(nextDepth);
            setCycleProgress((t % cycleTime) / cycleTime);

            return {
                velocity: nextVel,
                acceleration: acc,
                tensionMean: tension,
                brakePressure: Math.abs(nextVel) < 0.1 ? 15 : 0, // Brakes on when stopped
                motorCurrent: Math.abs(nextVel) * 100 + Math.abs(acc) * 500 + payload * 10,
                stage
            };
        });

        // Update Charts
        setTensionHistory(prev => {
            const mean = physics.tensionMean;
            const next = [...prev.slice(1)];
            next.push({
                time: (prev[prev.length-1].time + 1),
                rope1: mean * (1 + (Math.random()-0.5)*0.05), // Imbalance noise
                rope2: mean * (1 + (Math.random()-0.5)*0.05),
                rope3: mean * (1 + (Math.random()-0.5)*0.05),
                rope4: mean * (1 + (Math.random()-0.5)*0.05),
            });
            return next;
        });

    }, 100);
    return () => clearInterval(interval);
  }, [simState, maxSpeed, payload, depth, physics.tensionMean]); // Add deps carefully

  return (
    <div className="h-full w-full relative bg-[#1c1409] text-orange-50 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-hoist-sim" 
            simData={{ 
                depth: depth,
                velocity: physics.velocity,
                tension: [physics.tensionMean, physics.tensionMean, physics.tensionMean, physics.tensionMean]
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Shaft Vignette */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,transparent_20%,transparent_80%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ChevronsUp size={14} /> VERTICAL TRANSPORT SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿用提升机 <span className="text-orange-500">运行与受力仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Cage Velocity</div>
                   <div className={`text-3xl font-mono font-bold ${Math.abs(physics.velocity) > 10 ? 'text-orange-400' : 'text-white'}`}>
                       {physics.velocity.toFixed(1)} <span className="text-sm text-slate-500">m/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Current Depth</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       -{depth.toFixed(0)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Depth & Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Depth Indicator (Vertical Slider Visual) */}
          <div className="flex-1 bg-[#1a0f05]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-2 pointer-events-auto flex relative overflow-hidden">
              <div className="absolute inset-y-4 left-1/2 w-px bg-slate-700"></div>
              {/* Markers */}
              {[0, 200, 400, 600, 800].map(d => (
                  <div key={d} className="absolute left-1/2 text-[9px] text-slate-500 font-mono -translate-x-1/2 ml-4" style={{top: `${(d/800)*100}%`}}>
                      -{d}m
                  </div>
              ))}
              
              {/* Moving Cage Indicator */}
              <div 
                  className="absolute left-1/2 -translate-x-1/2 w-12 h-8 bg-orange-600 rounded border border-orange-400 shadow-[0_0_15px_#f97316] flex items-center justify-center text-xs font-bold text-black transition-all duration-75"
                  style={{ top: `${(depth/800)*90 + 5}%` }} // +5% padding
              >
                  {depth.toFixed(0)}
              </div>
          </div>

          {/* Control Console */}
          <div className="h-64 bg-[#1a0f05]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Settings size={16} className="text-orange-500"/> 运行参数控制
              </h3>
              
              <div className="space-y-4">
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Scale size={12}/> Payload</span>
                          <span className="font-mono text-orange-400">{payload} tons</span>
                      </div>
                      <input 
                        type="range" min="0" max="40" step="1" 
                        value={payload} onChange={(e) => setPayload(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Activity size={12}/> Max Speed</span>
                          <span className="font-mono text-cyan-400">{maxSpeed} m/s</span>
                      </div>
                      <input 
                        type="range" min="5" max="15" step="0.5" 
                        value={maxSpeed} onChange={(e) => setMaxSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                            ${simState === 'RUNNING' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}
                        `}
                      >
                          {simState === 'RUNNING' ? <Pause size={14}/> : <Play size={14}/>}
                          {simState === 'RUNNING' ? 'PAUSE' : 'START CYCLE'}
                      </button>
                      <button 
                        onClick={() => { setSimState('IDLE'); setDepth(0); }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                      >
                          <RefreshCw size={14}/>
                      </button>
                  </div>
              </div>
          </div>

      </div>

      {/* 4. RIGHT PANEL: Forces & Safety */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Tension Chart */}
          <SciFiCard title="钢丝绳张力监测 (4-Rope)" subtitle="kN" className="h-[280px] border-orange-900/50 bg-[#1a0f05]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tensionHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={['auto', 'auto']} stroke="#9a3412" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0500', borderColor: '#f97316'}} />
                          <Line type="monotone" dataKey="rope1" stroke="#f97316" strokeWidth={1} dot={false} isAnimationActive={false} />
                          <Line type="monotone" dataKey="rope2" stroke="#fbbf24" strokeWidth={1} dot={false} isAnimationActive={false} />
                          <Line type="monotone" dataKey="rope3" stroke="#f87171" strokeWidth={1} dot={false} isAnimationActive={false} />
                          <Line type="monotone" dataKey="rope4" stroke="#38bdf8" strokeWidth={1} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Safety Gauges */}
          <SciFiCard title="安全制动系统" subtitle="HYDRAULICS" className="flex-1 border-orange-900/50 bg-[#1a0f05]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center p-2">
                  
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400">Brake Pressure</div>
                          <div className="text-xl font-bold text-white flex items-center justify-center gap-1">
                              <Gauge size={14}/> {physics.brakePressure.toFixed(1)}
                          </div>
                          <div className="text-[9px] text-slate-500">MPa</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400">Motor Current</div>
                          <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                              <Zap size={14}/> {(physics.motorCurrent/10).toFixed(0)}
                          </div>
                          <div className="text-[9px] text-slate-500">Amps</div>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Safety Factor</span>
                          <span className="text-green-400 font-bold">7.2</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full">
                          <div className="bg-green-500 h-full w-[85%]"></div>
                      </div>
                  </div>

                  <div className={`p-3 border-l-4 rounded flex items-start gap-3 mt-auto
                      ${physics.tensionMean > 200 ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/50 border-green-500'}
                  `}>
                      <AlertTriangle className={physics.tensionMean > 200 ? 'text-red-500' : 'text-green-500'} size={20} />
                      <div>
                          <div className="text-xs font-bold text-white">Tension Balance</div>
                          <div className="text-[10px] text-slate-400">
                              {physics.tensionMean > 200 ? 'CRITICAL: High Stress' : 'Status: Optimal (< 5% Dev)'}
                          </div>
                      </div>
                  </div>

              </div>
          </SciFiCard>

      </div>

      {/* 5. BOTTOM HUD: Cycle Graph */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[400px] h-24 bg-black/60 backdrop-blur rounded-lg border border-orange-900/30 p-2 pointer-events-none">
          <div className="text-[9px] text-orange-500 font-bold uppercase mb-1">Velocity Profile (S-Curve)</div>
          <div className="w-full h-full relative">
               {/* Simplified SVG Curve */}
               <svg width="100%" height="100%" viewBox="0 0 100 50" className="opacity-80">
                   <path d="M0,50 C20,50 20,10 40,10 L60,10 C80,10 80,50 100,50" fill="none" stroke="#f97316" strokeWidth="2" />
                   <circle cx={cycleProgress * 100} cy={cycleProgress < 0.2 ? 50 - (cycleProgress/0.2)*40 : cycleProgress > 0.8 ? 10 + ((cycleProgress-0.8)/0.2)*40 : 10} r="3" fill="white" />
               </svg>
          </div>
      </div>

    </div>
  );
};
