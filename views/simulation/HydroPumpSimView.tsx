
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-pump]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-pump';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Zap, Settings, ArrowRight, 
  Droplets, Gauge, TrendingUp, BarChart2,
  Play, RotateCcw, Sliders, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter, Legend
} from 'recharts';

// --- MOCK DATA ---

// Pump Characteristic Curve (Q-H)
// H = H0 - A*Q^2
const PUMP_CURVE_DATA = Array.from({length: 50}, (_, i) => {
    const q = i * 200; // m3/h
    // Single Pump H-Q
    const h1 = 80 - 0.000005 * q * q; 
    // 2 Pumps Parallel H-Q (Flow adds up for same head -> Q_total = 2*Q_single at H)
    // Inverse: H is same, Q is doubled.
    // So for a given Q_total, Q_single = Q_total/2.
    // H = 80 - 0.000005 * (q/2)^2
    const h2 = 80 - 0.000005 * Math.pow(q/2, 2);
    const h3 = 80 - 0.000005 * Math.pow(q/3, 2);
    const h4 = 80 - 0.000005 * Math.pow(q/4, 2);
    
    // System Resistance Curve: H_sys = H_static + k*Q^2
    const h_sys = 30 + 0.000008 * q * q;

    return { q, h1: Math.max(0, h1), h2: Math.max(0, h2), h3: Math.max(0, h3), h4: Math.max(0, h4), sys: h_sys };
});

