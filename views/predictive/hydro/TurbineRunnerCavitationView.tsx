
import React, { useState, useEffect } from 'react';
import { RunnerCavitationScene } from '../../../components/predictive/hydro-runner/ThreeScene';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { 
  Activity, Droplets, AlertTriangle, Disc, 
  Search, Waves, Thermometer, ShieldAlert,
  ArrowRight, FileText, Zap, Microscope, Settings
} from 'lucide-react';

// --- Mock Data ---

const ACOUSTIC_SPECTRUM = Array.from({length: 50}, (_, i) => ({
    freq: i * 2, // kHz
    db: Math.random() * 20 + (i > 30 ? 60 : 20) // High freq noise for cavitation
}));

const CRACK_GROWTH_PREDICTION = Array.from({length: 24}, (_, i) => {
    const month = i + 1;
    // Exponential growth model
    const length = 2 * Math.exp(0.08 * month);
    return { month: `M+${month}`, length: length, limit: 15 };
});

const BLADE_STRESS_MAP = [
    { blade: 'B1', stress: 120, cav: 10 },
    { blade: 'B2', stress: 115, cav: 12 },
    { blade: 'B3', stress: 180, cav: 45 }, // Critical
    { blade: 'B4', stress: 130, cav: 15 },
    { blade: 'B5', stress: 125, cav: 10 },
    { blade: 'B6', stress: 140, cav: 20 },
    { blade: 'B7', stress: 160, cav: 35 }, // Warning
    { blade: 'B8', stress: 110, cav: 8 },
    { blade: 'B9', stress: 112, cav: 9 },
];

