
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Pause, Play, RefreshCw, 
  Settings, Zap, AlertTriangle, Layers, 
  Gauge, Thermometer, RotateCw, MoveRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, BarChart, Bar, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---

const TENSION_PROFILE = Array.from({length: 20}, (_, i) => ({
    dist: i * 50, // meters
    tension: 100 + i * 5, // Theoretical static tension
    dynamic: 0 // Will be calc in loop
}));

const FLOW_HISTORY = Array.from({length: 60}, (_, i) => ({
    time: i,
    flow: 2000
}));

const IDLER_HEATMAP = [
    { section: 'Head', temp: 65, status: 'Normal' },
    { section: 'Sec 1', temp: 62, status: 'Normal' },
    { section: 'Sec 2', temp: 85, status: 'Warning' }, // Hotspot
    { section: 'Sec 3', temp: 60, status: 'Normal' },
    { section: 'Tail', temp: 58, status: 'Normal' },
];

export const MineBeltConveyorSimView: React.FC = () => {
  // State
  const [isRunning, setIsRunning] = useState(true);
  const [beltSpeed, setBeltSpeed] = useState(3.5); // m/s
  const [feedRate, setFeedRate] = useState(60); // % Load
  
  const [metrics, setMetrics] = useState({
    throughput: 2450, // t/h
    motorPower: 450, // kW
    beltTensionHead: 145, // kN
    beltSlip: 0.2, // %
    efficiency: 92.5 // %
  });

  const [simTension, setSimTension] = useState(TENSION_PROFILE);
  const [flowTrend, setFlowTrend] = useState(FLOW_HISTORY);

  // Simulation Logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // Physics Simulation
        // Power ~ Speed * Load
        const loadFactor = feedRate / 100;
        const power = 300 + (beltSpeed / 5) * loadFactor * 500 + (Math.random()-0.5)*10;
        
        // Slip increases with Load if Speed is low (Torque limit)
        const slip = (loadFactor > 0.8 && beltSpeed < 2) ? 2.5 + Math.random() : 0.2 + Math.random()*0.1;

        // Throughput = Speed * CrossSection * Density
        const tph = beltSpeed * loadFactor * 1200; // Approx factor

        setMetrics({
            throughput: tph,
            motorPower: power,
            beltTensionHead: 100 + loadFactor * 100 + (beltSpeed/5)*20,
            beltSlip: slip,
            efficiency: 95 - slip * 2 - (power > 800 ? 5 : 0)
        });

        // Update Charts
        setSimTension(prev => prev.map(p => ({
            ...p,
            dynamic: p.tension + loadFactor * (p.dist / 1000) * 50 + Math.sin(Date.now()/500 + p.dist)*5
        })));

        setFlowTrend(prev => {
            const next = [...prev.slice(1), { time: Date.now(), flow: tph }];
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, beltSpeed, feedRate]);

  return (
    <div className="h-full w-full relative bg-[#0b0a09] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-belt-conveyor" 
            simData={{ 
                speed: isRunning ? beltSpeed : 0, 
                load: feedRate 
            }} 
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0b0a09_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <MoveRight size={14} /> CONTINUOUS TRANSPORT SYSTEM
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 皮带输送系统 <span className="text-orange-500">动态仿真平台</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto">
              <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Throughput</div>
                  <div className="text-3xl font-mono font-bold text-white">{metrics.throughput.toFixed(0)} <span className="text-sm text-slate-500">t/h</span></div>
              </div>
              <div className="text-right border-l border-slate-700 pl-6">
                  <div className="text-[10px] text-slate-400 uppercase">Belt Speed</div>
                  <div className="text-3xl font-mono font-bold text-cyan-400">{beltSpeed.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
              </div>
              <div className="text-right border-l border-slate-700 pl-6">
                  <div className="text-[10px] text-slate-400 uppercase">Motor Power</div>
                  <div className="text-3xl font-mono font-bold text-orange-400">{metrics.motorPower.toFixed(0)} <span className="text-sm text-slate-500">kW</span></div>
              </div>
          </div>
      </div>

      {/* Left Panel: Drive & Tension */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Drive Diagnostics */}
          <SciFiCard title="驱动系统诊断 (Drive)" subtitle="VFD STATUS" className="border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 p-1">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Zap size={14} className="text-yellow-500"/> Current
                      </div>
                      <span className="font-mono font-bold text-white">450 A</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <RotateCw size={14} className="text-cyan-500"/> Torque
                      </div>
                      <span className="font-mono font-bold text-white">8500 Nm</span>
                  </div>
                  
                  <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Slip Ratio</span>
                          <span className={`${metrics.beltSlip > 2 ? 'text-red-500' : 'text-green-400'}`}>{metrics.beltSlip.toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${metrics.beltSlip > 2 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${metrics.beltSlip*20}%`}}></div>
                      </div>
                  </div>
              </div>
          </SciFiCard>

          {/* Tension Chart */}
          <SciFiCard title="皮带张力分布" subtitle="TENSION (kN)" className="flex-1 border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simTension}>
                          <defs>
                              <linearGradient id="gradTen" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#442a1d" vertical={false} />
                          <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                          <Area type="monotone" dataKey="dynamic" stroke="#f97316" fill="url(#gradTen)" strokeWidth={2} name="Dynamic Tension" />
                          <Line type="monotone" dataKey="tension" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Static Limit" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* Right Panel: Health & Flow */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Belt Health */}
          <SciFiCard title="输送带健康监测" subtitle="NON-DESTRUCTIVE" className="h-[280px] border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase">Splice Integrity</div>
                          <div className="text-lg font-bold text-green-400">98%</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase">Cover Wear</div>
                          <div className="text-lg font-bold text-yellow-400">2.5 mm</div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                      <div className="text-xs text-slate-400 mb-2">Idler Temperature Map</div>
                      <div className="space-y-1">
                          {IDLER_HEATMAP.map((item, i) => (
                              <div key={i} className="flex justify-between items-center p-1.5 rounded bg-slate-800/30">
                                  <span className="text-[10px] text-slate-300">{item.section}</span>
                                  <div className="flex items-center gap-2">
                                      <div className={`w-16 h-1.5 rounded-full overflow-hidden bg-slate-700`}>
                                          <div className={`h-full ${item.temp > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${item.temp}%`}}></div>
                                      </div>
                                      <span className={`text-[10px] font-mono ${item.temp > 80 ? 'text-red-400' : 'text-white'}`}>{item.temp}°C</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </SciFiCard>

          {/* Flow Trend */}
          <SciFiCard title="瞬时流量趋势 (t/h)" subtitle="LAST 1H" className="flex-1 border-orange-900/50 bg-[#1a0f0a]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={flowTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#442a1d" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={[0, 4000]} stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} labelFormatter={() => ''} />
                          <Line type="monotone" dataKey="flow" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
                          <ReferenceLine y={3000} stroke="red" strokeDasharray="3 3" label={{value:'Max Cap', fill:'red', fontSize:10}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-[#1a0f0a]/95 backdrop-blur border border-orange-500/50 rounded-full px-8 py-3 flex gap-8 items-center shadow-2xl">
              
              <button 
                 onClick={() => setIsRunning(!isRunning)}
                 className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105
                     ${isRunning ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_#f97316]' : 'bg-green-600 border-green-400 text-white'}
                 `}
              >
                  {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" ml-1 />}
              </button>

              <div className="flex flex-col w-48 gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>BELT SPEED</span>
                      <span className="text-cyan-400">{beltSpeed.toFixed(1)} m/s</span>
                  </div>
                  <input 
                     type="range" min="0" max="6" step="0.1" 
                     value={beltSpeed} onChange={(e) => setBeltSpeed(parseFloat(e.target.value))}
                     className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
              </div>

              <div className="w-px h-8 bg-slate-600"></div>

              <div className="flex flex-col w-48 gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>FEED RATE</span>
                      <span className="text-orange-400">{feedRate}%</span>
                  </div>
                  <input 
                     type="range" min="0" max="120" step="5" 
                     value={feedRate} onChange={(e) => setFeedRate(parseFloat(e.target.value))}
                     className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
              </div>

              <button className="p-2 rounded-full bg-red-900/50 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors" title="Emergency Stop">
                  <AlertTriangle size={20} />
              </button>

          </div>
      </div>

    </div>
  );
};