export const HydroPumpSimView: React.FC = () => {
  // --- STATE ---
  const [targetFlow, setTargetFlow] = useState(6000); // m3/h
  const [staticHead, setStaticHead] = useState(30); // m
  const [elecPrice, setElecPrice] = useState(0.8); // RMB/kWh
  const [controlMode, setControlMode] = useState<'MANUAL' | 'AUTO_OPT'>('MANUAL');
  
  // Pump States
  const [pumps, setPumps] = useState([
      { id: 1, on: true, speed: 100, eff: 85, flow: 2000, power: 250 },
      { id: 2, on: true, speed: 100, eff: 84, flow: 2000, power: 255 },
      { id: 3, on: false, speed: 0, eff: 0, flow: 0, power: 0 },
      { id: 4, on: false, speed: 0, eff: 0, flow: 0, power: 0 },
  ]);

  const [metrics, setMetrics] = useState({
      totalFlow: 4000,
      totalPower: 505,
      specificEnergy: 0.126, // kWh/m3
      hourlyCost: 404,
      sysEfficiency: 82.5
  });

  // Simulation Loop
  useEffect(() => {
      const interval = setInterval(() => {
          // 1. Determine active configuration
          let activeCount = 0;
          if (controlMode === 'AUTO_OPT') {
              // Simple heuristic: 1 pump per ~2500 m3/h capacity for optimal eff
              const optimalPumps = Math.ceil(targetFlow / 2500);
              activeCount = Math.max(1, Math.min(4, optimalPumps));
          } else {
              activeCount = pumps.filter(p => p.on).length;
              if (activeCount === 0) activeCount = 1; // Minimum 1 for calculation stability
          }

          // 2. Solve Operation Point
          // Intersection of System Curve (H = H_stat + k*Q^2) and Pump Curve (H = H0 - A*(Q/n)^2)
          // H_stat + k*Q^2 = H0 - A*(Q/n)^2
          // Q^2 * (k + A/n^2) = H0 - H_stat
          // Q = sqrt( (H0 - H_stat) / (k + A/n^2) )
          
          const H0 = 80;
          const A = 0.000005;
          const k = 0.000008; // Pipeline resistance coeff
          
          const Q_total = Math.sqrt(Math.max(0, H0 - staticHead) / (k + A/(activeCount*activeCount)));
          const H_op = staticHead + k * Q_total * Q_total;
          
          const Q_per_pump = Q_total / activeCount;
          
          // Efficiency approx parabola peaking at Q=2000
          const calcEff = (q: number) => Math.max(50, 88 - 0.000005 * Math.pow(q - 2200, 2));
          
          const newPumps = pumps.map((p, i) => {
              const isOn = controlMode === 'AUTO_OPT' ? i < activeCount : p.on;
              if (!isOn) return { ...p, on: false, flow: 0, power: 0, eff: 0, speed: 0 };
              
              const eff = calcEff(Q_per_pump);
              // Power (kW) = (rho * g * Q * H) / (3600 * eff)  [Q in m3/h]
              const power = (1000 * 9.81 * Q_per_pump * H_op) / (3600 * 1000 * (eff/100));
              
              return { ...p, on: true, flow: Q_per_pump, power, eff, speed: 100 };
          });

          if (controlMode === 'AUTO_OPT') setPumps(newPumps);

          // Metrics
          const totFlow = newPumps.reduce((a,b)=>a+b.flow, 0);
          const totPower = newPumps.reduce((a,b)=>a+b.power, 0);
          
          setMetrics({
              totalFlow: totFlow,
              totalPower: totPower,
              specificEnergy: totFlow > 0 ? totPower / totFlow : 0,
              hourlyCost: totPower * elecPrice,
              sysEfficiency: newPumps.filter(p=>p.on).reduce((a,b)=>a+b.eff,0) / activeCount || 0
          });

      }, 500);

      return () => clearInterval(interval);
  }, [targetFlow, staticHead, controlMode, elecPrice, pumps]); // Note: pumps dep triggers loop in Manual mode, handled by condition

  // Manual Toggle
  const togglePump = (idx: number) => {
      if (controlMode === 'AUTO_OPT') return;
      const newPumps = [...pumps];
      newPumps[idx].on = !newPumps[idx].on;
      setPumps(newPumps);
  };

  return (
    <div className="h-full w-full relative bg-[#0b1319] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-pump" 
            simData={{ 
                pumps: pumps.map(p => p.on),
                flows: pumps.map(p => p.flow),
                efficiency: pumps.map(p => p.eff)
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0b1319_100%)] pointer-events-none"></div>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f2231]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Zap size={14} /> ENERGY OPTIMIZATION
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 泵站运行工况 <span className="text-cyan-500">& 能耗优化仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Specific Energy</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.specificEnergy.toFixed(3)} <span className="text-sm text-slate-500">kWh/m³</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Total Flow</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.totalFlow.toFixed(0)} <span className="text-sm text-slate-500">m³/h</span>
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0e1a24]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 运行策略控制
              </h3>
              
              <div className="space-y-6">
                  {/* Mode */}
                  <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700">
                      <button 
                        onClick={() => setControlMode('MANUAL')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded ${controlMode === 'MANUAL' ? 'bg-cyan-700 text-white' : 'text-slate-400'}`}
                      >
                          MANUAL
                      </button>
                      <button 
                        onClick={() => setControlMode('AUTO_OPT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded ${controlMode === 'AUTO_OPT' ? 'bg-green-700 text-white' : 'text-slate-400'}`}
                      >
                          AI OPTIMIZE
                      </button>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Target Flow (Q)</span>
                          <span className="font-mono text-cyan-400">{targetFlow} m³/h</span>
                      </div>
                      <input 
                        type="range" min="2000" max="10000" step="100" 
                        value={targetFlow} onChange={(e) => setTargetFlow(parseFloat(e.target.value))}
                        disabled={controlMode === 'MANUAL'}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                      />
                  </div>

                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Static Head (H)</span>
                          <span className="font-mono text-white">{staticHead} m</span>
                      </div>
                      <input 
                        type="range" min="10" max="50" step="1" 
                        value={staticHead} onChange={(e) => setStaticHead(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Pump Manual Toggles */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                      {pumps.map((p, i) => (
                          <button 
                            key={p.id}
                            disabled={controlMode === 'AUTO_OPT'}
                            onClick={() => togglePump(i)}
                            className={`flex flex-col items-center justify-center p-2 rounded border transition-all
                                ${p.on 
                                    ? (p.eff > 80 ? 'bg-green-900/40 border-green-500' : 'bg-yellow-900/40 border-yellow-500')
                                    : 'bg-slate-800 border-slate-700 opacity-50'}
                            `}
                          >
                              <Activity size={16} className={p.on ? (p.eff>80?'text-green-400':'text-yellow-400') : 'text-slate-500'} />
                              <span className="text-[10px] mt-1 font-bold">P-{p.id}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <SciFiCard title="机组工况列表" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50 bg-[#0e1a24]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 p-1 overflow-y-auto custom-scrollbar">
                  {pumps.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-900/50 border border-slate-800 rounded">
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Pump #{p.id}</span>
                              <span className="text-[9px] text-slate-400">{p.on ? 'RUNNING' : 'STOPPED'}</span>
                          </div>
                          <div className="text-right flex flex-col">
                              <span className="text-xs font-mono text-cyan-300">{p.flow.toFixed(0)} m³/h</span>
                              <span className={`text-[9px] font-bold ${p.eff > 80 ? 'text-green-400' : 'text-yellow-500'}`}>
                                  η: {p.eff.toFixed(1)}%
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analysis Charts */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Q-H Curve */}
          <SciFiCard title="水泵特性曲线 (Q-H Curve)" subtitle="OP POINT" className="h-[300px] border-cyan-900/50 bg-[#0e1a24]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={PUMP_CURVE_DATA} margin={{top:10, right:10, left:0, bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="q" stroke="#64748b" tick={{fontSize: 10}} type="number" domain={[0, 10000]} label={{ value: 'Q (m³/h)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'H (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                          
                          <Line dataKey="sys" stroke="#ffffff" strokeDasharray="5 5" name="System" dot={false} strokeWidth={2} />
                          <Line dataKey="h1" stroke="#3b82f6" dot={false} name="1 Pump" strokeWidth={1} />
                          <Line dataKey="h2" stroke="#6366f1" dot={false} name="2 Pumps" strokeWidth={1} />
                          <Line dataKey="h3" stroke="#8b5cf6" dot={false} name="3 Pumps" strokeWidth={1} />
                          <Line dataKey="h4" stroke="#d946ef" dot={false} name="4 Pumps" strokeWidth={1} />

                          {/* Operating Point */}
                          <Scatter data={[{q: metrics.totalFlow, h: staticHead + 0.000008 * Math.pow(metrics.totalFlow, 2)}]} fill="#facc15" shape="cross" r={6} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Energy Cost Analysis */}
          <SciFiCard title="能耗成本分析" subtitle="ECONOMICS" className="flex-1 border-cyan-900/50 bg-[#0e1a24]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full p-2">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-3">
                          <DollarSign size={20} className="text-yellow-400"/>
                          <div>
                              <div className="text-xs text-slate-400">Hourly Cost</div>
                              <div className="text-lg font-bold text-white">¥ {metrics.hourlyCost.toFixed(0)}</div>
                          </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                          Rate: {elecPrice} ¥/kWh
                      </div>
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>Total Power Load</span>
                          <span className="font-mono text-cyan-300">{metrics.totalPower.toFixed(0)} kW</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full transition-all duration-300" style={{width: `${(metrics.totalPower / 1200) * 100}%`}}></div>
                      </div>
                  </div>
                  
                  <div className="mt-auto p-2 border-l-4 border-green-500 bg-green-900/20 rounded text-xs text-green-200">
                      <strong>Optimization:</strong> {controlMode === 'AUTO_OPT' ? 'AI active. Operating at peak efficiency point.' : 'Manual mode. Efficiency could be improved by 5%.'}
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
