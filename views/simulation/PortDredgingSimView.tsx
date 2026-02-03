
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Anchor, Hammer, Compass, Settings, 
  Play, Pause, RotateCcw, Activity, 
  Layers, Gauge, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

// --- MOCK DATA ---

const PRODUCTION_DATA = Array.from({length: 60}, (_, i) => ({
    time: i,
    rate: 0 // Will populate
}));

const SOIL_PROFILE = [
  { name: 'Silt', width: 200, depth: -12 },
  { name: 'Sand', width: 150, depth: -15 },
  { name: 'Clay', width: 100, depth: -18 },
  { name: 'Rock', width: 50, depth: -20 },
];

export const PortDredgingSimView: React.FC = () => {
  // --- STATE ---
  const [isRunning, setIsRunning] = useState(true);
  const [swingAngle, setSwingAngle] = useState(0); // degrees -40 to 40
  const [depth, setDepth] = useState(12.0); // m
  const [cutterSpeed, setCutterSpeed] = useState(30); // rpm
  const [soilType, setSoilType] = useState<'SAND' | 'CLAY' | 'ROCK'>('SAND');
  
  const [metrics, setMetrics] = useState({
    production: 3500, // m3/h
    swingSpeed: 0.5, // deg/s
    concentration: 25, // %
    efficiency: 88.5 // %
  });

  const [graphData, setGraphData] = useState(PRODUCTION_DATA);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // Swing Animation Logic (Auto Oscillation)
        setSwingAngle(prev => {
             const time = Date.now() / 2000;
             return Math.sin(time) * 35; // +/- 35 deg
        });

        // Physics Logic
        // Production ~ Cutter Speed * Swing Speed * Soil Factor
        const soilFactor = soilType === 'SAND' ? 1.0 : soilType === 'CLAY' ? 0.8 : 0.4;
        const baseRate = (cutterSpeed / 30) * 4000;
        const currentProd = baseRate * soilFactor * (0.8 + Math.random()*0.4);

        setMetrics({
            production: currentProd,
            swingSpeed: Math.abs(Math.cos(Date.now()/2000) * 1.5), // deriv of sin
            concentration: 20 + currentProd / 200,
            efficiency: 80 + (currentProd > 3000 ? 10 : 0)
        });

        // Chart Update
        setGraphData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: prev[prev.length-1].time + 1,
                rate: currentProd
            });
            return next;
        });

    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, soilType, cutterSpeed]);

  const handleReset = () => {
      setDepth(12);
      setCutterSpeed(30);
      setSoilType('SAND');
      setGraphData(PRODUCTION_DATA);
  };

  return (
    <div className="h-full w-full relative bg-[#0f172a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-dredging" 
            simData={{ 
                swingAngle,
                depth,
                cutterOn: isRunning,
                production: metrics.production
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0f172a_100%)] pointer-events-none"></div>
          {/* Mud Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Hammer size={14} /> DREDGING OPERATIONS
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 航道疏浚 <span className="text-yellow-500">施工船舶布置与效率仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Production Rate</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.production.toFixed(0)} <span className="text-sm text-slate-500">m³/h</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Current Depth</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       -{depth.toFixed(1)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1426]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 施工参数设定
              </h3>
              
              <div className="space-y-6">
                  {/* Depth */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><ArrowRight size={12} className="rotate-90"/> Dredging Depth</span>
                          <span className="font-mono text-cyan-300">{depth.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="5" max="25" step="0.5" 
                        value={depth} onChange={(e) => setDepth(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Cutter Speed */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Activity size={12}/> Cutter RPM</span>
                          <span className="font-mono text-orange-400">{cutterSpeed}</span>
                      </div>
                      <input 
                        type="range" min="0" max="60" step="5" 
                        value={cutterSpeed} onChange={(e) => setCutterSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>

                  {/* Soil Type */}
                  <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700">
                      {(['SAND', 'CLAY', 'ROCK'] as const).map(type => (
                          <button 
                            key={type}
                            onClick={() => setSoilType(type)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all
                                ${soilType === type ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}
                            `}
                          >
                              {type}
                          </button>
                      ))}
                  </div>

                  {/* Playback */}
                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${isRunning ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-green-600 hover:bg-green-500 text-white'}
                        `}
                      >
                          {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                          {isRunning ? 'PAUSE' : 'START CUTTING'}
                      </button>
                      <button 
                        onClick={handleReset}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RotateCcw size={14}/>
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="绞刀运行状态" subtitle="SWING" className="flex-1 border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full p-2 justify-center">
                  
                  {/* Swing Angle Gauge */}
                  <div className="relative h-24 w-full bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
                      <div className="absolute top-2 left-2 text-[10px] text-slate-400">SWING ANGLE</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xl font-bold text-white">{swingAngle.toFixed(0)}°</div>
                      
                      {/* Arc Visual */}
                      <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-t-8 border-slate-700"></div>
                      <div 
                         className="absolute bottom-0 left-1/2 w-1 h-16 bg-yellow-500 origin-bottom transition-transform duration-75"
                         style={{transform: `translateX(-50%) rotate(${swingAngle}deg)`}}
                      ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Swing Speed</div>
                          <div className="text-lg font-bold text-cyan-300">{metrics.swingSpeed.toFixed(2)} °/s</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-500 uppercase">Torque Load</div>
                          <div className="text-lg font-bold text-orange-400">{(metrics.production / 50).toFixed(0)} %</div>
                      </div>
                  </div>

              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Production Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="实时产量曲线 (m³/h)" subtitle="EFFICIENCY" className="h-[280px] border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData}>
                          <defs>
                              <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 6000]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                          <Area type="monotone" dataKey="rate" stroke="#f59e0b" fill="url(#gradProd)" strokeWidth={2} name="Production" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="疏浚剖面与土质" subtitle="SECTION" className="flex-1 border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
              <div className="flex flex-col h-full gap-2 p-2">
                  {/* Cross Section Visual */}
                  <div className="flex-1 bg-black/30 rounded border border-slate-700 relative overflow-hidden flex items-end">
                      {/* Layers */}
                      <div className="w-full h-[60%] bg-[#4b5563] absolute bottom-0 border-t border-slate-600"></div> {/* Rock */}
                      <div className="w-full h-[40%] bg-[#78350f] absolute bottom-[60%] border-t border-slate-600"></div> {/* Clay */}
                      <div className="w-full h-[30%] bg-[#d97706] absolute bottom-[100%] border-t border-slate-600"></div> {/* Sand */}
                      
                      {/* Cutter Graphic */}
                      <div 
                         className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_red] transition-all duration-100"
                         style={{ 
                             left: `${50 + (swingAngle/40)*40}%`, 
                             bottom: `${(depth/25)*100}%` 
                         }}
                      ></div>
                  </div>

                  <div className="space-y-2 text-xs">
                      {SOIL_PROFILE.map((layer, i) => (
                          <div key={i} className="flex justify-between items-center p-1.5 bg-slate-900/50 rounded">
                              <span className="font-bold text-slate-300">{layer.name}</span>
                              <span className="font-mono text-slate-500">{layer.depth}m</span>
                          </div>
                      ))}
                  </div>

                  <div className="p-2 bg-green-900/20 border border-green-800/30 rounded text-center text-[10px] text-green-300">
                      Cutter Suction Efficiency: {metrics.efficiency.toFixed(1)}%
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* CENTER HUD: Status */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-cyan-900/50 flex gap-6 text-[10px] text-slate-300">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Cutter Head</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Spud Pole</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Excavation Zone</div>
          </div>
      </div>

    </div>
  );
};
