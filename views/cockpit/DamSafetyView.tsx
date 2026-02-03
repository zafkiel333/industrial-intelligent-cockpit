
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, BarChart, Bar, ReferenceLine, Scatter, Cell
} from 'recharts';
import { 
  Activity, Ruler, Droplets, ShieldCheck, 
  ArrowDown, ArrowUp, AlertTriangle, Layers, 
  Maximize2, GitCommit, Thermometer
} from 'lucide-react';

// --- MOCK DATA ---

// Uplift Pressure Distribution (Base of Dam: Heel -> Toe)
const UPLIFT_DATA = [
  { pos: '0m (Heel)', pressure: 85, limit: 100 },
  { pos: '10m', pressure: 65, limit: 80 },
  { pos: '20m', pressure: 45, limit: 60 }, // Grout curtain effect
  { pos: '30m', pressure: 35, limit: 50 },
  { pos: '40m', pressure: 28, limit: 40 },
  { pos: '50m', pressure: 22, limit: 30 },
  { pos: '60m (Toe)', pressure: 15, limit: 25 },
];

// Displacement Trend (Crown Cantilever)
const DISPLACEMENT_TREND = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    radial: 2.5 + Math.sin(i * 0.2) * 0.5, // mm (Downstream +)
    tangential: 0.2 + Math.cos(i * 0.2) * 0.1, // mm
    temp: 18 + Math.sin(i * 0.1) * 2 // Air Temp effect
}));

// Stress Distribution (Dam Blocks)
const STRESS_BLOCKS = [
    { id: 'BL-05', stress: 2.4, status: 'Normal' },
    { id: 'BL-06', stress: 2.8, status: 'Normal' },
    { id: 'BL-07', stress: 3.5, status: 'Warning' }, // High stress zone
    { id: 'BL-08', stress: 3.1, status: 'Normal' },
    { id: 'BL-09', stress: 2.2, status: 'Normal' },
];

