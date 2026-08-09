import React, { useState, useEffect } from 'react';
import { RotorUnbalanceScene } from '../../../components/predictive/hydro-rotor/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-3]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-3';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, AreaChart, Area, Legend, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart,
  BarChart, Bar
} from 'recharts';
import { 
  Activity, RotateCw, AlertTriangle, Crosshair, 
  Disc, Move, Compass, ArrowUpRight, Scale,
  PlayCircle, Sliders
} from 'lucide-react';

// --- Mock Data & Helpers ---

const DEG_TO_RAD = Math.PI / 180;

export const RotorUnbalanceView: React.FC = () => {
  // --- STATE ---
  const [rpm, setRpm] = useState(150); // Rated 150 RPM
  const [load, setLoad] = useState(80); // % Load
  
  // Vibration Vector (1X Fundamental)
  const [vector, setVector] = useState({
      amp: 120, // um (High vibration)
      phase: 45 // degrees lag
  });

  const [heavySpot, setHeavySpot] = useState(0); // degrees on rotor
  const [trendData, setTrendData] = useState<any[]>([]);
  const [polarHistory, setPolarHistory] = useState<any[]>([]);

  // Derived Status
  const balanceGrade = vector.amp < 50 ? 'G1.0 (Excellent)' : vector.amp < 100 ? 'G2.5 (Good)' : vector.amp < 150 ? 'G6.3 (Warning)' : 'G16 (Critical)';
  const statusColor = vector.amp < 100 ? 'text-green-400' : vector.amp < 150 ? 'text-yellow-400' : 'text-red-500';

  // --- SIMULATION ---
  useEffect(() => {
    // Init History
    const initTrend = Array.from({length: 30}, (_, i) => ({
        time: i,
        amp: 80 + Math.random() * 5,
        load: 60 + i
    }));
    setTrendData(initTrend);

    const interval = setInterval(() => {
      const t = Date.now() / 2000;
      
      // Simulate Thermal Unbalance: Vibration increases with Load (Heat)
      // Base mechanical unbalance (80um) + Thermal component (factor of load)
      const thermalFactor = Math.max(0, (load - 50) * 1.5); 
      const noise = (Math.random() - 0.5) * 5;
      
      const newAmp = 80 + thermalFactor + noise;
      // Phase shifts slightly with thermal bow
      const newPhase = (45 + (load / 100) * 20) % 360; 

      setVector({
          amp: newAmp,
          phase: newPhase
      });

      // Update Trends
      setTrendData(prev => {
          const lastTime = prev[prev.length - 1].time;
          return [...prev.slice(1), { time: lastTime + 1, amp: newAmp, load: load }];
      });

      // Update Polar History (Keep last 20 points)
      setPolarHistory(prev => {
          // Convert Polar to Cartesian for Scatter Chart visualization on a "Polar" background
          // X = Amp * cos(Phase), Y = Amp * sin(Phase)
          // Recharts Scatter uses Cartesian. We overlay a Polar Grid background visually.
          const rad = newPhase * DEG_TO_RAD;
          const point = { 
              x: newAmp * Math.cos(rad), 
              y: newAmp * Math.sin(rad),
              amp: newAmp,
              phase: newPhase
          };
          const newHist = [...prev, point];
          if (newHist.length > 50) return newHist.slice(newHist.length - 50);
          return newHist;
      });

    }, 500);

    return () => clearInterval(interval);
  }, [load]);

  // Handle Manual Load Change Simulation
  const toggleLoad = () => {
      setLoad(prev => prev > 90 ? 50 : prev + 10);
  };

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#050505] text-slate-200 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-orange-900/40 pb-4 bg-gradient-to-r from-orange-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Crosshair size={14} className="animate-spin-slow" />
             Rotor Dynamics Analysis
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             发电机转子 <span className="text-orange-500">不平衡劣化评估</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">ISO Balance Grade</div>
                <div className={`text-2xl font-bold ${statusColor}`}>{balanceGrade}</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">1X Vibration</div>
                <div className="text-3xl font-mono font-bold text-white">{vector.amp.toFixed(1)} <span className="text-sm text-slate-500">μm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Phase Lag</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">{vector.phase.toFixed(1)}°</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Polar Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Polar Plot Card */}
           <SciFiCard title="矢量极坐标图 (1X Vector)" subtitle="POLAR PLOT" className="h-[350px] border-orange-900/50 bg-[#0a0500]" noPadding>
               <div className="w-full h-full relative flex items-center justify-center">
                   {/* Custom Polar Grid Background using SVG */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
                       <circle cx="150" cy="150" r="140" stroke="#333" fill="none" />
                       <circle cx="150" cy="150" r="100" stroke="#333" fill="none" strokeDasharray="4 4" />
                       <circle cx="150" cy="150" r="50" stroke="#333" fill="none" strokeDasharray="4 4" />
                       <line x1="10" y1="150" x2="290" y2="150" stroke="#333" />
                       <line x1="150" y1="10" x2="150" y2="290" stroke="#333" />
                       <text x="280" y="145" fill="#666" fontSize="10">0°</text>
                       <text x="155" y="20" fill="#666" fontSize="10">90°</text>
                       <text x="10" y="145" fill="#666" fontSize="10">180°</text>
                       <text x="155" y="290" fill="#666" fontSize="10">270°</text>
                   </svg>

                   {/* Scatter Plot for vectors */}
                   <div className="w-full h-full absolute inset-0">
                       <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                               <XAxis type="number" dataKey="x" domain={[-200, 200]} hide />
                               <YAxis type="number" dataKey="y" domain={[-200, 200]} hide />
                               <Tooltip 
                                  cursor={{strokeDasharray: '3 3'}}
                                  content={({payload}) => {
                                      if (payload && payload.length) {
                                          const d = payload[0].payload;
                                          return (
                                              <div className="bg-black/80 border border-orange-500 p-2 text-xs rounded">
                                                  <div>Amp: {d.amp.toFixed(1)} μm</div>
                                                  <div>Phase: {d.phase.toFixed(1)}°</div>
                                              </div>
                                          );
                                      }
                                      return null;
                                  }}
                               />
                               <Scatter name="History" data={polarHistory} fill="#334155" line={{stroke: '#334155', strokeWidth: 1}} lineType="fitting" />
                               <Scatter name="Current" data={[{
                                   x: vector.amp * Math.cos(vector.phase * DEG_TO_RAD),
                                   y: vector.amp * Math.sin(vector.phase * DEG_TO_RAD),
                                   amp: vector.amp,
                                   phase: vector.phase
                               }]} fill="#f97316" shape="cross" />
                           </ScatterChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Diagnosis Result */}
           <SciFiCard title="AI 智能诊断结论" className="flex-1 border-orange-900/50">
               <div className="space-y-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-slate-400 font-bold uppercase">Unbalance Type</span>
                           <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded border border-orange-800">Thermal</span>
                       </div>
                       <p className="text-xs text-slate-300">
                           振动矢量随负荷(温度)变化显著，特征符合转子热不平衡。建议检查转子通风孔堵塞或线圈匝间短路。
                       </p>
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500">Thermal Sensitivity</span>
                           <span className="text-white font-mono">1.2 μm/MW</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                           <div className="bg-orange-500 h-full" style={{width: '70%'}}></div>
                       </div>
                   </div>

                   <div className="flex justify-between items-center text-xs mt-2 border-t border-slate-800 pt-2">
                       <span className="text-slate-500">Recommended Action</span>
                       <span className="text-green-400 font-bold flex items-center gap-1"><Scale size={12}/> Trim Balance</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#0c0804] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(249,115,22,0.1)]">
               
               {/* Controls Overlay */}
               <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                   <div className="bg-black/60 backdrop-blur border border-orange-500/20 px-4 py-2 rounded">
                       <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase">Generator Load</div>
                       <div className="flex items-center gap-4">
                           <button onClick={toggleLoad} className="p-1 bg-slate-800 hover:bg-orange-700 rounded text-white transition-colors">
                               <PlayCircle size={16} />
                           </button>
                           <div className="text-2xl font-mono font-bold text-white">{load} <span className="text-sm text-slate-500">%</span></div>
                       </div>
                       <div className="w-32 h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                           <div className="bg-orange-500 h-full transition-all duration-500" style={{width: `${load}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Legend Overlay */}
               <div className="absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] bg-black/60 px-3 py-1 rounded border border-slate-700 backdrop-blur">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Heavy Spot (Mass)</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> High Spot (Vib)</div>
               </div>

               <RotorUnbalanceScene 
                   rpm={rpm} 
                   vibrationAmp={vector.amp}
                   phaseAngle={vector.phase}
                   heavySpotAngle={heavySpot}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Trend Chart */}
           <SciFiCard title="振动-负荷相关性趋势" subtitle="CORRELATION" className="h-[250px] border-orange-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={trendData}>
                           <defs>
                               <linearGradient id="colorAmp" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis yAxisId="left" stroke="#f97316" tick={{fontSize: 10}} label={{ value: 'Vib (μm)', angle: -90, position: 'insideLeft', fill: '#f97316' }} />
                           <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 10}} domain={[0, 100]} label={{ value: 'Load (%)', angle: 90, position: 'insideRight', fill: '#64748b' }} />
                           <Tooltip contentStyle={{backgroundColor: '#0a0500', borderColor: '#f97316', color: '#fff'}} />
                           <Area yAxisId="left" type="monotone" dataKey="amp" stroke="#f97316" fill="url(#colorAmp)" />
                           <Line yAxisId="right" type="step" dataKey="load" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Balancing Tools */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Spectrum */}
           <SciFiCard title="频谱成分 (Spectrum)" subtitle="FFT" className="h-[200px] border-orange-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                           {freq: '0.5X', val: 5},
                           {freq: '1X', val: vector.amp}, // Dominant
                           {freq: '2X', val: 12},
                           {freq: '3X', val: 3},
                       ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="freq" stroke="#666" tick={{fontSize: 10}} />
                           <YAxis stroke="#666" tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#331c0a'}} contentStyle={{backgroundColor: '#000', borderColor: '#f97316'}} />
                           <Bar dataKey="val" fill="#f97316" barSize={30} />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

           {/* Balancing Calculator */}
           <SciFiCard title="动平衡配重计算" subtitle="CALCULATOR" className="flex-1 border-orange-900/50">
               <div className="flex flex-col gap-4">
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                           <Sliders size={12} /> Influence Coefficient
                       </div>
                       <div className="font-mono text-white text-sm">
                           3.5 μm / kg @ 125°
                       </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-xs font-bold text-orange-400 border-b border-orange-900/30 pb-1">Suggested Correction</div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Plane</span>
                           <span className="text-white">Top Fan</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Mass</span>
                           <span className="text-green-400 font-bold font-mono">{(vector.amp / 3.5).toFixed(1)} kg</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Angle</span>
                           <span className="text-cyan-400 font-bold font-mono">{(vector.phase + 180) % 360}°</span>
                       </div>
                   </div>

                   <button className="mt-auto w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 text-xs rounded border border-orange-900/50 flex items-center justify-center gap-2 transition-colors">
                       <Move size={12} /> 模拟配重效果
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};