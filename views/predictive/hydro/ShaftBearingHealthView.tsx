
import React, { useState, useEffect } from 'react';
import { ShaftBearingScene } from '../../../components/predictive/hydro-shaft/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { 
  Activity, Thermometer, Droplets, RotateCw, 
  AlertTriangle, Gauge, ArrowUpRight, Crosshair, 
  Layers, Zap
} from 'lucide-react';

// --- Mock Data ---

// 12 Pads temperature
const INITIAL_PAD_TEMPS = [65, 66, 68, 72, 75, 74, 70, 68, 66, 65, 64, 64];

// Runout history for orbit
const generateOrbitData = (eccentricity: number, noise: number) => {
    const points = [];
    for(let i=0; i<360; i+=5) {
        const rad = i * Math.PI / 180;
        // Elliptical orbit with noise
        const r = 50 + Math.cos(2*rad) * eccentricity + (Math.random()-0.5)*noise;
        points.push({
            x: r * Math.cos(rad),
            y: r * Math.sin(rad)
        });
    }
    return points;
};

// Vibration Spectrum
const SPECTRUM_DATA = [
    { freq: '0.5X', amp: 12 },
    { freq: '1X', amp: 85 }, // Unbalance dominant
    { freq: '2X', amp: 15 }, // Misalignment
    { freq: '3X', amp: 5 },
    { freq: '4X', amp: 2 },
    { freq: '5X', amp: 1 },
];

