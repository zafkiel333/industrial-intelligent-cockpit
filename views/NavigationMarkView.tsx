import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  AreaChart, Area, Legend, LineChart, Line
} from 'recharts';
import { 
  Lightbulb, Radio, BatteryCharging, Locate, AlertTriangle, 
  Map as MapIcon, Wifi, Sun, Anchor 
} from 'lucide-react';

export const NavigationMarkView: React.FC = () => {
  // --- STATE ---
  const [buoyStatus, setBuoyStatus] = useState({
    id: 'NB-A12',
    type: 'Special Mark',
    lat: 34.2145,
    lon: 122.4582,
    drift: 12.5, // meters from sinker
    battery: 88.5, // %
    solarInput: 14.2, // V
    lightStatus: false, // On/Off
    signalStrength: -65 // dBm
  });

  const [driftHistory, setDriftHistory] = useState<any[]>([]);
  const [energyHistory, setEnergyHistory] = useState<any[]>([]);

  // Simulate Drift (Random Walk)
  useEffect(() => {
    // Init drift points for scatter plot
    const initDrift = Array.from({length: 50}, () => {
        const r = Math.random() * 20;
        const theta = Math.random() * 2 * Math.PI;
        return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
    });
    setDriftHistory(initDrift);

    // Init Energy
    const initEnergy = Array.from({length: 24}, (_, i) => ({
        time: i,
        battery: 80 + Math.sin(i * 0.2) * 10,
        solar: i > 6 && i < 18 ? Math.sin((i-6)/12 * Math.PI) * 100 : 0
    }));
    setEnergyHistory(initEnergy);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Buoy Dynamics
      setBuoyStatus(prev => ({
        ...prev,
        drift: 10 + Math.sin(time * 0.1) * 5 + (Math.random()-0.5)*2,
        battery: Math.max(0, Math.min(100, prev.battery + (Math.random()-0.5)*0.1)),
        solarInput: 12 + Math.random() * 2,
        lightStatus: (time % 4 < 0.5), // Sync roughly with 3D anim
        signalStrength: -65 + Math.floor((Math.random()-0.5)*5)
      }));

      // 2. Update Drift Scatter
      setDriftHistory(prev => {
          const r = 10 + Math.sin(time * 0.1) * 5;
          const theta = (time * 0.2) % (2 * Math.PI);
          const newPoint = { x: r * Math.cos(theta), y: r * Math.sin(theta) };
          return [...prev.slice(1), newPoint];
      });

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-yellow-50 selection:bg-yellow-500/30">
      
      {/* HEADER: Distinct Style - Deep Ocean / Signal Yellow */}
      <div className="flex items-end justify-between border-b border-yellow-500/30 pb-4 bg-gradient-to-r from-slate-950/80 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 uppercase tracking-wider">
             <Radio size={12} className="animate-pulse" />
             AIDS TO NAVIGATION (AtoN)
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-yellow-400 text-shadow-glow">航标</span> 智能运维指挥中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">BUOY-NB-A12</span>
          </h1>
        </div>
        
        {/* Top KPIs - Minimalist Grid */}
        <div className="grid grid-cols-3 gap-6 text-right">
             <div className="border-r border-yellow-900/30 pr-6">
                 <div className="text-[10px] text-slate-500 uppercase">Watch Circle Status</div>
                 <div className="text-xl font-bold text-green-400 flex items-center justify-end gap-2">
                    <Anchor size={14} /> SECURE
                 </div>
             </div>
             <div className="border-r border-yellow-900/30 pr-6">
                 <div className="text-[10px] text-slate-500 uppercase">Light Availability</div>
                 <div className="text-xl font-bold text-yellow-400 flex items-center justify-end gap-2">
                    <Lightbulb size={14} className={buoyStatus.lightStatus ? 'text-white' : 'text-yellow-900'} /> 99.98%
                 </div>
             </div>
             <div>
                 <div className="text-[10px] text-slate-500 uppercase">Last Position Fix</div>
                 <div className="text-xl font-mono text-white">0s ago</div>
             </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Positioning (Radar Style) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Drift Radar */}
           <SciFiCard title="锚位漂移监控" subtitle="WATCH CIRCLE" className="flex-1 border-yellow-900/50 bg-[#080808]">
              <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center text-xs px-2 mb-2">
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Limit (30m)
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Position
                      </div>
                      <div className="font-mono text-yellow-500">Drift: {buoyStatus.drift.toFixed(1)}m</div>
                  </div>
                  
                  <div className="flex-1 relative w-full min-h-[250px] border border-slate-800 rounded-full bg-slate-900/30 overflow-hidden">
                      {/* Radar Grid */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[80%] h-[80%] border border-dashed border-slate-700 rounded-full"></div>
                          <div className="w-[50%] h-[50%] border border-slate-700 rounded-full absolute"></div>
                          <div className="w-full h-[1px] bg-slate-800 absolute"></div>
                          <div className="h-full w-[1px] bg-slate-800 absolute"></div>
                      </div>

                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                            <XAxis type="number" dataKey="x" name="Easting" domain={[-35, 35]} hide />
                            <YAxis type="number" dataKey="y" name="Northing" domain={[-35, 35]} hide />
                            <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#eab308'}} />
                            <ReferenceLine x={0} stroke="#334155" />
                            <ReferenceLine y={0} stroke="#334155" />
                            {/* Anchor Point */}
                            <Scatter name="Anchor" data={[{x:0, y:0}]} fill="#fff" shape="cross" />
                            {/* Drift Points */}
                            <Scatter name="Drift" data={driftHistory} fill="#eab308" fillOpacity={0.6} />
                        </ScatterChart>
                      </ResponsiveContainer>
                  </div>
              </div>
           </SciFiCard>

           {/* Location Info */}
           <SciFiCard className="border-yellow-900/50">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-900/20 rounded-full text-yellow-400">
                           <LocateIcon />
                       </div>
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase">GNSS Coordinates</div>
                           <div className="font-mono text-lg text-white">{buoyStatus.lat.toFixed(4)} N</div>
                           <div className="font-mono text-lg text-white">{buoyStatus.lon.toFixed(4)} E</div>
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                           <Wifi size={12} /> RSSI
                       </div>
                       <div className="font-mono font-bold text-green-400">{buoyStatus.signalStrength} dBm</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 bg-gradient-to-b from-[#1a1c23] to-[#020617] border border-yellow-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(234,179,8,0.1)]">
              
              {/* Flash Characteristic Viz */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-400 font-mono border border-slate-600 px-1 rounded">FL.Y.4s</span>
                     <div className={`w-3 h-3 rounded-full ${buoyStatus.lightStatus ? 'bg-yellow-400 shadow-[0_0_10px_#eab308]' : 'bg-slate-800'}`}></div>
                 </div>
              </div>

              {/* ID Badge */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                 <div className="bg-yellow-500/10 backdrop-blur px-4 py-1 rounded border border-yellow-500/30 text-center">
                    <div className="text-xs text-yellow-200 font-bold tracking-widest">{buoyStatus.id}</div>
                    <div className="text-[8px] text-yellow-500/70 uppercase">Special Mark</div>
                 </div>
              </div>

              <ThreeScene type="buoy" color="#eab308" />
           </div>

           {/* Wave & Impact Analysis */}
           <SciFiCard title="波浪与冲击监测" subtitle="6-DOF IMU" className="h-[200px] border-yellow-900/50" noPadding>
              <div className="grid grid-cols-2 h-full">
                  <div className="p-4 border-r border-slate-800 flex flex-col justify-center items-center">
                      <div className="relative w-24 h-24 rounded-full border border-slate-700 flex items-center justify-center">
                          <div className="absolute inset-0 border-t-2 border-yellow-500 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
                          <div className="text-center">
                              <div className="text-2xl font-bold text-white">12°</div>
                              <div className="text-[10px] text-slate-500">Max Tilt</div>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 flex flex-col justify-center gap-4">
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-slate-400">Heave (Vertical)</span>
                             <span className="text-yellow-400">1.2m</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 animate-pulse" style={{width: '40%'}}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span className="text-slate-400">Impact Force</span>
                             <span className="text-green-400">0.2g</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{width: '10%'}}></div>
                          </div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Power & Diagnostics */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Energy System */}
           <SciFiCard title="能源微网状态" subtitle="SOLAR / BATTERY" className="flex-1 border-yellow-900/50">
              <div className="flex flex-col gap-6">
                  {/* Battery Status */}
                  <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded border border-slate-800">
                      <BatteryCharging size={32} className={buoyStatus.battery > 20 ? 'text-green-400' : 'text-red-500'} />
                      <div className="flex-1">
                          <div className="flex justify-between items-end mb-1">
                              <span className="text-xs text-slate-400 uppercase">Battery Bank</span>
                              <span className="text-xl font-mono font-bold text-white">{buoyStatus.battery.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{width: `${buoyStatus.battery}%`}}></div>
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                              <span>12.4 V</span>
                              <span>Est. Run: 14 days</span>
                          </div>
                      </div>
                  </div>

                  {/* Solar Charging Graph */}
                  <div className="flex-1 min-h-[150px]">
                      <div className="flex items-center gap-2 mb-2 text-xs text-yellow-500">
                          <Sun size={14} /> Solar Charging Profile (24h)
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={energyHistory}>
                            <defs>
                                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} interval={5} />
                            <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#eab308'}} />
                            <Area type="monotone" dataKey="solar" stroke="#eab308" fill="url(#colorSolar)" />
                        </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
           </SciFiCard>

           {/* Alert Log */}
           <SciFiCard title="系统告警日志" className="border-yellow-900/50">
              <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-red-900/10 border border-red-900/30 rounded">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5" />
                      <div>
                          <div className="text-xs font-bold text-red-300">MOISTURE DETECTED</div>
                          <div className="text-[10px] text-slate-400">Sensor 2 (Battery Comp) - 10:42 AM</div>
                      </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-slate-900/50 border border-slate-800 rounded opacity-60">
                      <AlertTriangle size={14} className="text-slate-500 mt-0.5" />
                      <div>
                          <div className="text-xs font-bold text-slate-300">LOW SOLAR EFFICIENCY</div>
                          <div className="text-[10px] text-slate-500">Yesterday - 08:00 AM</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};

// Helper Icon
const LocateIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <circle cx="12" cy="12" r="10"></circle>
    </svg>
);