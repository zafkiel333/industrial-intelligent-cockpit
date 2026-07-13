
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-group]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-group';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Settings, Layout, ArrowRightLeft, 
  Activity, Zap, AlertTriangle, Database,
  TrendingDown, TrendingUp, Maximize2, Minimize2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';

// --- MOCK DATA ---
const GATES_CONFIG = [
  { id: 0, name: 'Gate 1 (L)', cap: 200 },
  { id: 1, name: 'Gate 2', cap: 250 },
  { id: 2, name: 'Gate 3 (C)', cap: 300 }, // Main
  { id: 3, name: 'Gate 4', cap: 250 },
  { id: 4, name: 'Gate 5 (R)', cap: 200 },
];

const DISPATCH_HISTORY = Array.from({length: 30}, (_, i) => ({
    time: i,
    upLevel: 14.5 + Math.sin(i*0.1)*0.2,
    downLevel: 4.2 + Math.sin(i*0.1)*0.5,
    discharge: 800 + Math.sin(i*0.2)*200
}));

export const HydroGroupDispatchSimView: React.FC = () => {
  // --- STATE ---
  const [gateOpenings, setGateOpenings] = useState([0, 0, 0, 0, 0]); // %
  const [controlMode, setControlMode] = useState<'MANUAL' | 'AUTO_LEVEL' | 'AUTO_FLOW'>('MANUAL');
  const [targetLevel, setTargetLevel] = useState(14.5); // m
  const [inflow, setInflow] = useState(1000); // m3/s

  const [metrics, setMetrics] = useState({
    totalDischarge: 0, // m3/s
    upLevel: 14.5,
    downLevel: 4.2,
    headDiff: 10.3,
    efficiency: 95
  });

  const [history, setHistory] = useState(DISPATCH_HISTORY);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // 1. Calculate Discharge
        let totalQ = 0;
        gateOpenings.forEach((open, i) => {
            // Q = C * A * sqrt(2gh)
            // A ~ Open% * MaxArea
            // H = Up - Down? Or just Up - Sill. Assume Sill at 0.
            const h = metrics.upLevel; 
            const q = (open / 100) * GATES_CONFIG[i].cap * Math.sqrt(h / 10);
            totalQ += q;
        });

        // 2. Water Level Physics (Mass Balance)
        // dH/dt = (In - Out) / Area
        const area = 5000; // Virtual surface area
        const netFlow = inflow - totalQ;
        const dH = (netFlow / area); 
        
        let newUp = metrics.upLevel + dH;
        // Clamp
        newUp = Math.max(5, Math.min(18, newUp));

        // Downstream level (Rating curve)
        const newDown = 3.0 + (totalQ / 2000) * 2;

        // 3. Auto Control Logic
        if (controlMode === 'AUTO_LEVEL') {
            const error = newUp - targetLevel;
            // Simple P-controller to adjust gates
            // If level too high, open gates.
            const adjustment = error * 5; // Gain
            setGateOpenings(prev => prev.map(g => Math.max(0, Math.min(100, g + adjustment))));
        }

        setMetrics({
            totalDischarge: totalQ,
            upLevel: newUp,
            downLevel: newDown,
            headDiff: newUp - newDown,
            efficiency: 90 + Math.random() * 5 // Mock
        });

        // History
        setHistory(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: prev[prev.length-1].time + 1,
                upLevel: newUp,
                downLevel: newDown,
                discharge: totalQ
            });
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [gateOpenings, inflow, controlMode, targetLevel, metrics.upLevel]);

  const updateGate = (idx: number, val: number) => {
      if (controlMode !== 'MANUAL') return;
      const newG = [...gateOpenings];
      newG[idx] = val;
      setGateOpenings(newG);
  };

  const syncGates = (val: number) => {
      if (controlMode !== 'MANUAL') return;
      setGateOpenings([val, val, val, val, val]);
  };

  return (
    <div className="h-full w-full relative bg-[#0b0f19] text-blue-50 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-group" 
            simData={{ 
                gateOpenings,
                upLevel: metrics.upLevel - 10, // Map 10-18m to 0-8 visual Y
                downLevel: metrics.downLevel - 4 // Map 4-8m to 0-4 visual Y
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0f19_95%)] pointer-events-none"></div>
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* 2. TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Layout size={14} /> MULTI-GATE DISPATCH
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水闸群 <span className="text-cyan-500">联合调度与水位协同</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Total Discharge</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.totalDischarge.toFixed(0)} <span className="text-sm text-slate-500">m³/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Head Difference</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.headDiff.toFixed(2)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
          </div>
      </div>

      {/* 3. LEFT PANEL: Charts */}
      <div className="absolute left-6 top-32 bottom-36 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="水位协同曲线" subtitle="UP/DOWN" className="h-[250px] border-cyan-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                          <defs>
                              <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 20]} hide />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                          <Area type="monotone" dataKey="upLevel" stroke="#0ea5e9" fill="url(#gradUp)" strokeWidth={2} name="Upstream" />
                          <Line type="monotone" dataKey="downLevel" stroke="#facc15" strokeWidth={2} dot={false} name="Downstream" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="各孔流量分配" subtitle="DISTRIBUTION" className="flex-1 border-cyan-900/50 bg-[#0f172a]/90 pointer-events-auto">
               <div className="w-full h-full p-2 flex flex-col justify-center">
                   {GATES_CONFIG.map((gate, i) => {
                       const q = (gateOpenings[i] / 100) * gate.cap * Math.sqrt(metrics.upLevel/10);
                       return (
                           <div key={i} className="mb-3 last:mb-0">
                               <div className="flex justify-between text-xs text-slate-300 mb-1">
                                   <span>{gate.name}</span>
                                   <span className="font-mono text-cyan-300">{q.toFixed(0)} m³/s</span>
                               </div>
                               <div className="flex items-center gap-2">
                                   <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-blue-500" style={{width: `${gateOpenings[i]}%`}}></div>
                                   </div>
                                   <span className="text-[9px] w-8 text-right text-slate-500">{gateOpenings[i].toFixed(0)}%</span>
                               </div>
                           </div>
                       );
                   })}
               </div>
          </SciFiCard>

      </div>

      {/* 4. BOTTOM DOCK: Gate Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#0f172a] border-t border-cyan-900/50 z-20 px-8 flex items-center justify-between pointer-events-auto">
          
          {/* Mode Select */}
          <div className="flex flex-col gap-2 w-48 border-r border-slate-700 pr-6">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Control Strategy</div>
              <div className="flex bg-slate-900 rounded p-1">
                  <button 
                    onClick={() => setControlMode('MANUAL')}
                    className={`flex-1 py-1 text-[10px] rounded ${controlMode === 'MANUAL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      MAN
                  </button>
                  <button 
                    onClick={() => setControlMode('AUTO_LEVEL')}
                    className={`flex-1 py-1 text-[10px] rounded ${controlMode === 'AUTO_LEVEL' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      AUTO
                  </button>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-400">Target Level</span>
                  <input 
                     type="number" value={targetLevel} 
                     onChange={(e) => setTargetLevel(parseFloat(e.target.value))}
                     className="w-12 bg-slate-800 border border-slate-600 rounded text-center text-white"
                     disabled={controlMode === 'MANUAL'}
                  />
              </div>
          </div>

          {/* Gate Sliders */}
          <div className="flex-1 flex justify-center gap-8 px-8">
              {GATES_CONFIG.map((gate, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                      <div className="relative h-20 w-8 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                          <div 
                             className="absolute bottom-0 w-full bg-cyan-500 transition-all duration-200 group-hover:bg-cyan-400"
                             style={{height: `${gateOpenings[i]}%`}}
                          ></div>
                          {/* Invisible Slider Input covering the bar */}
                          <input 
                             type="range" min="0" max="100" step="1"
                             value={gateOpenings[i]}
                             onChange={(e) => updateGate(i, parseFloat(e.target.value))}
                             orient="vertical"
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             disabled={controlMode !== 'MANUAL'}
                             style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
                          />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">{gate.id+1}#</span>
                      <span className="text-[10px] font-mono text-cyan-400">{gateOpenings[i].toFixed(0)}%</span>
                  </div>
              ))}
          </div>

          {/* Master Control */}
          <div className="w-48 border-l border-slate-700 pl-6 flex flex-col gap-3">
               <div className="text-[10px] text-slate-500 uppercase font-bold">Master Control</div>
               <input 
                  type="range" min="0" max="100" 
                  onChange={(e) => syncGates(parseFloat(e.target.value))}
                  disabled={controlMode !== 'MANUAL'}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
               <button className="w-full py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500 text-red-300 text-xs rounded flex items-center justify-center gap-2">
                   <AlertTriangle size={12} /> EMERGENCY CLOSE
               </button>
          </div>

      </div>

    </div>
  );
};
