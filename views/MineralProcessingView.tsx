import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, AreaChart, Area
} from 'recharts';
import { 
  FlaskConical, Gem, TrendingUp, Scan, 
  Pipette, Layers, Microscope, Gauge
} from 'lucide-react';

export const MineralProcessingView: React.FC = () => {
  // --- STATE ---
  const [processState, setProcessState] = useState({
    feedRate: 1250, // TPH
    pulpDensity: 32.5, // % solids
    airFlow: 450, // m3/h
    frothDepth: 15, // cm
    recovery: 88.5, // %
    concentrateGrade: 24.2, // % (e.g., Cu)
    tailingGrade: 0.15, // %
  });

  const [reagents, setReagents] = useState([
    { name: 'Xanthate (PAX)', dosage: 45, unit: 'g/t', flow: 120, status: 'Normal' },
    { name: 'Frother (MIBC)', dosage: 25, unit: 'g/t', flow: 65, status: 'Normal' },
    { name: 'Lime (pH Mod)', dosage: 800, unit: 'g/t', flow: 2100, status: 'Normal' },
  ]);

  const [osaData, setOsaData] = useState([
    { stream: 'Feed', cu: 1.2, fe: 4.5, s: 2.1 },
    { stream: 'Conc', cu: 24.2, fe: 28.1, s: 32.5 },
    { stream: 'Tail', cu: 0.15, fe: 3.2, s: 0.8 },
  ]);

  const [recoveryCurve, setRecoveryCurve] = useState<any[]>([]);
  const [currentPoint, setCurrentPoint] = useState({ grade: 24.2, rec: 88.5 });

  // Simulation Loop
  useEffect(() => {
    // Init Grade-Recovery Curve (Static theoretical curve)
    const curve = [];
    for(let r = 50; r <= 98; r+=2) {
        // Inverse relationship: Higher recovery = Lower grade
        const g = 40 - Math.pow((r-50)/5, 1.5); 
        curve.push({ rec: r, grade: Math.max(0, g) });
    }
    setRecoveryCurve(curve);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Process Dynamics
      setProcessState(prev => ({
          feedRate: 1250 + Math.sin(time * 0.1) * 50,
          pulpDensity: 32.5 + (Math.random() - 0.5) * 1,
          airFlow: 450 + (Math.random() - 0.5) * 10,
          frothDepth: 15 + Math.sin(time * 0.5) * 1,
          recovery: 88.5 + Math.sin(time * 0.2) * 1.5,
          concentrateGrade: 24.2 - Math.sin(time * 0.2) * 0.5, // Inverse to recovery usually
          tailingGrade: 0.15 + (Math.random() - 0.5) * 0.01
      }));

      // 2. Reagent Fluctuation
      setReagents(prev => prev.map(r => ({
          ...r,
          flow: r.flow + (Math.random() - 0.5) * 2
      })));

      // 3. OSA Updates (XRF Simulation)
      setOsaData(prev => prev.map(s => {
          if (s.stream === 'Conc') return { ...s, cu: 24.2 + (Math.random()-0.5)*0.5 };
          if (s.stream === 'Tail') return { ...s, cu: 0.15 + (Math.random()-0.5)*0.01 };
          return s;
      }));

      // 4. Operational Point
      setCurrentPoint(prev => ({
          rec: 88.5 + Math.sin(time * 0.2) * 1.5,
          grade: 24.2 - Math.sin(time * 0.2) * 0.5
      }));

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-violet-50 selection:bg-violet-500/30">
      
      {/* HEADER: Chemical/Mineral Theme */}
      <div className="flex items-end justify-between border-b border-violet-600/40 pb-4 bg-gradient-to-r from-[#1e1b4b] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 uppercase tracking-wider">
             <FlaskConical size={12} className="animate-pulse" />
             MINERAL FLOTATION CIRCUIT
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-violet-400 text-shadow-glow">选矿设备</span> 智能运维平台
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">CELL-BANK-A</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Recovery Rate</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">{processState.recovery.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Conc. Grade (Cu)</div>
                <div className="text-2xl font-mono font-bold text-violet-300">{processState.concentrateGrade.toFixed(2)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-violet-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Mass Pull</div>
                <div className="text-2xl font-mono font-bold text-white">4.2 <span className="text-sm text-slate-500">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Reagents & Feed */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Reagent Dosing System */}
           <SciFiCard title="药剂添加系统" subtitle="DOSING CONTROL" className="flex-1 border-violet-900/50 bg-[#0f0a24]/80">
              <div className="flex flex-col gap-4">
                  {reagents.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded border border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-violet-200">{r.name}</span>
                              <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 rounded">{r.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <Pipette size={24} className="text-violet-500" />
                              <div className="flex-1">
                                  <div className="flex justify-between text-xs text-slate-400">
                                      <span>Flow: {r.flow.toFixed(0)} cc/min</span>
                                      <span>Set: {r.dosage} {r.unit}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                      <div className="bg-violet-500 h-full" style={{width: '70%'}}></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           {/* Feed Characteristics */}
           <SciFiCard title="给矿参数" className="border-violet-900/50">
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Feed Rate</div>
                      <div className="text-xl font-mono text-white">{processState.feedRate.toFixed(0)}</div>
                      <div className="text-[10px] text-slate-500">TPH</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Pulp Density</div>
                      <div className="text-xl font-mono text-white">{processState.pulpDensity.toFixed(1)}</div>
                      <div className="text-[10px] text-slate-500">% Solids</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">Particle Size</div>
                      <div className="text-xl font-mono text-white">P80=74</div>
                      <div className="text-[10px] text-slate-500">microns</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">pH Level</div>
                      <div className="text-xl font-mono text-white">10.2</div>
                      <div className="text-[10px] text-slate-500">Alkaline</div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#05020a] border border-violet-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(139,92,246,0.1)]">
              {/* HUD Overlay: Froth Vision */}
              <div className="absolute top-4 left-4 z-10 w-56 bg-black/60 border border-violet-500/30 backdrop-blur rounded p-2">
                 <div className="flex items-center gap-2 mb-2">
                     <Scan className="text-emerald-400 animate-pulse" size={16} />
                     <span className="text-xs text-violet-100 font-bold">FROTH VISION ANALYSIS</span>
                 </div>
                 <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono text-slate-300">
                     <div>Velocity: <span className="text-white">8.5 cm/s</span></div>
                     <div>Stability: <span className="text-green-400">HIGH</span></div>
                     <div>Color: <span className="text-white">R120 G110 B90</span></div>
                     <div>Bubble Sz: <span className="text-white">12 mm</span></div>
                 </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                     <Gauge size={16} className="text-violet-400" />
                     <span className="text-xs text-slate-300">Air Flow</span>
                 </div>
                 <div className="text-2xl font-bold text-white font-mono">{processState.airFlow.toFixed(0)} <span className="text-sm font-normal text-slate-500">m³/h</span></div>
              </div>

              <ThreeScene type="flotation-cell" color="#8b5cf6" />
           </div>

           {/* Grade-Recovery Curve */}
           <SciFiCard title="品位-回收率曲线" subtitle="OPTIMIZATION" className="h-[250px] border-violet-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                      <XAxis type="number" dataKey="rec" name="Recovery" unit="%" stroke="#64748b" domain={[50, 100]} label={{ value: 'Recovery %', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis type="number" dataKey="grade" name="Grade" unit="%" stroke="#64748b" domain={[0, 40]} label={{ value: 'Grade %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#05020a', borderColor: '#8b5cf6', color: '#fff'}} />
                      
                      {/* Theoretical Curve */}
                      <Scatter name="Design Curve" data={recoveryCurve} line={{stroke: '#4c1d95', strokeWidth: 2}} shape={() => null} />
                      
                      {/* Operational Point */}
                      <Scatter name="Current Ops" data={[currentPoint]} fill="#10b981" shape="circle" r={6}>
                          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                      </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* On-Stream Analyzer (OSA) */}
           <SciFiCard title="在线品位分析 (OSA)" subtitle="XRF ASSAY" className="flex-1 border-violet-900/50">
              <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-4 text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-1">
                      <span>Stream</span>
                      <span className="text-right">Cu %</span>
                      <span className="text-right">Fe %</span>
                      <span className="text-right">S %</span>
                  </div>
                  {osaData.map((row, i) => (
                      <div key={i} className="grid grid-cols-4 items-center text-xs font-mono py-1">
                          <span className="font-bold text-violet-300">{row.stream}</span>
                          <span className="text-right text-white">{row.cu.toFixed(2)}</span>
                          <span className="text-right text-slate-400">{row.fe.toFixed(1)}</span>
                          <span className="text-right text-slate-400">{row.s.toFixed(1)}</span>
                      </div>
                  ))}
                  
                  <div className="mt-4 p-2 bg-emerald-900/20 rounded border border-emerald-800/30">
                      <div className="flex items-center gap-2 mb-1">
                          <Gem size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-200">Economic Value</span>
                      </div>
                      <div className="text-xs text-slate-400">Instantaneous Revenue:</div>
                      <div className="text-lg font-mono text-white">$4,250 /h</div>
                  </div>
              </div>
           </SciFiCard>

           {/* Froth Depth Control */}
           <SciFiCard title="液位与泡沫层控制" className="border-violet-900/50">
               <div className="flex items-center gap-4">
                   <div className="relative h-32 w-12 bg-slate-800 rounded border border-slate-600 flex flex-col justify-end overflow-hidden">
                       {/* Slurry */}
                       <div className="bg-violet-900/80 w-full h-[60%] border-t border-violet-500"></div>
                       {/* Froth */}
                       <div className="bg-white/80 w-full h-[15%] absolute bottom-[60%] animate-pulse"></div>
                       
                       {/* Scale */}
                       <div className="absolute right-0 top-0 bottom-0 w-2 border-l border-slate-500 flex flex-col justify-between text-[6px] text-slate-400 pr-0.5 items-end">
                           <span>30</span>
                           <span>0</span>
                       </div>
                   </div>
                   <div className="flex-1 space-y-3">
                       <div>
                           <div className="text-xs text-slate-400">Froth Depth</div>
                           <div className="text-xl font-bold text-white">{processState.frothDepth.toFixed(1)} cm</div>
                       </div>
                       <div>
                           <div className="text-xs text-slate-400">Valve Opening</div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                               <div className="bg-violet-500 h-full" style={{width: '45%'}}></div>
                           </div>
                           <div className="text-xs text-right text-violet-300">45%</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};