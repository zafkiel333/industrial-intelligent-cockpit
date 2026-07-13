
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-crash]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-crash';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertTriangle, Play, RotateCcw, 
  Activity, Zap, ShieldAlert, Truck, Scale, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line
} from 'recharts';

// --- DATA ---
const G_FORCE_TEMPLATE = Array.from({length: 50}, (_, i) => ({
    time: i * 0.02, // 20ms steps
    g: 0
}));

export const MineCrashSimView: React.FC = () => {
  // State
  const [trigger, setTrigger] = useState(false);
  const [reset, setReset] = useState(false);
  
  // Params
  const [velocity, setVelocity] = useState(40); // km/h
  const [mass, setMass] = useState(150); // tons
  
  // Metrics
  const [peakG, setPeakG] = useState(0);
  const [energyAbsorbed, setEnergyAbsorbed] = useState(0); // MJ
  const [impactForce, setImpactForce] = useState(0); // kN
  const [status, setStatus] = useState<'READY' | 'CRASHED'>('READY');
  
  const [graphData, setGraphData] = useState(G_FORCE_TEMPLATE);

  // Handlers
  const handleLaunch = () => {
      if (status === 'CRASHED') return;
      
      setTrigger(true);
      setReset(false);
      setStatus('CRASHED');

      // Physics Calc
      // E = 0.5 * m * v^2
      // v in m/s
      const v_ms = velocity / 3.6;
      const mass_kg = mass * 1000;
      const energy = 0.5 * mass_kg * v_ms * v_ms; // Joules
      const energyMJ = energy / 1000000;
      
      // Impact Force (Impulse approx: F * dt = m * dv)
      // Assume impact duration 0.2s
      const dt = 0.2;
      const force = (mass_kg * v_ms) / dt; // Newtons
      const forceKN = force / 1000;
      
      // G-Force = Decel / g
      const decel = v_ms / dt;
      const g = decel / 9.81;

      setEnergyAbsorbed(energyMJ);
      setImpactForce(forceKN);
      setPeakG(g);

      // Generate Graph
      const newGraph = G_FORCE_TEMPLATE.map(pt => {
          // Peak at t=0.5s approx (25th point)
          // Ricker wavelet shape
          const t = pt.time;
          const peakTime = 0.5;
          const width = 0.05;
          const val = g * Math.exp(-Math.pow(t - peakTime, 2) / (2 * width * width));
          return { ...pt, g: val };
      });
      setGraphData(newGraph);
  };

  const handleReset = () => {
      setTrigger(false);
      setReset(true);
      setStatus('READY');
      setPeakG(0);
      setEnergyAbsorbed(0);
      setImpactForce(0);
      setGraphData(G_FORCE_TEMPLATE);
  };

  return (
    <div className="h-full w-full relative bg-[#0a0505] text-orange-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-crash" 
            simData={{ 
                trigger,
                reset,
                speed: velocity,
                mass
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0a0505_100%)] pointer-events-none"></div>
          {/* Grid Floor Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#2a0a0a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <AlertTriangle size={14} /> IMPACT LABORATORY
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿车碰撞 <span className="text-red-500">& 防撞缓冲结构仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Kinetic Energy</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {energyAbsorbed.toFixed(2)} <span className="text-sm text-slate-500">MJ</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Peak G-Force</div>
                   <div className={`text-3xl font-mono font-bold ${peakG > 5 ? 'text-red-500' : 'text-orange-400'}`}>
                       {peakG.toFixed(1)} <span className="text-sm text-slate-500">g</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Configuration */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#1a0a0a]/90 backdrop-blur-md border border-orange-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-orange-900/30 pb-2">
                  <Settings size={16} className="text-orange-500"/> 碰撞测试参数
              </h3>
              
              <div className="space-y-6">
                  {/* Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Activity size={12}/> Impact Velocity</span>
                          <span className="font-mono text-orange-400">{velocity} km/h</span>
                      </div>
                      <input 
                        type="range" min="10" max="60" step="5" 
                        value={velocity} onChange={(e) => setVelocity(parseFloat(e.target.value))}
                        disabled={status === 'CRASHED'}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-50"
                      />
                  </div>

                  {/* Mass */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Scale size={12}/> Truck Mass</span>
                          <span className="font-mono text-white">{mass} tons</span>
                      </div>
                      <input 
                        type="range" min="50" max="300" step="10" 
                        value={mass} onChange={(e) => setMass(parseFloat(e.target.value))}
                        disabled={status === 'CRASHED'}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 disabled:opacity-50"
                      />
                  </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                  {status === 'READY' ? (
                      <button 
                        onClick={handleLaunch}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                          <Play size={16} fill="currentColor"/> LAUNCH TEST
                      </button>
                  ) : (
                      <button 
                        onClick={handleReset}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded flex items-center justify-center gap-2"
                      >
                          <RotateCcw size={16}/> RESET SCENARIO
                      </button>
                  )}
              </div>
          </div>

          <SciFiCard title="车辆结构完整性" subtitle="STATUS" className="flex-1 border-orange-900/50 bg-[#1a0a0a]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 p-2 h-full justify-center">
                  <div className="flex items-center justify-between p-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400">Frame Deformation</span>
                      <span className={`font-bold ${peakG > 8 ? 'text-red-500' : 'text-green-400'}`}>
                          {status === 'CRASHED' ? (peakG > 8 ? 'CRITICAL' : 'MINOR') : '--'}
                      </span>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400">Cabin Safety Space</span>
                      <span className="font-bold text-white">
                          {status === 'CRASHED' ? '98%' : '100%'}
                      </span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                      <span className="text-xs text-slate-400">Buffer Stroke Used</span>
                      <span className="font-bold text-orange-400">
                          {status === 'CRASHED' ? '85%' : '0%'}
                      </span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* G-Force Graph */}
          <SciFiCard title="冲击加速度波形 (G-Force)" subtitle="1.0s WINDOW" className="h-[280px] border-orange-900/50 bg-[#1a0a0a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData}>
                          <defs>
                              <linearGradient id="gradG" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'g', angle: -90, position: 'insideLeft' }} />
                          <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#ef4444'}} />
                          <ReferenceLine y={5} stroke="yellow" strokeDasharray="3 3" label="Human Limit" />
                          <Area type="monotone" dataKey="g" stroke="#ef4444" fill="url(#gradG)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Energy Breakdown */}
          <SciFiCard title="能量吸收分布" subtitle="ABSORPTION" className="flex-1 border-orange-900/50 bg-[#1a0a0a]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center p-2">
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Hydraulic Buffer</span>
                          <span className="font-bold text-orange-400">65%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{width: '65%'}}></div>
                      </div>
                  </div>
                  
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Frame Deformation</span>
                          <span className="font-bold text-red-400">25%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{width: '25%'}}></div>
                      </div>
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Friction / Heat</span>
                          <span className="font-bold text-blue-400">10%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: '10%'}}></div>
                      </div>
                  </div>

                  <div className="mt-4 p-3 border border-red-900/50 bg-red-950/30 rounded text-xs text-red-200">
                      <div className="flex items-center gap-2 font-bold mb-1">
                          <ShieldAlert size={14}/> Assessment
                      </div>
                      {peakG > 8 ? 'STRUCTURAL FAILURE LIKELY. REDESIGN BUFFER.' : 'PASS. OCCUPANT SAFETY WITHIN LIMITS.'}
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
