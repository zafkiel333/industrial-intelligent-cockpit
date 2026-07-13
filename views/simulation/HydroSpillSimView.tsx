
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-spill]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-spill';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Settings, Activity, Zap, 
  AlertTriangle, Gauge, TrendingUp, 
  Wind, Droplets, Target, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const DISCHARGE_CURVE = Array.from({length: 20}, (_, i) => {
    const opening = i * 5; // %
    const q = 0.7 * 10 * 10 * Math.pow(2 * 9.81 * 10, 0.5) * (opening/100);
    return { open: opening, q: q };
});

const PRESSURE_PROFILE = Array.from({length: 20}, (_, i) => ({
    dist: i * 2, // m along chute
    pressure: 100 - i * 5 + Math.random() * 5, // kPa
    cavitationLimit: 20 // kPa vapor pressure
}));

export const HydroSpillSimView: React.FC = () => {
  // State
  const [gateOpening, setGateOpening] = useState(0); // 0-100%
  const [reservoirLevel, setReservoirLevel] = useState(150); // m
  const [isAerationOn, setIsAerationOn] = useState(true);

  const [metrics, setMetrics] = useState({
    dischargeQ: 0, // m3/s
    velocityMax: 0, // m/s
    energyDissipated: 0, // %
    cavitationRisk: 'LOW',
    froudeNo: 0
  });

  // Physics Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Q = C * L * H^1.5 approx for weir, or orifice for gate
        // Simplify: Q proportional to Gate * sqrt(Head)
        const head = reservoirLevel - 100; // Crest at 100
        const q = (gateOpening / 100) * 500 * Math.sqrt(head / 50);
        
        // Velocity V = Q / A. A ~ GateOpening
        const v = gateOpening > 0 ? (q / (10 * (gateOpening/100 * 5))) : 0; // Width 10, Height 5
        const vMax = Math.sqrt(2 * 9.81 * head); // Theoretical max at toe

        // Froude Fr = V / sqrt(g*d)
        const depth = gateOpening > 0 ? (q / (10 * v)) : 0;
        const fr = depth > 0 ? v / Math.sqrt(9.81 * depth) : 0;

        // Energy Dissipation (Ski jump)
        const eff = fr > 4 ? 60 + Math.random()*5 : 20 + Math.random()*5;

        // Cavitation Risk: High V + Low Pressure
        let risk = 'LOW';
        if (vMax > 30 && !isAerationOn) risk = 'HIGH';
        else if (vMax > 25) risk = 'MED';

        setMetrics({
            dischargeQ: q,
            velocityMax: vMax,
            energyDissipated: eff,
            cavitationRisk: risk,
            froudeNo: fr
        });

    }, 200);
    return () => clearInterval(interval);
  }, [gateOpening, reservoirLevel, isAerationOn]);

  return (
    <div className="h-full w-full relative bg-[#02040a] text-blue-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-spill" 
            simData={{ 
                gateOpen: gateOpening,
                head: reservoirLevel - 100,
                cavitationRisk: metrics.cavitationRisk === 'HIGH'
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#02040a_100%)] pointer-events-none"></div>
          {/* Velocity Streaks Overlay */}
          {gateOpening > 0 && (
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 animate-pulse pointer-events-none"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Waves size={14} /> HYDRAULIC LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 溢洪道泄流 <span className="text-cyan-500">& 消能工水力仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Discharge (Q)</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.dischargeQ.toFixed(0)} <span className="text-sm text-slate-500">m³/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Max Velocity</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.velocityMax.toFixed(1)} <span className="text-sm text-slate-500">m/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Froude No.</div>
                   <div className="text-3xl font-mono font-bold text-orange-400">
                       {metrics.froudeNo.toFixed(2)}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1120]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings size={16} className="text-blue-400"/> 闸门与水位控制
              </h3>
              
              <div className="space-y-6">
                  {/* Gate Opening */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Gate Opening (e)</span>
                          <span className="font-mono text-cyan-300">{gateOpening}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1" 
                        value={gateOpening} 
                        onChange={(e) => setGateOpening(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Reservoir Level */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Reservoir Level (Z)</span>
                          <span className="font-mono text-blue-300">{reservoirLevel.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="130" max="160" step="0.5" 
                        value={reservoirLevel} 
                        onChange={(e) => setReservoirLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Aeration Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Wind size={16} className="text-white"/>
                          <span>Aeration Ramp (Cavitation Protection)</span>
                      </div>
                      <button 
                         onClick={() => setIsAerationOn(!isAerationOn)}
                         className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isAerationOn ? 'bg-green-600' : 'bg-slate-600'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isAerationOn ? 'translate-x-5' : ''}`}></div>
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="流量特性曲线 (Q-e)" subtitle="RATING" className="flex-1 border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={DISCHARGE_CURVE}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="open" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Opening %', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6', color: '#fff'}} />
                          <Line type="monotone" dataKey="q" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          <ReferenceLine x={gateOpening} stroke="#f59e0b" strokeDasharray="3 3" />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Pressure Profile */}
          <SciFiCard title="泄槽底板压力分布" subtitle="CAVITATION CHECK" className="h-[280px] border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PRESSURE_PROFILE}>
                          <defs>
                              <linearGradient id="gradPress" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dist (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} width={30} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                          <ReferenceLine y={20} stroke="red" strokeDasharray="3 3" label={{value:'Vapor P', fill:'red', fontSize:10}} />
                          <Area type="monotone" dataKey="pressure" stroke="#8b5cf6" fill="url(#gradPress)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Energy Dissipation */}
          <div className="flex-1 bg-[#0b1120]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Zap size={16} className="text-yellow-400"/> 消能效果评估
              </h3>
              
              <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" 
                                  strokeDasharray="283" strokeDashoffset={283 - (283 * metrics.energyDissipated / 100)} 
                                  className="transition-all duration-1000 -rotate-90 origin-center" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">{metrics.energyDissipated.toFixed(0)}%</span>
                          <span className="text-[9px] text-slate-400">Energy Loss</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <AlertTriangle size={14} className={metrics.cavitationRisk === 'HIGH' ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                          Cavitation Risk
                      </div>
                      <span className={`text-xs font-bold ${metrics.cavitationRisk === 'HIGH' ? 'text-red-500' : 'text-green-400'}`}>
                          {metrics.cavitationRisk}
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Target size={14} className="text-cyan-400" />
                          Impact Zone
                      </div>
                      <span className="text-xs font-mono text-white">Safe (85m)</span>
                  </div>
              </div>
          </div>

      </div>

      {/* CENTER HUD: Velocity Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-blue-500/30 flex gap-6 text-[10px] text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2">
              <Gauge size={12} className="text-cyan-400"/>
              <span>Crest V: <span className="text-white font-bold">4.2 m/s</span></span>
          </div>
          <div className="w-px h-3 bg-slate-600"></div>
          <div className="flex items-center gap-2">
              <Gauge size={12} className="text-orange-400"/>
              <span>Toe V: <span className="text-white font-bold">{metrics.velocityMax.toFixed(1)} m/s</span></span>
          </div>
      </div>

    </div>
  );
};
