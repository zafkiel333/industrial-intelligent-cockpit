
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-break]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-break';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ShieldAlert, Activity, Siren, Waves, 
  MapPin, Clock, Play, Pause, AlertTriangle, 
  RotateCcw, Scale, Home, TrendingDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const HYDROGRAPH = Array.from({length: 48}, (_, i) => {
    // Sharp flood peak
    const t = i;
    const base = 500;
    const flood = t > 10 && t < 30 ? 3000 * Math.sin((t-10)/20 * Math.PI) : 0;
    return { time: `T+${i}h`, flow: base + flood };
});

const IMPACT_ESTIMATE = [
    { zone: 'Residential A', area: 2.5, depth: 1.2, people: 1500 },
    { zone: 'Industrial B', area: 1.8, depth: 0.8, people: 50 },
    { zone: 'Agri-Land C', area: 5.2, depth: 1.5, people: 20 },
];

export const HydroBreakSimView: React.FC = () => {
  // --- STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [waterLevel, setWaterLevel] = useState(4); // m (River Stage, max 10)
  const [breachProgress, setBreachProgress] = useState(0); // 0-100%
  const [isBreached, setIsBreached] = useState(false);
  const [simTime, setSimTime] = useState(0);

  const [metrics, setMetrics] = useState({
    dischargeQ: 0, // m3/s
    breachWidth: 0, // m
    floodArea: 0, // km2
    warningLevel: 'NORMAL'
  });

  // Simulation Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setSimTime(t => t + 0.5);

        // Water level rises naturally or via slider interaction
        // If playing, follow hydrograph trend roughly
        const tIdx = Math.min(47, Math.floor(simTime));
        const flowInput = HYDROGRAPH[tIdx].flow;
        // Map flow to level (simplified rating curve)
        const targetLevel = 4 + (flowInput / 3000) * 5; // 4 to 9m
        
        setWaterLevel(prev => {
            // Smooth transition
            const diff = targetLevel - prev;
            return prev + diff * 0.1;
        });

        // Breach Logic
        // Overtopping condition: Level > 9.5 (Levee height 10 but with freeboard)
        if (waterLevel > 9.5 && !isBreached) {
             setIsBreached(true);
        }

        // Breach Progression (Erosion)
        if (isBreached && breachProgress < 100) {
            setBreachProgress(p => Math.min(100, p + 2)); // Grows
        }

        // Calculate Discharge through breach
        // Q = C * Width * Depth^1.5
        const width = (breachProgress / 100) * 20; // Max 20m breach
        const depth = Math.max(0, waterLevel - 5); // Breach invert at 5m? Assuming base of breach is lower.
        // Let's say breach goes down to ground level (0). River bed is 5. Levee top 10.
        // Breach invert drops as progress increases.
        // Invert level = 10 - (breachProgress/100)*10 = 10 -> 0.
        const invert = 10 - (breachProgress / 100) * 10;
        const head = Math.max(0, waterLevel - invert);
        
        const qBreach = 1.7 * width * Math.pow(head, 1.5);
        
        setMetrics({
            dischargeQ: qBreach,
            breachWidth: width,
            floodArea: (qBreach * simTime * 60) / 1000000, // Very rough accum
            warningLevel: isBreached ? 'CRITICAL' : waterLevel > 8 ? 'WARNING' : 'NORMAL'
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, simTime, waterLevel, isBreached, breachProgress]);

  const handleReset = () => {
      setIsPlaying(false);
      setSimTime(0);
      setWaterLevel(4);
      setBreachProgress(0);
      setIsBreached(false);
      setMetrics({ dischargeQ: 0, breachWidth: 0, floodArea: 0, warningLevel: 'NORMAL' });
  };

  return (
    <div className="h-full w-full relative bg-[#0b0c16] text-blue-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-break" 
            simData={{ 
                waterLevel,
                breachProgress,
                isBreached
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0b0c16_100%)] pointer-events-none"></div>
          
          {/* Emergency Flashing Overlay */}
          {metrics.warningLevel === 'CRITICAL' && (
              <div className="absolute inset-0 border-[20px] border-red-600/30 animate-pulse pointer-events-none z-10"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e3a8a]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-red-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ShieldAlert size={14} /> EMERGENCY RESPONSE
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 堤防漫顶溃口 <span className="text-red-500">& 淹没范围仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Alert Status</div>
                   <div className={`text-3xl font-black ${metrics.warningLevel === 'CRITICAL' ? 'text-red-500 animate-bounce' : metrics.warningLevel === 'WARNING' ? 'text-yellow-400' : 'text-green-400'}`}>
                       {metrics.warningLevel}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Breach Flow</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.dischargeQ.toFixed(0)} <span className="text-sm text-slate-500">m³/s</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Simulation Parameters */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0f172a]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Activity size={16} className="text-blue-400"/> 边界条件控制
              </h3>
              
              <div className="space-y-6">
                  {/* Water Level */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">River Stage (Level)</span>
                          <span className={`${waterLevel > 9 ? 'text-red-400' : 'text-blue-300'}`}>{waterLevel.toFixed(2)} m</span>
                      </div>
                      <div className="relative w-full h-8 bg-slate-800 rounded flex items-end overflow-hidden border border-slate-600">
                          <div className="w-full bg-blue-500/50 transition-all duration-300" style={{height: `${(waterLevel/12)*100}%`}}></div>
                          {/* Levee Height Line */}
                          <div className="absolute top-[16%] w-full h-0.5 bg-red-500/50 border-b border-red-500 border-dashed"></div>
                          <span className="absolute top-[2px] right-1 text-[8px] text-red-400">Levee Top (10m)</span>
                      </div>
                      <input 
                         type="range" min="0" max="12" step="0.1"
                         value={waterLevel} onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                         className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Manual Trigger */}
                  <div className="pt-4 border-t border-slate-800">
                      <button 
                         onClick={() => setIsBreached(true)}
                         disabled={isBreached}
                         className="w-full py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-500 text-red-200 font-bold text-xs rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         <AlertTriangle size={14} /> FORCE BREACH EVENT
                      </button>
                  </div>

                  {/* Playback */}
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                            ${isPlaying ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-blue-600 hover:bg-blue-500 text-white'}
                        `}
                      >
                          {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                          {isPlaying ? 'PAUSE' : 'SIMULATE'}
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

          <SciFiCard title="水文过程线 (Hydrograph)" subtitle="INFLOW" className="flex-1 border-blue-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HYDROGRAPH}>
                          <defs>
                              <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={11} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} hide />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          <ReferenceLine x={`T+${Math.floor(simTime)}h`} stroke="white" />
                          <Area type="monotone" dataKey="flow" stroke="#3b82f6" fill="url(#gradFlow)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Impact Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Impact Stats */}
          <div className="bg-[#0f172a]/90 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <Siren size={16} className="text-red-500"/> 灾损评估 (Impact)
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Inundated Area</div>
                      <div className="text-xl font-bold text-white">{metrics.floodArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">km²</span></div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Est. Evacuees</div>
                      <div className="text-xl font-bold text-orange-400">{(metrics.floodArea * 1500).toFixed(0)}</div>
                  </div>
              </div>

              <div className="space-y-2">
                  {IMPACT_ESTIMATE.map((zone, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-900/30 border border-slate-800">
                          <div className="flex items-center gap-2">
                              {zone.zone.includes('Residential') ? <Home size={12} className="text-blue-400"/> : <MapPin size={12} className="text-slate-400"/>}
                              <span className="text-xs text-slate-200">{zone.zone}</span>
                          </div>
                          <div className="text-right">
                              <span className={`text-xs font-bold ${metrics.floodArea > i * 2 ? 'text-red-500' : 'text-green-500'}`}>
                                  {metrics.floodArea > i * 2 ? `${zone.depth}m` : 'Safe'}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <SciFiCard title="溃口参数演化" subtitle="BREACH WIDTH" className="flex-1 border-blue-900/50 bg-[#0f172a]/90 pointer-events-auto">
              <div className="flex flex-col h-full gap-4 p-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Current Width</span>
                      <span className="text-xl font-mono font-bold text-white">{metrics.breachWidth.toFixed(1)} m</span>
                  </div>
                  
                  <div className="flex-1 min-h-0 bg-black/20 rounded border border-slate-800 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{name: 'Width', val: metrics.breachWidth}]} layout="vertical" margin={{left: 0, right: 20}}>
                              <XAxis type="number" domain={[0, 20]} hide />
                              <YAxis type="category" dataKey="name" hide />
                              <Bar dataKey="val" fill="#ef4444" barSize={20} radius={[0, 4, 4, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center pl-4 text-xs text-slate-500 pointer-events-none">
                          Max Potential: 20m
                      </div>
                  </div>

                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-200/80">
                      <strong className="block mb-1 text-white flex items-center gap-2"><TrendingDown size={12}/> Analysis:</strong>
                      Rapid erosion phase active. Vertical scour depth increasing at 0.5 m/h.
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* CENTER HUD: Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
           <div className="bg-black/70 backdrop-blur px-6 py-2 rounded-full border border-blue-900/50 flex gap-6 text-[10px] text-slate-300">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Flood Water</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Breach Zone</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> Impacted Asset</div>
           </div>
      </div>

    </div>
  );
};