export const DamSafetyView: React.FC = () => {
  // --- STATE ---
  const [safetyStatus, setSafetyStatus] = useState({
    fos: 1.85, // Factor of Safety (Sliding)
    reservoirLevel: 145.2, // m
    tailWaterLevel: 24.5, // m
    seepageTotal: 12.5, // L/min
    maxDisp: 3.2, // mm
    pga: 0.02, // g (Seismic)
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setSafetyStatus(prev => ({
            ...prev,
            reservoirLevel: 145.2 + Math.sin(Date.now()/5000) * 0.05,
            seepageTotal: 12.5 + (Math.random() - 0.5) * 0.2,
            pga: Math.random() > 0.95 ? 0.05 : 0.02, // Occasional seismic noise
            maxDisp: 3.2 + Math.sin(Date.now()/8000) * 0.01
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] bg-[#0b1121] text-slate-200 overflow-hidden relative">
      
      {/* HEADER: Structural Integrity Theme */}
      <div className="flex items-end justify-between border-b border-indigo-900/50 pb-3 px-4 bg-gradient-to-r from-[#1e1b4b] to-transparent z-10 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <ShieldCheck size={14} className="animate-pulse" /> Structural Health Monitoring
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             大坝安全 <span className="text-indigo-500">& 水工建筑驾驶舱</span>
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">DAM-05</span>
          </h1>
        </div>
        
        {/* Key Safety Indicators */}
        <div className="flex gap-8">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1"><GitCommit size={10}/> Stability (FoS)</div>
                <div className="text-2xl font-mono font-bold text-green-400">{safetyStatus.fos.toFixed(2)}</div>
            </div>
            <div className="text-right border-l border-indigo-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1"><Droplets size={10}/> Total Seepage</div>
                <div className="text-2xl font-mono font-bold text-blue-300">{safetyStatus.seepageTotal.toFixed(1)} <span className="text-sm text-slate-500">L/min</span></div>
            </div>
            <div className="text-right border-l border-indigo-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1"><Activity size={10}/> Seismic (PGA)</div>
                <div className={`text-2xl font-mono font-bold ${safetyStatus.pga > 0.04 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                    {safetyStatus.pga.toFixed(3)} <span className="text-sm text-slate-500">g</span>
                </div>
            </div>
        </div>
      </div>

      {/* UPPER SECTION: Immersive Digital Twin & Environment */}
      <div className="h-[45%] flex gap-4 px-2 relative z-0">
          
          {/* Main 3D View */}
          <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-indigo-800/30 rounded-lg relative overflow-hidden shadow-2xl group">
              {/* Floating Labels */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-xs text-blue-200">
                      <span className="text-slate-400 mr-2">UPSTREAM LEVEL</span>
                      <span className="font-bold font-mono text-lg">{safetyStatus.reservoirLevel.toFixed(2)} m</span>
                  </div>
              </div>
              <div className="absolute top-4 right-4 z-10">
                  <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-xs text-slate-300">
                      <span className="text-slate-400 mr-2">DOWNSTREAM LEVEL</span>
                      <span className="font-bold font-mono">{safetyStatus.tailWaterLevel.toFixed(2)} m</span>
                  </div>
              </div>

              {/* Sensor Nodes Overlay (Simulated) */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-500/50 rounded-full animate-ping pointer-events-none transform -translate-x-12 -translate-y-8"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full pointer-events-none transform -translate-x-12 -translate-y-8"></div>

              <ThreeScene type="dam" color="#6366f1" />
          </div>

          {/* Environmental Side Panel */}
          <div className="w-64 flex flex-col gap-3">
              <SciFiCard title="环境载荷" className="flex-1 border-indigo-900/50 bg-[#0f172a]/60">
                  <div className="flex flex-col gap-4 h-full justify-center">
                      <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs text-slate-400">Air Temp</span>
                          <span className="font-mono text-orange-300">24.5 °C</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs text-slate-400">Water Temp (Top)</span>
                          <span className="font-mono text-blue-300">18.2 °C</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs text-slate-400">Water Temp (Bot)</span>
                          <span className="font-mono text-blue-500">12.5 °C</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                          <span className="text-xs text-slate-400">Rainfall (24h)</span>
                          <span className="font-mono text-white">0.0 mm</span>
                      </div>
                  </div>
              </SciFiCard>
          </div>
      </div>

      {/* LOWER SECTION: Engineering Console */}
      <div className="flex-1 grid grid-cols-3 gap-4 px-2 pb-2 min-h-0">
          
          {/* Panel 1: Deformation Analysis */}
          <SciFiCard title="大坝变形监测 (Deformation)" subtitle="PLUMB LINE" className="border-indigo-900/50 bg-[#0c101b]">
              <div className="w-full h-full flex flex-col">
                  <div className="flex justify-between text-[10px] text-slate-500 px-2 mb-2">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Radial (Downstream)</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Temperature</span>
                  </div>
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={DISPLACEMENT_TREND}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis yAxisId="disp" stroke="#6366f1" tick={{fontSize: 10}} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#6366f1' }} domain={[0, 5]} />
                              <YAxis yAxisId="temp" orientation="right" stroke="#f97316" tick={{fontSize: 10}} domain={[10, 30]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#6366f1'}} />
                              <Area yAxisId="disp" type="monotone" dataKey="radial" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </SciFiCard>

          {/* Panel 2: Uplift Pressure (Safety Core) */}
          <SciFiCard title="坝基扬压力分布 (Uplift Pressure)" subtitle="SECTION 7#" className="border-indigo-900/50 bg-[#0c101b]">
              <div className="w-full h-full flex flex-col">
                  <div className="flex-1 min-h-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={UPLIFT_DATA} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                              <defs>
                                  <linearGradient id="upliftGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="pos" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'kPa', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                              <Area type="stepAfter" dataKey="limit" stroke="#ef4444" fill="none" strokeDasharray="5 5" name="Design Limit" />
                              <Area type="monotone" dataKey="pressure" stroke="#0ea5e9" fill="url(#upliftGrad)" name="Measured" />
                          </AreaChart>
                      </ResponsiveContainer>
                      
                      {/* Diagram Overlay Hint */}
                      <div className="absolute top-2 right-2 flex flex-col items-end pointer-events-none opacity-70">
                          <div className="text-[9px] text-slate-400">HEEL <span className="text-slate-600">--------&gt;</span> TOE</div>
                          <div className="text-[9px] text-slate-500">Flow Direction</div>
                      </div>
                  </div>
                  <div className="h-8 border-t border-slate-800 flex items-center justify-between px-2">
                      <span className="text-xs text-slate-400">Osmotic Coefficient: <span className="text-green-400">0.24</span></span>
                      <span className="text-xs text-slate-400">Drainage Eff: <span className="text-blue-400">High</span></span>
                  </div>
              </div>
          </SciFiCard>

          {/* Panel 3: Stress & Joint */}
          <SciFiCard title="混凝土应力与接缝 (Stress/Joint)" subtitle="STRUCTURAL" className="border-indigo-900/50 bg-[#0c101b]">
              <div className="w-full h-full flex flex-col gap-4">
                  
                  {/* Stress Bars */}
                  <div className="flex-1 min-h-0">
                      <div className="text-[10px] text-slate-500 mb-1">Max Principal Stress (MPa)</div>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={STRESS_BLOCKS} layout="vertical" margin={{left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 5]} />
                              <YAxis dataKey="id" type="category" stroke="#64748b" tick={{fontSize: 10}} width={30} />
                              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#cbd5e1'}} />
                              <Bar dataKey="stress" barSize={12} radius={[0, 4, 4, 0]}>
                                  {STRESS_BLOCKS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.status === 'Warning' ? '#f59e0b' : '#6366f1'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>

                  {/* Joint Meter */}
                  <div className="h-16 bg-slate-900/50 border border-slate-800 rounded p-2 flex items-center justify-between">
                      <div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1"><Maximize2 size={10}/> Joint J-12 Opening</div>
                          <div className="text-lg font-bold text-white font-mono">1.24 <span className="text-xs text-slate-500 font-normal">mm</span></div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] text-slate-500">Trend</div>
                          <div className="text-xs text-yellow-400 font-bold">+0.02 mm/y</div>
                      </div>
                  </div>

              </div>
          </SciFiCard>

      </div>
    </div>
  );
};
