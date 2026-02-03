
import React, { useState, useEffect } from 'react';
import { BearingLifeScene } from '../../../components/predictive/hydro-bearing/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  ComposedChart, Cell
} from 'recharts';
import { 
  Activity, Thermometer, Droplets, RotateCw, 
  AlertTriangle, Gauge, ArrowRight, Crosshair, 
  Layers, History, TrendingDown, Clock, ShieldCheck,
  CheckCircle2, FileText
} from 'lucide-react';

// --- Mock Data ---

// RUL Degradation Curve (Health Index over Time)
const RUL_DATA = Array.from({length: 30}, (_, i) => {
    const t = i; // Months
    // Linear degradation with some noise
    const actual = i < 15 ? 100 - i * 0.5 + (Math.random()-0.5) : null;
    const pred = 100 - i * 0.55; 
    const lower = pred - i * 0.2;
    const upper = pred + i * 0.1;
    return { 
        month: `M${i}`, 
        actual, 
        pred, 
        range: [lower, upper],
        limit: 40 
    };
});

// Load Distribution across 12 Pads
const PAD_LOAD_DATA = Array.from({length: 12}, (_, i) => ({
    pad: `#${i+1}`,
    load: 85 + Math.random() * 10 + (i === 4 ? 20 : 0), // Pad 5 overloading
    temp: 65 + Math.random() * 5 + (i === 4 ? 15 : 0)
}));

// Oil Analysis Trend
const OIL_DATA = Array.from({length: 12}, (_, i) => ({
    week: `W${i}`,
    viscosity: 45 + Math.sin(i*0.5)*2,
    water: 15 + i * 2, // Increasing water content
    particles: 120 + i * 5
}));