export const TurbineRunnerCavitationView: React.FC = () => {
  // --- STATE ---
  const [rpm, setRpm] = useState(150);
  const [cavitationIndex, setCavitationIndex] = useState(0.15); // Sigma
  const [efficiency, setEfficiency] = useState(92.5); // %
  const [noiseLevel, setNoiseLevel] = useState(85); // dB
  const [crackDepth, setCrackDepth] = useState(3.2); // mm
  
  // Real-time Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      
      // Cavitation bursts (randomized)
      const burst = Math.random() > 0.8 ? Math.random() * 0.1 : 0;
      
      setCavitationIndex(prev => Math.max(0.05, 0.15 + Math.sin(t*0.2)*0.02 - burst)); // Lower sigma = worse cavitation
      setNoiseLevel(85 + burst * 100 + Math.random()*5);
      
      // Crack growth (very slow in reality, simulated here)
      // setCrackDepth(prev => prev + 0.0001); 

    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Derived Severity for Visuals
  // Low sigma -> High Cavitation Intensity
  const cavitationIntensity = Math.min(100, Math.max(0, (0.2 - cavitationIndex) * 500)); 
  const crackSeverity = (crackDepth / 10) * 100;

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-sky-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-sky-900/40 pb-4 bg-gradient-to-r from-sky-950/30 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 mb-1 uppercase tracking-wider">
             <Waves size={14} className="animate-pulse" />
             Hydro-Mechanical Integrity
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             水轮机转轮 <span className="text-sky-500">空蚀与裂纹劣化预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Thoma Sigma (σ)</div>
                <div className={`text-2xl font-mono font-bold ${cavitationIndex < 0.1 ? 'text-red-500 animate-pulse' : 'text-sky-300'}`}>
                    {cavitationIndex.toFixed(3)}
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Acoustic Emission</div>
                <div className="text-3xl font-mono font-bold text-white">{noiseLevel.toFixed(1)} <span className="text-sm text-slate-500">dB</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Max Crack Depth</div>
                <div className="text-2xl font-mono font-bold text-orange-400">{crackDepth.toFixed(2)} <span className="text-sm text-slate-500">mm</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: 3D Twin & Controls */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#000000] border border-sky-900/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(14,165,233,0.1)]">
               
               {/* Overlays */}
               <div className="absolute top-4 left-4 z-10 space-y-2">
                   <div className="bg-black/70 backdrop-blur border border-sky-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-sky-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <Droplets size={12} /> Cavitation Intensity
                       </div>
                       <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-blue-500 to-white animate-pulse" style={{width: `${cavitationIntensity}%`}}></div>
                       </div>
                       <div className="text-right text-[10px] text-white mt-1">{cavitationIntensity.toFixed(0)}%</div>
                   </div>

                   <div className="bg-black/70 backdrop-blur border border-red-500/20 px-3 py-2 rounded">
                       <div className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-2">
                           <AlertTriangle size={12} /> Crack Propagation Risk
                       </div>
                       <div className="text-lg font-bold text-white">{crackSeverity > 20 ? 'HIGH' : 'LOW'}</div>
                   </div>
               </div>

               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 text-[10px] bg-black/60 px-4 py-1.5 rounded-full border border-slate-700 backdrop-blur">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div> Cavitation Bubbles</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div> Stress/Crack Zone</div>
               </div>

               <RunnerCavitationScene 
                   rpm={rpm}
                   cavitationIntensity={cavitationIntensity}
                   crackSeverity={crackSeverity}
                   showStressMap={true}
               />
           </div>

           {/* Blade Stress Analysis */}
           <SciFiCard title="叶片应力与空蚀分布" subtitle="BLADE HEALTH MAP" className="h-[200px] border-sky-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={BLADE_STRESS_MAP} barSize={20}>
                           <defs>
                               <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                                   <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/>
                               </linearGradient>
                               <linearGradient id="cavGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8}/>
                                   <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="blade" stroke="#64748b" tick={{fontSize: 10}} />
                           <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{fontSize: 10}} label={{ value: 'Erosion (mm)', angle: 90, position: 'insideRight', fill: '#38bdf8', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#38bdf8'}} />
                           <Bar yAxisId="left" dataKey="stress" fill="url(#stressGrad)" radius={[2,2,0,0]} />
                           <Bar yAxisId="right" dataKey="cav" fill="url(#cavGrad)" radius={[2,2,0,0]} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Detailed Analytics */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
           
           {/* Acoustic Spectrum (AE) */}
           <SciFiCard title="声发射信号频谱 (AE Spectrum)" subtitle="EARLY DETECTION" className="h-[250px] border-sky-900/50" noPadding>
               <div className="w-full h-full p-4 flex flex-col">
                   <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                       <span>Sensor: AE-04 (Draft Tube)</span>
                       <span className="text-orange-400 flex items-center gap-1"><AlertTriangle size={10} /> High Frequency Energy Detected</span>
                   </div>
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ACOUSTIC_SPECTRUM}>
                               <defs>
                                   <linearGradient id="aeFill" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Frequency (kHz)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                               <Area type="monotone" dataKey="db" stroke="#f59e0b" strokeWidth={1} fill="url(#aeFill)" isAnimationActive={false} />
                               {/* Cavitation Signature Zone */}
                               <ReferenceLine x={60} stroke="rgba(255,255,255,0.2)" label={{value: 'Cavitation Zone', fill: '#fff', fontSize: 10, position: 'insideTop'}} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           <div className="flex flex-row gap-5 flex-1 min-h-[250px]">
               
               {/* Crack Growth Prediction */}
               <SciFiCard title="裂纹扩展预测 (Fatigue)" subtitle="RUL" className="flex-1 border-sky-900/50" noPadding>
                   <div className="w-full h-full p-4">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={CRACK_GROWTH_PREDICTION}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Crack Length (mm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                               <ReferenceLine y={15} stroke="red" strokeDasharray="3 3" label={{value: 'Critical', fill: 'red', fontSize: 10}} />
                               <Line type="monotone" dataKey="length" stroke="#ef4444" strokeWidth={2} dot={false} />
                           </LineChart>
                       </ResponsiveContainer>
                       <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded border border-red-900/50">
                           <div className="text-[10px] text-slate-400">Est. Failure</div>
                           <div className="text-sm font-bold text-red-400">14 Months</div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Maintenance Strategy */}
               <SciFiCard title="智能维护策略" className="w-1/3 border-sky-900/50">
                   <div className="flex flex-col gap-3 h-full">
                       <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
                           <div className="text-xs font-bold text-red-300 flex items-center gap-1 mb-1"><ShieldAlert size={12}/> Critical Action</div>
                           <p className="text-[10px] text-slate-300">Blade B3 root crack approaching threshold. Schedule NDT inspection immediately.</p>
                       </div>
                       
                       <div className="p-2 bg-sky-900/20 border border-sky-500/30 rounded">
                           <div className="text-xs font-bold text-sky-300 flex items-center gap-1 mb-1"><Settings size={12}/> Optimization</div>
                           <p className="text-[10px] text-slate-300">Limit operation in Zone 2 (45-60% load) to reduce cavitation erosion.</p>
                       </div>

                       <div className="mt-auto">
                           <button className="w-full py-2 bg-sky-700/30 hover:bg-sky-600/50 border border-sky-500/50 rounded text-xs text-sky-200 transition-colors flex items-center justify-center gap-2">
                               <FileText size={12} /> Generate Report
                           </button>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
