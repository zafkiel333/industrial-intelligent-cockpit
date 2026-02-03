import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Filter, Activity, Settings, RefreshCw, 
  Droplets, AlertCircle, ArrowDownUp, Zap,
  Gauge, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, Scatter,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA ---

// Tromp Curve (Partition Curve)
const generateTrompData = (d50: number, ep: number) => {
    const data = [];
    for(let size=0; size<=100; size+=2) {
        // Logistic function for partition curve
        const partition = 100 / (1 + Math.exp(1.0986 * (d50 - size) / ep));
        data.push({ size, partition });
    }
    return data;
};

// Particle Size Distribution (Feed)
const FEED_PSD = Array.from({length: 10}, (_, i) => ({
    sizeRange: `${i*10}-${(i+1)*10}µm`,
    percent: Math.random() * 20
}));

export const MineSlurrySimView: React.FC = () => {
  // --- STATE ---
  const [pressure, setPressure] = useState(150); // kPa
  const [density, setDensity] = useState(30); // % Solids
  const [viscosity, setViscosity] = useState(1.0); // cP
  
  const [metrics, setMetrics] = useState({
    d50: 25, // Cut point (microns)
    ep: 0.05, // Ecart Probable (Sharpness of separation)
    underflowRatio: 40, // % to underflow
    overflowRatio: 60,
    efficiency: 85
  });

  const [trompData, setTrompData] = useState<any[]>([]);

  // Simulation Logic
  useEffect(() => {
      // D50 approx proportional to Viscosity, Inverse to Pressure^0.5
      // d50 = K1 * (mu^0.5) / (P^0.25)
      const k1 = 50;
      const newD50 = k1 * Math.pow(viscosity, 0.5) / Math.pow(pressure, 0.25);
      
      // Ep approx proportional to Density
      const newEp = 0.02 + (density / 100) * 0.1;
      
      setMetrics(prev => ({
          d50: newD50,
          ep: newEp,
          underflowRatio: 30 + (density/100)*20,
          overflowRatio: 100 - (30 + (density/100)*20),
          efficiency: 100 - newEp * 200 // Mock eff
      }));

      setTrompData(generateTrompData(newD50, newEp * 100)); // Scale EP for visual

  }, [pressure, density, viscosity]);

  return (
    <div className="h-full w-full relative bg-[#06041a] text-indigo-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-slurry" 
            simData={{ 
                pressure,
                d50: metrics.d50
            }} 
          />
          {/* Fluid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#06041a_100%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f0b29]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Filter size={14} /> HYDRO-CYCLONE SIMULATION
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿浆流动 <span className="text-cyan-500">& 分级效率仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Cut Point (d50)</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.d50.toFixed(1)} <span className="text-sm text-slate-500">µm</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-indigo-800"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Classification Eff</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.efficiency > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                       {metrics.efficiency.toFixed(1)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Process Parameters */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Controls */}
          <div className="bg-[#0f0b29]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 运行参数控制
              </h3>
              
              <div className="space-y-5">
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Gauge size={12}/> Feed Pressure</span>
                          <span className="font-mono text-cyan-400">{pressure} kPa</span>
                      </div>
                      <input 
                        type="range" min="50" max="300" step="5" 
                        value={pressure} onChange={(e) => setPressure(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Layers size={12}/> Pulp Density</span>
                          <span className="font-mono text-indigo-400">{density}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="60" step="1" 
                        value={density} onChange={(e) => setDensity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-2"><Droplets size={12}/> Viscosity</span>
                          <span className="font-mono text-blue-400">{viscosity.toFixed(1)} cP</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="5.0" step="0.1" 
                        value={viscosity} onChange={(e) => setViscosity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>
              </div>

              <div className="mt-6 flex justify-center">
                  <button onClick={() => {setPressure(150); setDensity(30); setViscosity(1.0);}} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                      <RefreshCw size={12}/> Reset Defaults
                  </button>
              </div>
          </div>

          {/* Feed Distribution */}
          <SciFiCard title="给矿粒度分布 (Feed PSD)" subtitle="HISTOGRAM" className="flex-1 border-cyan-900/50 bg-[#0f0b29]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={FEED_PSD} layout="vertical" margin={{left: 10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#312e81" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="sizeRange" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                          <Tooltip cursor={{fill: '#1e1b4b'}} contentStyle={{backgroundColor: '#0f0b29', borderColor: '#06b6d4', color: '#fff'}} />
                          <Bar dataKey="percent" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10}>
                              {FEED_PSD.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index > 5 ? '#f59e0b' : '#6366f1'} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT PANEL: Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Tromp Curve */}
          <SciFiCard title="分级效率曲线 (Tromp Curve)" subtitle="d50 Analysis" className="h-[320px] border-cyan-900/50 bg-[#0f0b29]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trompData} margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                          <XAxis dataKey="size" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Size (µm)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Partition %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#0f0b29', borderColor: '#06b6d4', color: '#fff'}} />
                          <ReferenceLine x={metrics.d50} stroke="#f59e0b" strokeDasharray="3 3" label={{value: 'd50', fill: '#f59e0b', fontSize: 10}} />
                          <Line type="monotone" dataKey="partition" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                      <span>Ep: <span className="text-white">{metrics.ep.toFixed(3)}</span></span>
                      <span>Sharpness: <span className={metrics.ep < 0.06 ? 'text-green-400' : 'text-yellow-400'}>{metrics.ep < 0.06 ? 'Good' : 'Fair'}</span></span>
                  </div>
              </div>
          </SciFiCard>

          {/* Mass Balance */}
          <SciFiCard title="质量平衡 (Mass Balance)" className="flex-1 border-cyan-900/50 bg-[#0f0b29]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full justify-center">
                  <div className="flex items-center gap-3 p-3 bg-indigo-900/20 rounded border border-indigo-800/50">
                      <ArrowDownUp size={20} className="text-cyan-400" />
                      <div className="flex-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Overflow (Fine)</span>
                              <span className="font-bold text-cyan-200">{metrics.overflowRatio.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-cyan-500 h-full" style={{width: `${metrics.overflowRatio}%`}}></div>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded border border-orange-800/50">
                      <ArrowDownUp size={20} className="text-orange-400 rotate-180" />
                      <div className="flex-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Underflow (Coarse)</span>
                              <span className="font-bold text-orange-200">{metrics.underflowRatio.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-orange-500 h-full" style={{width: `${metrics.underflowRatio}%`}}></div>
                          </div>
                      </div>
                  </div>

                  <div className="mt-auto p-2 bg-slate-900/50 rounded border border-slate-700 flex items-center gap-2">
                      <AlertCircle size={14} className="text-yellow-500"/>
                      <span className="text-[10px] text-slate-400">
                          Optimal d50 range: 20-30 µm. Adjust pressure to fine-tune.
                      </span>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};