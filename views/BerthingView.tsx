import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, ReferenceLine
} from 'recharts';
import { 
  Anchor, Ruler, Activity, ArrowRightLeft, 
  ArrowDownToLine, Signal, Ship, AlertOctagon 
} from 'lucide-react';

export const BerthingView: React.FC = () => {
  // --- STATE ---
  const [approachData, setApproachData] = useState({
    distBow: 145, // cm
    distStern: 152, // cm
    speedBow: 3.2, // cm/s
    speedStern: 2.8, // cm/s
    angle: 0.5, // degrees
    kineticEnergy: 12.5, // kJ
  });

  const [mooringLines, setMooringLines] = useState([
    { id: 'L1', tension: 15, limit: 50, status: 'normal' },
    { id: 'L2', tension: 18, limit: 50, status: 'normal' },
    { id: 'L3', tension: 42, limit: 50, status: 'warning' },
    { id: 'L4', tension: 12, limit: 50, status: 'normal' },
  ]);

  const [envData, setEnvData] = useState({
    tide: 2.4, // m
    current: 0.5, // kn
    wind: 8.2 // m/s
  });

  const [driftHistory, setDriftHistory] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init History
    const initHist = Array.from({length: 40}, (_, i) => ({
        time: i,
        drift: 140 + Math.random() * 10
    }));
    setDriftHistory(initHist);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Approach Data (Simulate Gentle Drifting at Berth)
      setApproachData(prev => ({
        distBow: 145 + Math.sin(time * 0.5) * 10,
        distStern: 152 + Math.sin(time * 0.4) * 12,
        speedBow: Math.sin(time) * 5,
        speedStern: Math.cos(time) * 4,
        angle: Math.sin(time * 0.2) * 1.5,
        kineticEnergy: Math.abs(Math.sin(time)) * 15 + 5
      }));

      // 2. Line Tension Simulation
      setMooringLines(prev => prev.map(line => {
        const noise = (Math.random() - 0.5) * 2;
        let newTension = Math.max(0, Math.min(60, line.tension + noise));
        // Simulate a surge event for Line 3
        if (line.id === 'L3') newTension = 40 + Math.sin(time * 0.8) * 5;
        
        return {
            ...line,
            tension: newTension,
            status: newTension > 45 ? 'warning' : 'normal'
        };
      }));

      // 3. Update History
      setDriftHistory(prev => {
         const lastTime = prev[prev.length - 1].time;
         const newDrift = 145 + Math.sin(time * 0.5) * 10; // Match bow dist
         return [...prev.slice(1), { time: lastTime + 1, drift: newDrift }];
      });

    }, 500); // Faster update for smooth velocity display

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-orange-50 selection:bg-orange-500/30">
      
      {/* HEADER: Safety & Precision Theme */}
      <div className="flex items-end justify-between border-b border-orange-500/30 pb-4 bg-gradient-to-r from-orange-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Anchor size={12} className="animate-pulse" />
             PORT & TERMINAL OPERATIONS
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-orange-500 text-shadow-glow">靠泊系统</span> 智能运维指挥中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">BERTH #08</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Vessel Status</div>
                <div className="text-2xl font-mono font-bold text-white tracking-widest bg-green-900/30 px-2 rounded border border-green-800/50 text-green-400">ALONGSIDE</div>
            </div>
            <div className="flex flex-col items-end border-l border-orange-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Approach Angle</div>
                <div className="text-2xl font-mono font-bold text-white">{approachData.angle.toFixed(1)}°</div>
            </div>
            <div className="flex flex-col items-end border-l border-orange-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Impact Energy</div>
                <div className="text-2xl font-mono font-bold text-orange-300">{approachData.kineticEnergy.toFixed(1)} <span className="text-sm text-slate-500">kJ</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Laser Docking System (BAS) */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Primary Distance Readouts */}
           <SciFiCard title="激光靠泊距离 (BAS)" subtitle="REAL-TIME" className="border-orange-900/50 bg-[#1a0f05]/60">
              <div className="flex flex-col gap-6 py-2">
                 {/* Bow Sensor */}
                 <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-orange-400 font-bold mb-1">BOW DISTANCE</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono font-bold text-white">{approachData.distBow.toFixed(0)}</span>
                            <span className="text-sm text-slate-500">cm</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
                        <div className={`text-xl font-mono font-bold ${Math.abs(approachData.speedBow) > 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                            {approachData.speedBow > 0 ? '+' : ''}{approachData.speedBow.toFixed(1)} <span className="text-xs">cm/s</span>
                        </div>
                    </div>
                 </div>
                 
                 <div className="w-full h-[1px] bg-orange-900/50"></div>

                 {/* Stern Sensor */}
                 <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-orange-400 font-bold mb-1">STERN DISTANCE</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono font-bold text-white">{approachData.distStern.toFixed(0)}</span>
                            <span className="text-sm text-slate-500">cm</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
                        <div className={`text-xl font-mono font-bold ${Math.abs(approachData.speedStern) > 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                            {approachData.speedStern > 0 ? '+' : ''}{approachData.speedStern.toFixed(1)} <span className="text-xs">cm/s</span>
                        </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Docking Angle Viz */}
           <SciFiCard title="靠泊角度监测" className="flex-1 border-orange-900/50">
              <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative w-full h-32 border-b-2 border-slate-600 flex items-end justify-center overflow-hidden">
                      {/* Quay Wall Reference */}
                      <div className="absolute bottom-0 w-full h-1 bg-slate-500"></div>
                      
                      {/* Ship Hull Viz */}
                      <div className="w-3/4 h-16 bg-gradient-to-t from-slate-700 to-transparent border-2 border-orange-500/50 rounded-t-lg transition-transform duration-300 origin-bottom"
                           style={{ transform: `rotate(${approachData.angle}deg)` }}>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-orange-300 font-mono text-xs">SHIP HULL</div>
                      </div>

                      {/* Angle text */}
                      <div className="absolute top-2 right-2 text-2xl font-bold text-white font-mono">
                          {approachData.angle.toFixed(1)}°
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 w-full">
                      <div className="bg-slate-900/50 p-2 text-center rounded">
                          <div className="text-[10px] text-slate-500">Parallelism</div>
                          <div className="text-green-400 font-bold">GOOD</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 text-center rounded">
                          <div className="text-[10px] text-slate-500">Yaw Rate</div>
                          <div className="text-white font-bold">0.02 °/s</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0502] border border-orange-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(249,115,22,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                 <Signal className="text-green-500 animate-pulse" size={16} />
                 <span className="text-xs text-green-400 font-mono tracking-wider">LASER SENSORS: ACQUIRING</span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                  <div className="bg-black/70 p-2 rounded border border-orange-500/30">
                      <div className="text-[10px] text-orange-300 uppercase mb-1">Environmental</div>
                      <div className="flex gap-4 text-xs font-mono">
                          <span className="text-slate-300">TIDE: <span className="text-white">{envData.tide}m</span></span>
                          <span className="text-slate-300">WIND: <span className="text-white">{envData.wind}m/s</span></span>
                      </div>
                  </div>

                  <div className="flex gap-2">
                       <div className="w-2 h-8 bg-green-500/80 rounded-sm"></div>
                       <div className="w-2 h-8 bg-green-500/80 rounded-sm"></div>
                       <div className="w-2 h-8 bg-slate-700/50 rounded-sm"></div>
                  </div>
              </div>

              <ThreeScene type="berthing" color="#f97316" />
           </div>

           {/* Drift History */}
           <SciFiCard title="漂移监测曲线" subtitle="DISTANCE TREND" className="h-[250px] border-orange-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={driftHistory}>
                       <defs>
                          <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331c12" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#9a3412" tick={{fontSize: 10}} domain={[120, 180]} />
                       <Tooltip contentStyle={{backgroundColor: '#1a0f05', borderColor: '#f97316', color: '#fff'}} />
                       <ReferenceLine y={140} stroke="#22c55e" strokeDasharray="3 3" label={{value: 'Ideal', fill: '#22c55e', fontSize: 10}} />
                       <Area type="monotone" dataKey="drift" stroke="#f97316" strokeWidth={2} fill="url(#colorDrift)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Mooring & Safety */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Mooring Line Tension */}
           <SciFiCard title="缆绳张力监测" subtitle="LOAD (TONS)" className="flex-1 border-orange-900/50">
              <div className="flex flex-col gap-4">
                  {mooringLines.map(line => (
                     <div key={line.id}>
                        <div className="flex justify-between items-center text-xs mb-1">
                           <span className="text-slate-400 font-bold">Line {line.id}</span>
                           <span className={`font-mono font-bold ${line.status === 'warning' ? 'text-red-500' : 'text-slate-200'}`}>
                               {line.tension.toFixed(1)} t
                           </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                            <div 
                                className={`h-full transition-all duration-300 ${line.status === 'warning' ? 'bg-red-500' : 'bg-orange-500'}`} 
                                style={{width: `${(line.tension / line.limit) * 100}%`}}
                            ></div>
                        </div>
                        {line.status === 'warning' && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400 animate-pulse">
                                <AlertOctagon size={10} /> OVERLOAD WARNING
                            </div>
                        )}
                     </div>
                  ))}
              </div>
           </SciFiCard>

           {/* Fender Status */}
           <SciFiCard title="护舷状态" className="border-orange-900/50">
               <div className="flex items-center justify-center p-4 relative">
                   {/* Visual representation of fender compression */}
                   <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                       <div className="absolute inset-0 rounded-full border-4 border-orange-500 scale-75 animate-pulse opacity-50"></div>
                       <div className="text-center">
                           <div className="text-2xl font-bold text-white">15%</div>
                           <div className="text-[9px] text-slate-500 uppercase">Compression</div>
                       </div>
                   </div>
               </div>
               <div className="text-center text-xs text-slate-400 mt-2">
                   Absorbed Energy: <span className="text-orange-300">120 kNm</span>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};