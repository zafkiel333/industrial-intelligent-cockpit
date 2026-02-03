
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Scatter, ScatterChart
} from 'recharts';
import { 
  Waves, AlertTriangle, Mountain, Ruler, CloudRain, 
  Droplets, Activity, Eye, Zap, Wind, Navigation
} from 'lucide-react';

// --- CONSTANTS ---
const RAIN_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    rain: Math.random() > 0.8 ? Math.random() * 5 : 0, // Intermittent rain
    level: 42.5 + Math.sin(i * 0.2) * 0.1
}));

const DISPLACEMENT_DATA = Array.from({length: 10}, (_, i) => ({
    id: `GNSS-${i+1}`,
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: -0.5 - Math.random() // Subsidence
}));

// Saturation Line Data (Cross section profile)
const DAM_PROFILE = [
    { x: 0, y: 0 }, { x: 20, y: 15 }, { x: 30, y: 15 }, { x: 60, y: 0 }
];
const SATURATION_LINE = [
    { x: 20, y: 12 }, { x: 30, y: 10 }, { x: 45, y: 5 }, { x: 60, y: 1 }
];

export const TailingsSafetyView: React.FC = () => {
  // --- STATE ---
  const [damStatus, setDamStatus] = useState({
    waterLevel: 42.5, // m
    capacity: 78.5, // %
    dryBeachLen: 125, // m (Critical safety param)
    seepageFlow: 4.2, // L/s
    turbidity: 1.5, // NTU
    rainfall: 0, // mm (current)
    riskLevel: 'LOW' as 'LOW' | 'MED' | 'HIGH'
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setDamStatus(prev => ({
            ...prev,
            waterLevel: 42.5 + Math.sin(Date.now()/5000) * 0.1,
            seepageFlow: 4.2 + (Math.random()-0.5) * 0.1,
            rainfall: Math.random() > 0.9 ? Math.random() * 2 : 0,
            dryBeachLen: 125 - Math.sin(Date.now()/5000) * 0.5 // Inverse to water level
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0c0c0c] text-slate-200 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-cyan-900/50 pb-4 px-2 bg-gradient-to-r from-slate-900/80 to-transparent z-10">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-500 mb-1 uppercase tracking-wider">
             <Mountain size={14} /> Geological Safety Monitor
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿库安全监测 <span className="text-cyan-500">预警驾驶舱</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Waves size={12}/> Reservoir Level</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{damStatus.waterLevel.toFixed(2)} <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Ruler size={12}/> Dry Beach</div>
                <div className={`text-2xl font-mono font-bold ${damStatus.dryBeachLen < 100 ? 'text-red-500' : 'text-yellow-400'}`}>
                    {damStatus.dryBeachLen.toFixed(1)} <span className="text-sm text-slate-500">m</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Risk Level</div>
                <div className="text-2xl font-bold text-green-500 bg-green-900/20 px-3 rounded border border-green-800/30">
                    {damStatus.riskLevel}
                </div>
            </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Structural Stability */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="坝体位移矢量 (GNSS)" subtitle="DEFORMATION" className="h-[280px] border-slate-800 bg-slate-900/40" noPadding>
                  <div className="w-full h-full p-2 relative">
                      {/* Custom Scatter Plot for Displacement Vector */}
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis type="number" dataKey="x" name="East (mm)" unit="mm" stroke="#666" domain={[-5, 5]} />
                              <YAxis type="number" dataKey="y" name="North (mm)" unit="mm" stroke="#666" domain={[-5, 5]} />
                              <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000'}} />
                              <Scatter name="Displacement" data={DISPLACEMENT_DATA} fill="#f59e0b" shape="circle" />
                          </ScatterChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-black/60 px-2 rounded">
                          Max Sub: -1.8mm
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="内部应力与渗压" className="flex-1 border-slate-800">
                  <div className="flex flex-col gap-4">
                      <div className="p-3 bg-slate-900/50 border border-slate-700 rounded flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Activity size={18} className="text-purple-400" />
                              <div>
                                  <div className="text-xs text-slate-400">Total Stress (Avg)</div>
                                  <div className="text-lg font-bold text-white">245 kPa</div>
                              </div>
                          </div>
                          <div className="h-8 w-1 bg-purple-500/50 rounded"></div>
                      </div>
                      <div className="p-3 bg-slate-900/50 border border-slate-700 rounded flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <Droplets size={18} className="text-blue-400" />
                              <div>
                                  <div className="text-xs text-slate-400">Pore Pressure</div>
                                  <div className="text-lg font-bold text-white">42 kPa</div>
                              </div>
                          </div>
                          <div className="h-8 w-1 bg-blue-500/50 rounded"></div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin & Saturation Line */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* 3D DAM MODEL */}
              <div className="flex-1 bg-[#050505] border border-cyan-900/30 rounded relative overflow-hidden group">
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-cyan-500/30 flex items-center gap-2">
                          <Eye size={14} className="text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-100">Live Digital Twin</span>
                      </div>
                  </div>
                  
                  {/* Rain Overlay Effect */}
                  {damStatus.rainfall > 0 && (
                      <div className="absolute top-4 right-4 z-20 bg-blue-900/40 backdrop-blur px-3 py-1.5 rounded border border-blue-500/30 flex items-center gap-2 animate-pulse">
                          <CloudRain size={14} className="text-blue-300" />
                          <span className="text-xs font-bold text-blue-100">Heavy Rain Alert</span>
                      </div>
                  )}

                  <ThreeScene type="dam" color="#0891b2" />
              </div>

              {/* SATURATION LINE ANALYSIS (Critical for Dams) */}
              <SciFiCard title="浸润线剖面透视 (Saturation Line Analysis)" subtitle="SECTION A-A" className="h-[220px] border-cyan-900/50 bg-slate-900/20" noPadding>
                  <div className="w-full h-full p-4 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="x" type="number" stroke="#666" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis dataKey="y" type="number" stroke="#666" tick={{fontSize: 10}} label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 20]} />
                              <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#0891b2'}} />
                              
                              {/* Dam Structure Profile */}
                              <Area dataKey="y" data={DAM_PROFILE} fill="#475569" stroke="none" fillOpacity={0.5} name="Dam Body" />
                              
                              {/* Saturation Line (Phreatic Line) */}
                              <Line dataKey="y" data={SATURATION_LINE} stroke="#0ea5e9" strokeWidth={2} dot={false} name="Saturation Line" />
                              
                              {/* Alert Limit */}
                              <Line dataKey="y" data={SATURATION_LINE.map(p => ({x: p.x, y: p.y + 2}))} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Alert Limit" />
                          </ComposedChart>
                      </ResponsiveContainer>
                      <div className="absolute top-4 right-4 text-[10px] text-cyan-400 bg-black/50 px-2 py-1 rounded border border-cyan-800">
                          安全超高: 2.5m
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Hydro-Met */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Rain & Level Correlation */}
              <SciFiCard title="雨量与水位关联" subtitle="HYDRO-MET" className="h-[280px] border-slate-800">
                  <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={RAIN_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="hour" stroke="#666" tick={{fontSize: 10}} interval={3} />
                              <YAxis yAxisId="left" stroke="#0ea5e9" tick={{fontSize: 10}} label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill:'#0ea5e9' }} domain={[40, 45]} />
                              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight', fontSize: 10, fill:'#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#000'}} />
                              <Bar yAxisId="right" dataKey="rain" fill="#64748b" barSize={10} radius={[2, 2, 0, 0]} opacity={0.5} />
                              <Line yAxisId="left" type="monotone" dataKey="level" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Seepage Monitoring */}
              <SciFiCard title="渗流监测" className="flex-1 border-slate-800">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Total Seepage</span>
                          <span className="font-mono font-bold text-white">{damStatus.seepageFlow.toFixed(2)} L/s</span>
                      </div>
                      
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs text-slate-400">Turbidity (NTU)</span>
                              <span className={`text-sm font-bold ${damStatus.turbidity > 5 ? 'text-red-500' : 'text-green-400'}`}>
                                  {damStatus.turbidity.toFixed(1)}
                              </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${damStatus.turbidity > 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(damStatus.turbidity/10)*100}%`}}></div>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">High turbidity indicates internal erosion (piping).</div>
                      </div>

                      <div className="p-3 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-3">
                          <AlertTriangle className="text-red-500" size={20} />
                          <div>
                              <div className="text-xs font-bold text-red-200">Alert Threshold</div>
                              <div className="text-[10px] text-slate-400">Seepage &gt; 10 L/s triggers Evac</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