export const ShaftBearingHealthView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    rpm: 150,
    oilTemp: 45.2,
    oilFilm: 45, // microns
    thrustLoad: 850, // tons
    vibrationX: 125, // um
    vibrationY: 118, // um
  });

  const [orbitData, setOrbitData] = useState<any[]>([]);
  const [padTemps, setPadTemps] = useState<number[]>(INITIAL_PAD_TEMPS);
  const [filmTrend, setFilmTrend] = useState<any[]>([]);

  // Simulation
  useEffect(() => {
    // Init trend
    const initTrend = Array.from({length: 30}, (_, i) => ({
        time: i, value: 45 + Math.random()*2
    }));
    setFilmTrend(initTrend);

    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      
      // 1. Dynamics
      setMetrics(prev => ({
          rpm: 150 + Math.sin(t) * 0.5,
          oilTemp: 45.2 + Math.sin(t*0.1) * 0.5,
          oilFilm: 45 + Math.sin(t*2) * 2,
          thrustLoad: 850 + Math.sin(t*0.5) * 10,
          vibrationX: 125 + (Math.random()-0.5)*10,
          vibrationY: 118 + (Math.random()-0.5)*10
      }));

      // 2. Pad Temps (Heat spot rotation effect)
      setPadTemps(prev => {
          // Slowly rotate a hot spot
          const hotIdx = Math.floor((t % 12)); 
          return prev.map((base, i) => {
              const dist = Math.abs(i - hotIdx);
              const heat = dist < 2 ? (2 - dist) * 5 : 0; 
              return Math.min(95, base + heat + (Math.random()-0.5));
          });
      });

      // 3. Orbit Update
      setOrbitData(generateOrbitData(10 + Math.sin(t)*5, 2));

      // 4. Trend Update
      setFilmTrend(prev => {
          const last = prev[prev.length-1].time;
          return [...prev.slice(1), { time: last+1, value: 45 + Math.sin(t*2)*2 + Math.random() }];
      });

    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#03060e] text-blue-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-blue-900/40 pb-4 bg-gradient-to-r from-blue-950/30 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <RotateCw size={14} className="animate-spin" style={{animationDuration:'5s'}} />
             Rotary Machinery Health
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水轮机主轴与 <span className="text-blue-500">推力轴承健康监测</span>
          </h1>
        </div>
        
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Rotation Speed</div>
                <div className="text-3xl font-mono font-bold text-white">{metrics.rpm.toFixed(1)} <span className="text-sm text-slate-500">rpm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Thrust Load</div>
                <div className="text-3xl font-mono font-bold text-blue-400">{metrics.thrustLoad.toFixed(0)} <span className="text-sm text-slate-500">t</span></div>
            </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Vibration & Orbit */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Shaft Orbit */}
           <SciFiCard title="轴心轨迹 (Orbit Plot)" subtitle="X-Y PLANE" className="h-[320px] border-blue-900/50 bg-[#080c16]/80" noPadding>
               <div className="w-full h-full p-2 relative flex flex-col items-center justify-center">
                   <div className="absolute inset-0 flex items-center justify-center">
                       {/* Polar Grid Background */}
                       <div className="w-48 h-48 rounded-full border border-slate-800"></div>
                       <div className="w-32 h-32 rounded-full border border-slate-800 absolute"></div>
                       <div className="w-[1px] h-full bg-slate-800 absolute"></div>
                       <div className="h-[1px] w-full bg-slate-800 absolute"></div>
                   </div>
                   
                   <div className="h-56 w-full relative z-10">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                               <XAxis type="number" dataKey="x" domain={[-80, 80]} hide />
                               <YAxis type="number" dataKey="y" domain={[-80, 80]} hide />
                               <Scatter name="Orbit" data={orbitData} fill="#3b82f6" line={{stroke: '#3b82f6', strokeWidth: 2}} lineType="fitting" />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>

                   <div className="flex justify-between w-full px-4 text-xs font-mono mt-2">
                       <div>
                           <div className="text-slate-500">X-Peak</div>
                           <div className="text-white">{metrics.vibrationX.toFixed(0)} μm</div>
                       </div>
                       <div>
                           <div className="text-slate-500">Y-Peak</div>
                           <div className="text-white">{metrics.vibrationY.toFixed(0)} μm</div>
                       </div>
                       <div>
                           <div className="text-slate-500">Smax</div>
                           <div className="text-red-400">142 μm</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Vibration Spectrum */}
           <SciFiCard title="振动频谱分析 (FFT)" subtitle="HARMONICS" className="flex-1 border-blue-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SPECTRUM_DATA} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', color: '#fff'}} />
                           <Bar dataKey="amp" fill="#3b82f6" barSize={20}>
                               {SPECTRUM_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.freq === '1X' ? '#ef4444' : '#3b82f6'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           <div className="flex-1 bg-[#020408] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(59,130,246,0.1)]">
               
               {/* HUD Overlays */}
               <div className="absolute top-4 left-4 z-10 space-y-2">
                   <div className="bg-black/60 backdrop-blur border border-blue-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Layers size={12} /> Thrust Bearing Oil Film
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{metrics.oilFilm.toFixed(1)}</span>
                           <span className="text-xs text-slate-400 mb-1">μm</span>
                       </div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-red-500 via-green-500 to-green-500" style={{width: `${(metrics.oilFilm/60)*100}%`}}></div>
                       </div>
                   </div>
               </div>

               <div className="absolute top-4 right-4 z-10">
                   <div className="bg-black/60 backdrop-blur border border-blue-500/20 px-3 py-2 rounded text-right">
                       <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex items-center justify-end gap-2">
                           <Thermometer size={12} /> Avg Pad Temp
                       </div>
                       <div className="flex items-end justify-end gap-2">
                           <span className="text-3xl font-mono font-bold text-yellow-400 leading-none">
                               {(padTemps.reduce((a,b)=>a+b,0)/padTemps.length).toFixed(1)}
                           </span>
                           <span className="text-xs text-slate-400 mb-1">°C</span>
                       </div>
                   </div>
               </div>

               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                   <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30 text-xs text-blue-200">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       System Status: OPTIMAL
                   </div>
               </div>

               {/* The 3D Component */}
               <ShaftBearingScene 
                   rpm={metrics.rpm} 
                   runoutX={metrics.vibrationX} 
                   runoutY={metrics.vibrationY}
                   oilFilmThickness={metrics.oilFilm}
                   padTemperatures={padTemps}
               />
           </div>

           {/* Film Thickness Trend */}
           <SciFiCard title="油膜厚度变化趋势" subtitle="MICRONS" className="h-[200px] border-blue-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={filmTrend}>
                           <defs>
                               <linearGradient id="colorFilm" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis domain={[30, 60]} stroke="#64748b" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', color: '#fff'}} />
                           <ReferenceLine y={35} stroke="red" strokeDasharray="3 3" label={{value:'Alarm', fill:'red', fontSize:10}} />
                           <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorFilm)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Bearing Pads Detail */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Polar Heatmap of Pads */}
           <SciFiCard title="推力瓦温度分布" subtitle="THERMAL MAP" className="flex-1 border-blue-900/50 bg-[#080c16]/80">
               <div className="flex flex-col items-center justify-center h-full relative">
                   {/* Custom Polar Visualization */}
                   <div className="relative w-56 h-56">
                       {padTemps.map((temp, i) => {
                           const angle = (i * 30) - 90; // 12 pads, 30 deg each
                           const rad = angle * Math.PI / 180;
                           const x = 50 + 35 * Math.cos(rad); // % position
                           const y = 50 + 35 * Math.sin(rad);
                           
                           // Color mapping
                           let color = 'bg-blue-500';
                           if (temp > 85) color = 'bg-red-500 animate-pulse';
                           else if (temp > 75) color = 'bg-yellow-500';
                           else if (temp > 65) color = 'bg-green-500';

                           return (
                               <div 
                                 key={i}
                                 className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                 style={{ left: `${x}%`, top: `${y}%` }}
                               >
                                   <div className={`w-8 h-6 rounded-sm ${color} border border-slate-900 opacity-80 shadow-lg flex items-center justify-center`}>
                                       <span className="text-[9px] font-bold text-black">{temp.toFixed(0)}</span>
                                   </div>
                                   <span className="text-[8px] text-slate-500 mt-0.5">#{i+1}</span>
                               </div>
                           );
                       })}
                       {/* Center Shaft Ref */}
                       <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2 border-4 border-slate-700 flex items-center justify-center">
                           <div className="text-[8px] text-slate-500">SHAFT</div>
                       </div>
                   </div>
                   
                   <div className="w-full mt-4 px-4">
                       <div className="flex justify-between text-xs border-b border-slate-800 pb-1 mb-1">
                           <span className="text-slate-400">Max Temp</span>
                           <span className="text-red-400 font-bold">{Math.max(...padTemps).toFixed(1)} °C</span>
                       </div>
                       <div className="flex justify-between text-xs">
                           <span className="text-slate-400">Spread</span>
                           <span className="text-white font-mono">{(Math.max(...padTemps) - Math.min(...padTemps)).toFixed(1)} °C</span>
                       </div>
                   </div>
               </div>
           </SciFiCard>

           {/* Oil Quality */}
           <SciFiCard title="润滑油液监测" className="border-blue-900/50">
               <div className="space-y-3">
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Droplets size={14} className="text-yellow-500" />
                           <span className="text-xs text-slate-300">Moisture Content</span>
                       </div>
                       <span className="text-sm font-bold text-white">45 ppm</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Activity size={14} className="text-slate-400" />
                           <span className="text-xs text-slate-300">Particle Count (ISO)</span>
                       </div>
                       <span className="text-sm font-bold text-green-400">14/11/08</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Gauge size={14} className="text-blue-400" />
                           <span className="text-xs text-slate-300">Oil Pressure</span>
                       </div>
                       <span className="text-sm font-bold text-white">4.2 MPa</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
