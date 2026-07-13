
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-port-spill]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-port-spill';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Droplets, Wind, Waves, MapPin, 
  ShieldAlert, Activity, Play, Pause, 
  RotateCcw, Target, Anchor, Compass
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---
const IMPACT_PIE = [
  { name: 'Evaporated', value: 30, fill: '#64748b' },
  { name: 'Dispersed', value: 15, fill: '#3b82f6' },
  { name: 'Floating', value: 45, fill: '#111111' }, // Oil color
  { name: 'Beached', value: 10, fill: '#ef4444' },
];

const SPREAD_HISTORY = Array.from({length: 40}, (_, i) => ({
    time: i,
    area: 0 // Will populate
}));

export const PortSpillSimView: React.FC = () => {
  // --- STATE ---
  const [spillVolume, setSpillVolume] = useState(500); // barrels
  const [oilType, setOilType] = useState<'CRUDE' | 'DIESEL'>('CRUDE');
  const [windSpeed, setWindSpeed] = useState(5); // m/s
  const [windDir, setWindDir] = useState(45); // deg
  const [currentSpeed, setCurrentSpeed] = useState(0.5); // m/s
  const [currentDir, setCurrentDir] = useState(135); // deg
  const [boomsDeployed, setBoomsDeployed] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const [metrics, setMetrics] = useState({
    slickArea: 0, // m2
    evaporation: 0, // %
    shorelineImpact: 'NONE'
  });

  const [graphData, setGraphData] = useState(SPREAD_HISTORY);

  // Simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        setSimTime(t => t + 1); // Minutes

        // Physics: Fay's Spreading
        // Area ~ k * Volume^(2/3) * Time^(0.5) (Gravity-Viscous phase approx)
        // Simplified growth
        const t = simTime + 1;
        const growthRate = oilType === 'CRUDE' ? 10 : 15; // Diesel spreads faster
        let area = growthRate * Math.pow(spillVolume, 0.6) * Math.sqrt(t);
        
        // Booms reduce area growth
        if (boomsDeployed) area *= 0.6;

        // Evaporation
        // Diesel evaporates faster
        const evapRate = oilType === 'DIESEL' ? 0.005 : 0.001;
        const evap = Math.min(100, (1 - Math.exp(-evapRate * t)) * 100);

        setMetrics({
            slickArea: area,
            evaporation: evap,
            shorelineImpact: area > 5000 && !boomsDeployed ? 'HIGH' : area > 2000 ? 'MED' : 'LOW'
        });

        // Update Charts
        setGraphData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: t,
                area: area
            });
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, simTime, spillVolume, oilType, boomsDeployed]);

  const handleReset = () => {
      setIsRunning(false);
      setSimTime(0);
      setMetrics({ slickArea: 0, evaporation: 0, shorelineImpact: 'NONE' });
      setGraphData(SPREAD_HISTORY);
      setBoomsDeployed(false);
  };

  return (
    <div className="h-full w-full relative bg-[#06110e] text-emerald-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-spill" 
            simData={{ 
                spillAge: simTime,
                volume: spillVolume,
                windSpeed, windDir,
                currentSpeed, currentDir,
                boomsDeployed
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#06110e_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#064e3b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ShieldAlert size={14} /> HAZMAT RESPONSE
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 港区油品/危险品 <span className="text-yellow-500">泄漏扩散仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Slick Area</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.shorelineImpact === 'HIGH' ? 'text-red-500' : 'text-white'}`}>
                       {metrics.slickArea.toFixed(0)} m²
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Elapsed Time</div>
                   <div className="text-3xl font-mono font-bold text-cyan-400">
                       {Math.floor(simTime/60)}h {simTime%60}m
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Parameters */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b2420]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                  <Droplets size={16} className="text-yellow-500"/> 泄漏源参数
              </h3>
              
              <div className="space-y-4">
                  {/* Type */}
                  <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700">
                      <button 
                        onClick={() => setOilType('CRUDE')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${oilType === 'CRUDE' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                      >
                          CRUDE
                      </button>
                      <button 
                        onClick={() => setOilType('DIESEL')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${oilType === 'DIESEL' ? 'bg-yellow-600 text-black' : 'text-slate-500'}`}
                      >
                          DIESEL
                      </button>
                  </div>

                  {/* Volume */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Spill Volume</span>
                          <span className="font-mono text-white">{spillVolume} bbl</span>
                      </div>
                      <input 
                        type="range" min="100" max="5000" step="100" 
                        value={spillVolume} onChange={(e) => setSpillVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                  </div>

                  {/* Weather */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-900/30">
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1"><Wind size={10}/> Wind Spd</div>
                          <input type="number" value={windSpeed} onChange={e=>setWindSpeed(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"/>
                      </div>
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1"><Compass size={10}/> Wind Dir</div>
                          <input type="number" value={windDir} onChange={e=>setWindDir(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"/>
                      </div>
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1"><Waves size={10}/> Curr Spd</div>
                          <input type="number" value={currentSpeed} onChange={e=>setCurrentSpeed(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"/>
                      </div>
                      <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 flex items-center gap-1"><Compass size={10}/> Curr Dir</div>
                          <input type="number" value={currentDir} onChange={e=>setCurrentDir(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"/>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex-1 bg-[#0b2420]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-cyan-500"/> 应急响应控制
              </h3>
              
              <button 
                  onClick={() => setBoomsDeployed(!boomsDeployed)}
                  className={`w-full py-3 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                      ${boomsDeployed ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-600 text-slate-400'}
                  `}
              >
                  <Anchor size={14}/> {boomsDeployed ? 'BOOMS DEPLOYED' : 'DEPLOY BOOMS'}
              </button>
              
              <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${isRunning ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
                    `}
                  >
                      {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                      {isRunning ? 'PAUSE' : 'START'}
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

      {/* RIGHT: Impact Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Spread Chart */}
          <SciFiCard title="扩散面积趋势 (Spread)" subtitle="m²" className="h-[250px] border-emerald-900/50 bg-[#0b2420]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData}>
                          <defs>
                              <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                          <Area type="monotone" dataKey="area" stroke="#ef4444" fill="url(#gradArea)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Mass Balance */}
          <SciFiCard title="油品归宿分析 (Mass Balance)" subtitle="BUDGET" className="flex-1 border-emerald-900/50 bg-[#0b2420]/90 pointer-events-auto">
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <div className="relative w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={IMPACT_PIE}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {IMPACT_PIE.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#000'}} />
                              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  
                  <div className={`mt-4 p-3 w-full rounded border text-center text-xs
                      ${metrics.shorelineImpact === 'HIGH' ? 'bg-red-900/30 border-red-500 text-red-200 animate-pulse' : 'bg-slate-900/50 border-slate-700 text-slate-400'}
                  `}>
                      <div className="font-bold mb-1">SHORELINE IMPACT RISK</div>
                      <div className="text-lg">{metrics.shorelineImpact}</div>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