export const BearingLifePredictionView: React.FC = () => {
  // --- STATE ---
  const [rpm, setRpm] = useState(500);
  const [thrustLoad, setThrustLoad] = useState(1250); // tons
  const [oilFilm, setOilFilm] = useState(45); // microns
  const [padTemps, setPadTemps] = useState(Array(12).fill(65));
  const [selectedPad, setSelectedPad] = useState<number | null>(null);
  
  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        
        // Sim fluctuating values
        setRpm(500 + Math.sin(t) * 2);
        setThrustLoad(1250 + Math.sin(t*0.5) * 50);
        setOilFilm(45 + Math.cos(t) * 2);

        // Update Pad Temps (Simulate Pad 5 hot spot)
        setPadTemps(prev => prev.map((val, i) => {
            const base = 65 + (i === 4 ? 20 : 0); // Hot spot on pad 5 (index 4)
            return base + Math.sin(t + i) * 1 + (Math.random()-0.5);
        }));

    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Calculate RUL stats
  const currentHealth = 92.5;
  const daysRemaining = 450;

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-amber-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 mb-1 uppercase tracking-wider">
             <Layers size={14} className="animate-pulse" />
             Tribology & Life Cycle Management
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             导轴承与推力轴承 <span className="text-amber-500">剩余寿命预测 (RUL)</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Estimated RUL</div>
                <div className="text-3xl font-mono font-bold text-white">{daysRemaining} <span className="text-sm text-slate-500">days</span></div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Health Index</div>
                <div className="text-3xl font-mono font-bold text-green-400">{currentHealth.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Max Pad Temp</div>
                <div className={`text-2xl font-mono font-bold ${Math.max(...padTemps) > 80 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                    {Math.max(...padTemps).toFixed(1)} <span className="text-sm text-slate-500">°C</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Real-time Status */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Load Distribution */}
           <SciFiCard title="推力瓦受力分布" subtitle="LOAD (TONS)" className="h-[300px] border-amber-900/50 bg-[#080502]" noPadding>
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={PAD_LOAD_DATA} layout="vertical" margin={{left: 0, right: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" horizontal={false} />
                           <XAxis type="number" stroke="#78350f" hide />
                           <YAxis dataKey="pad" type="category" stroke="#d97706" width={30} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Bar dataKey="load" barSize={12} radius={[0, 4, 4, 0]}>
                               {PAD_LOAD_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.load > 100 ? '#ef4444' : '#f59e0b'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Oil Analysis */}
           <SciFiCard title="润滑油质分析" subtitle="CONDITION" className="flex-1 border-amber-900/50">
               <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Viscosity (40°C)</div>
                           <div className="text-lg font-bold text-white">46.2 <span className="text-xs font-normal text-slate-500">cSt</span></div>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Water Content</div>
                           <div className="text-lg font-bold text-yellow-400">185 <span className="text-xs font-normal text-slate-500">ppm</span></div>
                       </div>
                   </div>
                   
                   <div className="flex-1 min-h-[100px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={OIL_DATA}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="week" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} name="Water" />
                               <Line type="monotone" dataKey="particles" stroke="#94a3b8" strokeWidth={2} dot={false} name="Particles" />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#020202] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)]">
               
               {/* Overlays */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/70 backdrop-blur border border-amber-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-amber-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Layers size={12} /> Oil Film Thickness
                       </div>
                       <div className="flex items-end gap-2">
                           <span className="text-3xl font-mono font-bold text-white leading-none">{oilFilm.toFixed(1)}</span>
                           <span className="text-xs text-slate-400 mb-1">μm</span>
                       </div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{width: `${(oilFilm/60)*100}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Selected Pad Info */}
               {selectedPad !== null && selectedPad >= 0 && (
                   <div className="absolute top-4 right-4 z-10 w-48 bg-black/80 backdrop-blur border border-slate-600 rounded p-3 animate-in fade-in slide-in-from-right-4">
                       <div className="text-xs font-bold text-white border-b border-slate-700 pb-1 mb-2">Pad #{selectedPad + 1} Detail</div>
                       <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                           <div>Temp:</div><div className="text-right font-mono text-amber-400">{padTemps[selectedPad]?.toFixed(1) || '--'}°C</div>
                           <div>Load:</div><div className="text-right font-mono text-white">{PAD_LOAD_DATA[selectedPad]?.load.toFixed(1) || '--'}t</div>
                           <div>Pressure:</div><div className="text-right font-mono text-white">4.2 MPa</div>
                           <div>Status:</div><div className="text-right font-bold text-green-400">OK</div>
                       </div>
                   </div>
               )}

               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 text-[10px] bg-black/60 px-4 py-1.5 rounded-full border border-slate-700 backdrop-blur">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Cold Pad</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Normal</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Overheat</div>
               </div>

               <BearingLifeScene 
                   rpm={rpm}
                   padTemperatures={padTemps}
                   oilFilmThickness={oilFilm}
                   selectedPadIndex={selectedPad}
                   onPadSelect={(idx) => setSelectedPad(idx === -1 ? null : idx)}
                   showOilFlow={true}
               />
           </div>

           {/* Prediction Chart */}
           <SciFiCard title="剩余寿命预测与退化轨迹" subtitle="RUL PROJECTION" className="h-[250px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={RUL_DATA}>
                           <defs>
                               <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Health Index', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <ReferenceLine y={40} stroke="red" strokeDasharray="3 3" label={{value: 'Failure Threshold', fill: 'red', fontSize: 10}} />
                           
                           {/* Confidence Interval (Simulated with Area) */}
                           <Area type="monotone" dataKey="range" stroke="none" fill="#334155" fillOpacity={0.3} />
                           
                           <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{r:2}} name="Actual Health" />
                           <Line type="monotone" dataKey="pred" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Recommendations */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Degradation Factors */}
           <SciFiCard title="退化归因分析" subtitle="CONTRIBUTORS" className="flex-1 border-amber-900/50">
               <div className="flex flex-col gap-3 h-full">
                   {[
                       { name: 'Thermal Cycling', val: 45, color: 'bg-red-500' },
                       { name: 'Contamination', val: 25, color: 'bg-orange-500' },
                       { name: 'Start/Stop Freq', val: 20, color: 'bg-yellow-500' },
                       { name: 'Normal Wear', val: 10, color: 'bg-green-500' }
                   ].map((item, i) => (
                       <div key={i}>
                           <div className="flex justify-between text-xs mb-1">
                               <span className="text-slate-300">{item.name}</span>
                               <span className="text-white font-bold">{item.val}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${item.color}`} style={{width: `${item.val}%`}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Maintenance Decision */}
           <SciFiCard title="智能维护决策" className="border-amber-900/50">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400">
                           <AlertTriangle size={14} /> Recommended Action
                       </div>
                       <p className="text-sm text-white">Schedule pad inspection and oil filtering.</p>
                       <div className="text-[10px] text-slate-500 mt-1">Due: Within 30 days</div>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Spare Parts Availability</span>
                           <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> In Stock</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Est. Downtime</span>
                           <span className="text-white font-mono">48 Hours</span>
                       </div>
                   </div>

                   <button className="w-full py-2 bg-amber-700/30 hover:bg-amber-600/50 border border-amber-500/50 rounded text-xs text-amber-100 transition-colors flex items-center justify-center gap-2">
                       <FileText size={12} /> Generate Work Order
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
