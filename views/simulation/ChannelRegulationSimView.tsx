
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Waves, Ruler, Activity, Clock, 
  Settings, Play, Pause, RotateCcw, 
  TrendingDown, ArrowDown, Map as MapIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend
} from 'recharts';

// --- MOCK DATA ---

// Cross Section Profile (Depth vs Width)
const SECTION_DATA_TEMPLATE = Array.from({length: 40}, (_, i) => ({
    x: i * 2 - 40, // -40 to 40m
    bed: -2,
    water: 0
}));

// Velocity Distribution
const VELOCITY_DATA = Array.from({length: 20}, (_, i) => ({
    dist: i, // Distance from bank
    v: 0
}));

export const ChannelRegulationSimView: React.FC = () => {
  // --- STATE ---
  const [flowRate, setFlowRate] = useState(1200); // m3/s
  const [dikeLength, setDikeLength] = useState(0); // m (0 = no regulation)
  const [simYear, setSimYear] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  
  const [metrics, setMetrics] = useState({
    minDepth: 3.5, // m
    maxVelocity: 1.2, // m/s
    sedimentTransport: 150, // t/day
    channelWidth: 80 // m
  });

  const [profileData, setProfileData] = useState(SECTION_DATA_TEMPLATE);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        setSimYear(prev => prev + 0.1);

        // Physics Approximation
        // Constriction ratio
        const originalWidth = 80;
        const currentWidth = Math.max(20, originalWidth - 2 * dikeLength);
        
        // Continuity: V1*A1 = V2*A2 -> V2 = V1 * (W1/W2)
        const vBase = flowRate / (originalWidth * 5); // Approx depth 5
        const vConst = vBase * (originalWidth / currentWidth);
        
        // Scour Depth (Empirical: ds ~ q^2/3)
        // More simply: Depth increases with velocity
        const scour = (vConst - vBase) * simYear * 0.5;
        const currentDepth = 5 + scour;

        setMetrics({
            minDepth: currentDepth,
            maxVelocity: vConst,
            sedimentTransport: 150 + scour * 50,
            channelWidth: currentWidth
        });

        // Update Charts
        setProfileData(prev => prev.map(pt => {
            const absX = Math.abs(pt.x);
            let z = -5; // Base
            
            // Dikes are at edges (|x| > 40 - len)
            if (absX > (40 - dikeLength)) {
                z = 2; // Dike height
            } else {
                // Channel Scour (Parabolic in center)
                const normX = pt.x / (currentWidth/2);
                const localScour = scour * (1 - normX*normX);
                z = -5 - Math.max(0, localScour);
            }
            
            // Banks slope
            if (dikeLength === 0 && absX > 30) z += (absX-30)*0.5;

            return { ...pt, bed: z };
        }));

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, flowRate, dikeLength, simYear]);

  return (
    <div className="h-full w-full relative bg-[#0f172a] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-channel-regulation" 
            simData={{ 
                flowRate,
                dikeLength,
                timeStep: simYear
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0f172a_100%)] pointer-events-none"></div>
          {/* Flow Lines Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Waves size={14} /> HYDRO-MORPHOLOGY LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 航道整治 <span className="text-cyan-500">工程影响仿真分析</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Navigable Depth</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.minDepth < 4 ? 'text-red-500' : 'text-white'}`}>
                       {metrics.minDepth.toFixed(2)} <span className="text-sm text-slate-500">m</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Flow Velocity</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.maxVelocity.toFixed(2)} <span className="text-sm text-slate-500">m/s</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Simulation Year</div>
                   <div className="text-3xl font-mono font-bold text-white">Y+{simYear.toFixed(1)}</div>
               </div>
          </div>
      </div>

      {/* LEFT: Engineering Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1426]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 整治方案参数
              </h3>
              
              <div className="space-y-6">
                  {/* Flow Rate */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Discharge (Q)</span>
                          <span className="font-mono text-cyan-300">{flowRate} m³/s</span>
                      </div>
                      <input 
                        type="range" min="500" max="3000" step="100" 
                        value={flowRate} onChange={(e) => setFlowRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Dike Length */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Spur Dike Length</span>
                          <span className="font-mono text-orange-400">{dikeLength} m</span>
                      </div>
                      <input 
                        type="range" min="0" max="15" step="1" 
                        value={dikeLength} onChange={(e) => setDikeLength(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="flex justify-between text-[8px] text-slate-500">
                          <span>None</span><span>Narrow</span><span>Constricted</span>
                      </div>
                  </div>

                  {/* Playback */}
                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${isRunning ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
                        `}
                      >
                          {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                          {isRunning ? 'PAUSE' : 'RUN SIM'}
                      </button>
                      <button 
                        onClick={() => { setSimYear(0); setDikeLength(0); }}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-600"
                      >
                          <RotateCcw size={14}/>
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="河床演变剖面 (Section A-A)" subtitle="DEPTH" className="flex-1 border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profileData} margin={{top: 10, bottom: 0}}>
                          <defs>
                              <linearGradient id="gradBed" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#78350f" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#451a03" stopOpacity={1}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="x" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dist (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[-10, 5]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#78350f'}} />
                          
                          <ReferenceLine y={0} stroke="#0ea5e9" strokeDasharray="3 3" label={{value: 'Water Level', fill: '#0ea5e9', fontSize: 10}} />
                          <Area type="monotone" dataKey="bed" stroke="#d97706" fill="url(#gradBed)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="泥沙输移率 (Sediment Transport)" subtitle="t/day" className="h-[250px] border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
               <div className="flex flex-col h-full justify-center items-center gap-4">
                   <div className="relative w-40 h-40">
                       <svg className="w-full h-full" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                           <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="10" 
                                   strokeDasharray="283" strokeDashoffset={283 - (283 * metrics.sedimentTransport / 500)} 
                                   transform="rotate(-90 50 50)" className="transition-all duration-500" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-2xl font-bold text-white">{metrics.sedimentTransport.toFixed(0)}</span>
                           <span className="text-[10px] text-slate-400">Transport Rate</span>
                       </div>
                   </div>
                   <div className="text-center text-xs text-slate-400 px-4">
                       Higher velocity due to dikes increases sediment carrying capacity, causing scour.
                   </div>
               </div>
          </SciFiCard>

          <SciFiCard title="通航宽度监测" subtitle="WIDTH" className="flex-1 border-cyan-900/50 bg-[#0b1426]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full p-2">
                  <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700">
                      <div className="flex items-center gap-3">
                          <Ruler size={16} className="text-cyan-400"/>
                          <div>
                              <div className="text-xs text-slate-300">Effective Width</div>
                              <div className="text-lg font-bold text-white">{metrics.channelWidth.toFixed(1)} m</div>
                          </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                          Class III Req: &gt;60m
                      </div>
                  </div>

                  <div className="flex-1 min-h-0 bg-black/20 rounded border border-slate-800 p-2 relative">
                      <div className="text-[9px] text-slate-400 mb-1">Velocity Profile (Centerline)</div>
                      {/* Simple visual bar for velocity increase */}
                      <div className="flex items-end h-full gap-1">
                          {Array.from({length: 10}).map((_, i) => {
                              const h = 20 + i * (metrics.maxVelocity * 20); // Dummy viz
                              return (
                                  <div key={i} className="flex-1 bg-cyan-600/50 rounded-t" style={{height: `${Math.min(100, h)}%`}}></div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
