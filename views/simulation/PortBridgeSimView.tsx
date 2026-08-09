
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-bridge]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-bridge';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  ArrowUp, ArrowRight, Wind, Anchor, 
  AlertTriangle, CheckCircle2, Navigation, 
  Maximize2, Crosshair, Layers, Zap,
  Settings, Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---

const TIDE_FORECAST = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    tide: 2 + Math.sin(i * 0.5) * 1.5, // 0.5 to 3.5m
    clearanceLimit: 3.0 // Safety margin required
}));

const PIER_DISTANCE_RADAR = [
    { angle: 'Bow', dist: 120, full: 200 },
    { angle: 'Stbd', dist: 45, full: 200 },
    { angle: 'Stern', dist: 150, full: 200 },
    { angle: 'Port', dist: 80, full: 200 },
];

export const PortBridgeSimView: React.FC = () => {
  // --- STATE ---
  const [tideLevel, setTideLevel] = useState(2.0); // m
  const [windSpeed, setWindSpeed] = useState(5.0); // m/s
  const [shipSpeed, setShipSpeed] = useState(8.0); // kn
  const [airDraft, setAirDraft] = useState(38.0); // m (Height of ship)
  
  const [metrics, setMetrics] = useState({
    bridgeClearance: 0, // Calculated
    underKeelClearance: 5.0, // m
    driftAngle: 2.5, // deg
    collisionRisk: 'LOW',
    status: 'SAFE'
  });

  // Constants
  const BRIDGE_HEIGHT_DATUM = 42.0; // Clearance at 0 tide

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
        // Recalculate physics
        const actualClearance = BRIDGE_HEIGHT_DATUM - tideLevel - airDraft;
        const drift = (windSpeed / 20) * 5 + Math.random() * 0.5; // Wind effect
        
        let status = 'SAFE';
        let risk = 'LOW';
        
        if (actualClearance < 1.0) {
            status = 'CRITICAL';
            risk = 'HIGH';
        } else if (actualClearance < 2.0) {
            status = 'WARNING';
            risk = 'MED';
        }

        setMetrics({
            bridgeClearance: actualClearance,
            underKeelClearance: 5.0 + tideLevel,
            driftAngle: drift,
            collisionRisk: risk,
            status: status
        });
    }, 500);

    return () => clearInterval(interval);
  }, [tideLevel, windSpeed, shipSpeed, airDraft]);

  return (
    <div className="h-full w-full relative bg-[#050b1a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-bridge" 
            simData={{ 
                tide: tideLevel,
                windSpeed,
                shipSpeed,
                airDraft
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050b1a_95%)] pointer-events-none"></div>
          
          {/* Collision Warning Overlay */}
          {metrics.status === 'CRITICAL' && (
              <div className="absolute inset-0 border-[20px] border-red-600/30 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                  <div className="bg-red-900/80 px-8 py-4 rounded border-2 border-red-500 text-white font-black text-2xl tracking-[0.2em] shadow-[0_0_50px_red]">
                      INSUFFICIENT CLEARANCE
                  </div>
              </div>
          )}
      </div>

      {/* 2. TOP HUD: Header & Status */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none bg-gradient-to-b from-[#0c1629]/90 to-transparent">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Maximize2 size={14} /> BRIDGE CLEARANCE CONTROL
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 桥区通航 <span className="text-cyan-500">安全与净空仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-12 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Vertical Margin</div>
                   <div className={`text-4xl font-mono font-bold ${metrics.bridgeClearance < 2 ? 'text-red-500' : 'text-white'}`}>
                       {metrics.bridgeClearance.toFixed(2)} <span className="text-lg text-slate-500">m</span>
                   </div>
               </div>
               
               {/* Central Status Indicator */}
               <div className={`w-32 h-10 flex items-center justify-center rounded border-2 font-bold tracking-widest
                   ${metrics.status === 'SAFE' ? 'border-green-500 bg-green-900/20 text-green-400' : 
                     metrics.status === 'WARNING' ? 'border-yellow-500 bg-yellow-900/20 text-yellow-400' : 
                     'border-red-500 bg-red-900/20 text-red-500'}
               `}>
                   {metrics.status}
               </div>

               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Drift Angle</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {metrics.driftAngle.toFixed(1)}°
                   </div>
               </div>
          </div>
      </div>

      {/* 3. FLOAT PANELS (Orbiting Layout) */}

      {/* Top Left: Vertical Profile */}
      <div className="absolute left-6 top-32 w-80 pointer-events-none">
          <SciFiCard title="垂直净空监测 (Air Draft)" subtitle="LASER" className="h-[260px] border-cyan-500/30 bg-[#060b14]/80 backdrop-blur-md pointer-events-auto">
              <div className="flex flex-col h-full p-2 gap-4">
                  <div className="flex-1 relative border-l-2 border-dashed border-slate-600 ml-4">
                      {/* Diagram */}
                      <div className="absolute top-0 left-0 w-32 border-t-4 border-cyan-600 text-[10px] text-cyan-400 pl-2 pt-1">BRIDGE DECK</div>
                      
                      <div className="absolute left-0 w-24 border-t-2 border-red-500/50 border-dashed" style={{top: '20%'}}>
                           <span className="text-[9px] text-red-400 bg-black/50 absolute right-0 -top-3">Min Limit</span>
                      </div>

                      <div 
                         className="absolute left-2 w-16 bg-slate-700 border border-slate-500 flex items-center justify-center text-[10px] text-white transition-all duration-300"
                         style={{
                             top: `${(1 - (metrics.bridgeClearance+2) / 10) * 100}%`, // Simplified scaling
                             height: '40px'
                         }}
                      >
                          SHIP MAST
                      </div>

                      <div className="absolute bottom-10 left-0 w-32 border-b-2 border-blue-500 text-[10px] text-blue-400 pl-2 pb-1">WATER LEVEL</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-slate-800/50 rounded p-1">
                          <span className="text-slate-400">Tide</span>
                          <div className="font-bold text-blue-300">+{tideLevel.toFixed(1)}m</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-1">
                          <span className="text-slate-400">Ship H</span>
                          <div className="font-bold text-white">{airDraft.toFixed(1)}m</div>
                      </div>
                  </div>
              </div>
          </SciFiCard>
      </div>

      {/* Bottom Left: Controls */}
      <div className="absolute left-6 bottom-6 w-80 pointer-events-auto">
          <div className="bg-[#060b14]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 仿真参数控制
              </h3>
              
              <div className="space-y-5">
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-blue-200">
                          <span className="flex items-center gap-2"><Waves size={12}/> Tide Level</span>
                          <span className="font-mono">{tideLevel.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="-1" max="5" step="0.1" 
                        value={tideLevel} onChange={(e) => setTideLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><ArrowUp size={12}/> Ship Air Draft</span>
                          <span className="font-mono text-white">{airDraft.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" min="20" max="45" step="0.5" 
                        value={airDraft} onChange={(e) => setAirDraft(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-cyan-200">
                          <span className="flex items-center gap-2"><Wind size={12}/> Cross Wind</span>
                          <span className="font-mono">{windSpeed.toFixed(1)} m/s</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="1" 
                        value={windSpeed} onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* Top Right: Lateral Safety (Radar) */}
      <div className="absolute right-6 top-32 w-80 pointer-events-none">
          <SciFiCard title="水平安全距离 (Lateral)" subtitle="PIER PROXIMITY" className="h-[260px] border-cyan-500/30 bg-[#060b14]/80 backdrop-blur-md pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={PIER_DISTANCE_RADAR}>
                          <PolarGrid stroke="#1e3a8a" />
                          <PolarAngleAxis dataKey="angle" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                          <Radar name="Distance" dataKey="dist" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                      </RadarChart>
                  </ResponsiveContainer>
                  
                  {/* Warning overlay if close */}
                  <div className="absolute top-2 right-2 text-[10px] text-orange-400 bg-orange-900/20 px-2 rounded border border-orange-500/30">
                      Stbd Pier: 45m
                  </div>
              </div>
          </SciFiCard>
      </div>

      {/* Bottom Right: Tidal Forecast */}
      <div className="absolute right-6 bottom-6 w-96 pointer-events-auto">
          <SciFiCard title="潮汐通航窗口 (24H)" subtitle="PREDICTION" className="h-[220px] border-cyan-900/50 bg-[#060b14]/90">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TIDE_FORECAST}>
                          <defs>
                              <linearGradient id="gradTide" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 5]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          
                          <ReferenceLine y={metrics.bridgeClearance < 1 ? tideLevel : -1} stroke="red" strokeDasharray="3 3" label={{value:'Unsafe', fill:'red', fontSize:10}} />
                          <Area type="monotone" dataKey="tide" stroke="#3b82f6" fill="url(#gradTide)" strokeWidth={2} name="Tide Level" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>
      </div>

      {/* CENTER HUD: Collision Vectors */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-8 py-3 rounded-full border border-cyan-500/30 flex gap-8 shadow-2xl">
              <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-cyan-400" />
                  <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">Heading</span>
                      <span className="text-sm font-bold text-white">045°</span>
                  </div>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div className="flex items-center gap-2">
                  <Crosshair size={16} className="text-orange-400" />
                  <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">X-Track Error</span>
                      <span className="text-sm font-bold text-orange-400">L 12m</span>
                  </div>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div className="flex items-center gap-2">
                  <Anchor size={16} className="text-green-400" />
                  <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">Under Keel</span>
                      <span className="text-sm font-bold text-green-400">{metrics.underKeelClearance.toFixed(1)}m</span>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};
