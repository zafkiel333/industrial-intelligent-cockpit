import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Zap, Wind, CloudSnow, Plane, Wifi, MapPin, 
  Thermometer, AlertTriangle, Radio, Navigation 
} from 'lucide-react';

export const TransmissionView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
    totalLoad: 1450, // MW
    frequency: 50.02,
    voltageDev: 0.8, // %
    windSpeed: 4.2, // m/s
    iceThickness: 0.5, // mm
    coronaNoise: 45, // dB
  });

  const [droneStatus, setDroneStatus] = useState({
    id: 'D-X402',
    battery: 85,
    altitude: 120,
    speed: 15,
    status: 'Patrolling'
  });

  const [loadTrend, setLoadTrend] = useState(() => 
    Array.from({ length: 24 }, (_, i) => ({
      time: i,
      load: 1200 + Math.random() * 300,
      capacity: 1800
    }))
  );

  // Mock Thermal Data for Grid
  const [thermalPoints, setThermalPoints] = useState([
     { id: 1, temp: 45, status: 'normal' },
     { id: 2, temp: 48, status: 'normal' },
     { id: 3, temp: 82, status: 'warning' }, // Hotspot
     { id: 4, temp: 42, status: 'normal' },
  ]);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalLoad: prev.totalLoad + (Math.random() - 0.5) * 15,
        frequency: 50.00 + (Math.random() - 0.5) * 0.05,
        voltageDev: Math.abs(prev.voltageDev + (Math.random() - 0.5) * 0.1),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 0.5),
        iceThickness: prev.iceThickness, // Static for now
        coronaNoise: 40 + Math.random() * 10,
      }));

      // Simulate Drone Movement
      setDroneStatus(prev => ({
        ...prev,
        altitude: Math.max(50, prev.altitude + (Math.random() - 0.5) * 5),
        battery: Math.max(0, prev.battery - 0.05),
      }));

      // Blink Thermal Warning
      setThermalPoints(prev => prev.map(p => 
        p.status === 'warning' 
        ? { ...p, temp: 80 + Math.random() * 5 }
        : p
      ));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-violet-50 selection:bg-violet-500/30">
      
      {/* HEADER: Specific to Transmission */}
      <div className="flex items-end justify-between border-b border-violet-500/30 pb-4 bg-gradient-to-r from-violet-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider">
             <Zap size={12} className="animate-pulse" />
             ULTRA-HIGH VOLTAGE GRID / UHV-AC
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-violet-400 text-shadow-glow">输电装置</span> 智能运维指挥中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">LINE-500kV</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Zap size={10}/> Total Load</div>
                <div className="text-2xl font-mono font-bold text-violet-300">{metrics.totalLoad.toFixed(1)} <span className="text-sm text-slate-500">MW</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Wind size={10}/> Cross Wind</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{metrics.windSpeed.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><CloudSnow size={10}/> Icing Load</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.iceThickness.toFixed(2)} <span className="text-sm text-slate-500">mm</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Inspection & Environment */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Drone Status */}
           <SciFiCard title="智能巡检无人机" subtitle="AUTONOMOUS UNIT" className="border-violet-900/50 bg-[#0a0514]/80">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-900/30 rounded-full flex items-center justify-center border border-violet-500/50">
                          <Plane className="text-violet-300" size={20} />
                      </div>
                      <div>
                          <div className="text-xs text-slate-400">UNIT ID</div>
                          <div className="font-bold text-white font-mono">{droneStatus.id}</div>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-green-400 animate-pulse">● {droneStatus.status}</div>
                      <div className="text-xs text-slate-500">Task: Line L4-S2</div>
                  </div>
              </div>
              
              <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Battery Level</span>
                      <span className="text-violet-200">{droneStatus.battery.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500" style={{width: `${droneStatus.battery}%`}}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white/5 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500">ALTITUDE</div>
                          <div className="text-lg font-mono">{droneStatus.altitude.toFixed(0)}m</div>
                      </div>
                      <div className="bg-white/5 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500">SPEED</div>
                          <div className="text-lg font-mono">{droneStatus.speed}m/s</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Environmental Threats */}
           <SciFiCard title="气象灾害预警" className="flex-1 border-violet-900/50">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded">
                    <AlertTriangle className="text-red-500" />
                    <div>
                        <div className="text-xs text-red-400 font-bold uppercase">High Risk</div>
                        <div className="text-xs text-slate-300">Section S4-15: Galloping detected</div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-2 border-b border-dashed border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-2"><CloudSnow size={14}/> 覆冰预警</span>
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded">Low Risk</span>
                 </div>
                 <div className="flex items-center justify-between p-2 border-b border-dashed border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-2"><Wind size={14}/> 舞动监测</span>
                    <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded">Moderate</span>
                 </div>
                 <div className="flex items-center justify-between p-2">
                    <span className="text-xs text-slate-400 flex items-center gap-2"><Zap size={14}/> 雷击密度</span>
                    <span className="text-xs font-mono text-violet-300">0.02 /km²</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 bg-[#050308] border border-violet-900/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(139,92,246,0.1)]">
              {/* HUD Map Overlay (Top Left) */}
              <div className="absolute top-4 left-4 z-10 w-48 p-2 bg-black/60 border border-violet-500/30 backdrop-blur rounded">
                 <div className="flex items-center justify-between text-[10px] text-violet-400 mb-2">
                    <span className="flex items-center gap-1"><MapPin size={10}/> TOPOLOGY</span>
                    <span className="animate-pulse">LIVE</span>
                 </div>
                 <div className="h-24 w-full border border-dashed border-slate-700 relative opacity-80">
                    {/* Abstract Mini Map */}
                    <svg width="100%" height="100%">
                       <line x1="10%" y1="80%" x2="40%" y2="40%" stroke="#8b5cf6" strokeWidth="2" />
                       <line x1="40%" y1="40%" x2="80%" y2="20%" stroke="#8b5cf6" strokeWidth="2" />
                       <line x1="40%" y1="40%" x2="70%" y2="80%" stroke="#4b5563" strokeWidth="1" strokeDasharray="4 2" />
                       <circle cx="10%" cy="80%" r="3" fill="#a78bfa" />
                       <circle cx="40%" cy="40%" r="4" fill="#fff" className="animate-ping" />
                       <circle cx="40%" cy="40%" r="3" fill="#8b5cf6" />
                       <circle cx="80%" cy="20%" r="3" fill="#a78bfa" />
                    </svg>
                 </div>
              </div>

              {/* Status Indicators (Top Right) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                 <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-violet-500/30 text-xs text-violet-200">
                    Insulator Leaking Current: <span className="font-mono font-bold text-white">0.4 mA</span>
                 </div>
                 <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-violet-500/30 text-xs text-violet-200">
                    Sag Rate: <span className="font-mono font-bold text-white">2.1 %</span>
                 </div>
              </div>

              <ThreeScene type="transmission" color="#a855f7" />
           </div>

           {/* Load Curve */}
           <SciFiCard title="线路负荷趋势 (24H)" subtitle="LOAD PROFILE" className="h-48 border-violet-900/50" noPadding>
              <div className="w-full h-full p-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadTrend}>
                       <defs>
                          <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                       <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} interval={3} />
                       <YAxis stroke="#666" tick={{fontSize: 10}} domain={[0, 2000]} />
                       <Tooltip contentStyle={{backgroundColor: '#0f0718', borderColor: '#8b5cf6', color: '#fff'}} />
                       <Area type="monotone" dataKey="load" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorLoad)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Thermal & Diagnostics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Infrared Diagnosis */}
           <SciFiCard title="红外热像诊断" subtitle="IR IMAGING" className="border-violet-900/50">
              <div className="flex flex-col gap-4">
                 <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-950 to-purple-900 rounded overflow-hidden border border-white/10">
                    {/* Simulated Heatmap visual */}
                    <div className="absolute inset-0 opacity-50 mix-blend-screen" style={{
                       backgroundImage: 'radial-gradient(circle at 70% 30%, #fef08a 0%, #ef4444 20%, transparent 60%)'
                    }}></div>
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-1 rounded">CAM-04 (TOWER #12)</div>
                    
                    {/* Crosshair */}
                    <div className="absolute top-[30%] left-[70%] w-6 h-6 border border-white/50 rounded-full flex items-center justify-center">
                       <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="absolute top-[30%] left-[75%] text-xs font-bold text-red-400 bg-black/70 px-1 rounded">
                       82.4°C
                    </div>
                 </div>

                 <div className="space-y-2">
                    {thermalPoints.map(p => (
                       <div key={p.id} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                          <span className="text-slate-400">Connector Type-A #{p.id}</span>
                          <div className="flex items-center gap-2">
                             <span className={`font-mono font-bold ${p.status === 'warning' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                {p.temp.toFixed(1)}°C
                             </span>
                             {p.status === 'warning' && <AlertTriangle size={12} className="text-red-500" />}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           {/* Audio Spectrum / Corona */}
           <SciFiCard title="电晕噪声频谱" className="flex-1 border-violet-900/50">
               <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                  <Radio size={14} className="text-violet-400" /> 
                  <span>Microphone Array Gain: +12dB</span>
               </div>
               <div className="h-32 w-full flex items-end gap-1 pb-2 border-b border-slate-700">
                  {Array.from({length: 16}).map((_, i) => (
                     <div key={i} className="flex-1 bg-violet-500/30 rounded-t-sm transition-all duration-300 relative overflow-hidden group">
                        <div 
                           className="absolute bottom-0 w-full bg-violet-400 group-hover:bg-violet-300 transition-all" 
                           style={{
                              height: `${20 + Math.random() * 60}%`,
                              opacity: i === 6 || i === 7 ? 1 : 0.6 // Peak around 6/7
                           }}
                        ></div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                  <span>100Hz</span>
                  <span>1kHz</span>
                  <span>10kHz</span>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};