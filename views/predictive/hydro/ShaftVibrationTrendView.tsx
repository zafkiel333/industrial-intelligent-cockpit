import React, { useState, useEffect } from 'react';
import { ShaftVibrationScene } from '../../../components/predictive/hydro-shaft-vibration/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-hydro-4]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-hydro-4';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  ScatterChart, Scatter, LineChart, Line, Legend, ComposedChart, Bar, BarChart
} from 'recharts';
import { 
  Activity, RotateCw, AlertTriangle, Crosshair, 
  GitCommit, TrendingUp, Cpu, History, ArrowRight
} from 'lucide-react';

// --- Mock Data ---

// Generate synthetic trend data
const generateTrend = () => {
    return Array.from({length: 48}, (_, i) => {
        const t = i;
        // Base vibration signal with some daily cyclicity and noise
        const base = 80 + Math.sin(t / 8) * 20; 
        const noise = (Math.random() - 0.5) * 10;
        // Predicted part (last 12 points) diverges slightly
        const isPred = i > 36;
        const val = isPred ? base + noise + (i-36)*2 : base + noise;
        
        return {
            time: `${i}:00`,
            actual: isPred ? null : val,
            predict: isPred ? val : null,
            limit: 150
        };
    });
};

const ORBIT_DATA = Array.from({length: 36}, (_, i) => {
    const rad = (i * 10) * Math.PI / 180;
    // Ellipse
    return {
        x: Math.cos(rad) * 100 + (Math.random()-0.5)*5,
        y: Math.sin(rad) * 80 + (Math.random()-0.5)*5
    };
});

const SPECTRUM_DATA = [
    { freq: '0.5X', val: 12 },
    { freq: '1X', val: 125 }, // Dominant unbalance
    { freq: '2X', val: 15 },
    { freq: '3X', val: 5 },
    { freq: '4X', val: 2 },
    { freq: '5X', val: 8 }, // Possible blade pass
    { freq: '7X', val: 3 },
];

export const ShaftVibrationTrendView: React.FC = () => {
  // --- STATE ---
  const [rpm, setRpm] = useState(150.0);
  const [vibData, setVibData] = useState({
      upper: { amp: 125, phase: 45 },
      lower: { amp: 95, phase: 120 },
      water: { amp: 140, phase: 210 }
  });
  
  const [trend, setTrend] = useState(generateTrend());
  const [time, setTime] = useState(0);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 1000;
        setTime(t);

        // Fluctuate RPM
        setRpm(150 + Math.sin(t * 0.1) * 0.5);

        // Fluctuate Vibration Data (Simulate dynamic change)
        setVibData(prev => ({
            upper: { amp: 125 + Math.sin(t)*5, phase: (45 + t*5)%360 },
            lower: { amp: 95 + Math.sin(t+1)*5, phase: (120 + t*5)%360 },
            water: { amp: 140 + Math.sin(t+2)*8, phase: (210 + t*5)%360 }
        }));

    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020408] text-cyan-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Activity size={14} className="animate-pulse" />
             Vibration Analysis System
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             机组轴系 <span className="text-cyan-500">振动趋势预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Real-time RPM</div>
                <div className="text-3xl font-mono font-bold text-white">{rpm.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Max Runout (Smax)</div>
                <div className="text-3xl font-mono font-bold text-red-400">{vibData.water.amp.toFixed(0)} <span className="text-sm text-slate-500">μm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Forecast Status</div>
                <div className="text-2xl font-mono font-bold text-yellow-400 flex items-center gap-2">
                    Warning <AlertTriangle size={18} />
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Sensor Data & Spectrum */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Detailed Bearing Status */}
           <SciFiCard title="各导轴承摆度监测" subtitle="RUNOUT (μm)" className="border-cyan-900/50 bg-[#060810]/80">
              <div className="flex flex-col gap-4">
                  {/* Upper Guide */}
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border-l-4 border-cyan-500">
                      <div>
                          <div className="text-xs text-slate-400 font-bold">UPPER GUIDE</div>
                          <div className="text-[10px] text-slate-500">Phase: {vibData.upper.phase.toFixed(0)}°</div>
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">{vibData.upper.amp.toFixed(0)}</div>
                  </div>
                  
                  {/* Lower Guide */}
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border-l-4 border-blue-500">
                      <div>
                          <div className="text-xs text-slate-400 font-bold">LOWER GUIDE</div>
                          <div className="text-[10px] text-slate-500">Phase: {vibData.lower.phase.toFixed(0)}°</div>
                      </div>
                      <div className="text-2xl font-mono font-bold text-white">{vibData.lower.amp.toFixed(0)}</div>
                  </div>

                  {/* Water Guide */}
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border-l-4 border-red-500">
                      <div>
                          <div className="text-xs text-slate-400 font-bold">WATER GUIDE</div>
                          <div className="text-[10px] text-slate-500">Phase: {vibData.water.phase.toFixed(0)}°</div>
                      </div>
                      <div className="text-2xl font-mono font-bold text-red-400 animate-pulse">{vibData.water.amp.toFixed(0)}</div>
                  </div>
              </div>
           </SciFiCard>

           {/* Frequency Spectrum */}
           <SciFiCard title="振动频谱分析 (FFT)" className="flex-1 border-cyan-900/50">
               <div className="h-full w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SPECTRUM_DATA} layout="vertical" margin={{left: 20, right: 20}}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" stroke="#64748b" hide />
                           <YAxis dataKey="freq" type="category" stroke="#94a3b8" width={30} tick={{fontSize: 10}} />
                           <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', borderColor: '#22d3ee', color: '#fff'}} />
                           <Bar dataKey="val" fill="#22d3ee" barSize={12} radius={[0, 4, 4, 0]} />
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-slate-500 mt-2 text-center">Dominant Frequency: 1X (Unbalance)</div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: 3D Visualization */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[400px] bg-[#00050a] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(6,182,212,0.1)]">
              {/* Overlays */}
              <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-cyan-500/30">
                      <RotateCw size={14} className="text-cyan-400 animate-spin" />
                      <span className="text-xs text-cyan-100 font-bold">MODE SHAPE VISUALIZER</span>
                  </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-1">
                  <div className="text-[10px] text-slate-400">Vibration Scale</div>
                  <div className="flex gap-1 h-1 w-24">
                      <div className="flex-1 bg-green-500"></div>
                      <div className="flex-1 bg-yellow-500"></div>
                      <div className="flex-1 bg-red-500"></div>
                  </div>
              </div>

              <ShaftVibrationScene 
                  rpm={rpm}
                  vibUpper={vibData.upper.amp / 200} // Normalize for visual
                  vibLower={vibData.lower.amp / 200}
                  vibWater={vibData.water.amp / 200}
                  phaseUpper={vibData.upper.phase}
                  phaseLower={vibData.lower.phase}
                  phaseWater={vibData.water.phase}
              />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Trend Prediction Chart */}
           <SciFiCard title="振动趋势与AI预测 (48H)" subtitle="PREDICTIVE" className="h-[250px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={trend}>
                           <defs>
                               <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={6} />
                           <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 200]} label={{ value: 'Amp (μm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                           <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#22d3ee', color: '#fff'}} />
                           <ReferenceLine y={150} stroke="red" strokeDasharray="3 3" label={{value: 'Trip', fill: 'red', fontSize: 10}} />
                           
                           <Area type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorActual)" name="History" />
                           <Line type="monotone" dataKey="predict" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Forecast" />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Analysis Tools */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Orbit Plot */}
           <SciFiCard title="轴心轨迹 (Orbit)" subtitle="WATER GUIDE" className="h-[300px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4 relative flex items-center justify-center">
                   {/* Polar Grid */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                       <div className="w-40 h-40 border rounded-full border-cyan-500"></div>
                       <div className="w-24 h-24 border rounded-full border-cyan-500 absolute"></div>
                       <div className="w-[1px] h-full bg-cyan-500 absolute"></div>
                       <div className="h-[1px] w-full bg-cyan-500 absolute"></div>
                   </div>

                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart>
                           <XAxis type="number" dataKey="x" domain={[-150, 150]} hide />
                           <YAxis type="number" dataKey="y" domain={[-150, 150]} hide />
                           <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee'}} />
                           <Scatter name="Orbit" data={ORBIT_DATA} fill="#22d3ee" line={{stroke: '#22d3ee', strokeWidth: 1}} lineType="fitting" />
                       </ScatterChart>
                   </ResponsiveContainer>
                   
                   <div className="absolute top-2 right-2 text-[10px] text-cyan-400">
                       Direct / Quadrature
                   </div>
               </div>
           </SciFiCard>

           {/* Deflection Profile (Simplified) */}
           <SciFiCard title="轴系挠度概览" className="flex-1 border-cyan-900/50">
               <div className="flex gap-4 h-full items-center px-4">
                   {/* Vertical Ruler */}
                   <div className="h-[80%] w-1 bg-slate-700 relative">
                       <div className="absolute top-0 -left-6 text-[10px] text-slate-500">UGB</div>
                       <div className="absolute top-1/2 -left-6 text-[10px] text-slate-500">LGB</div>
                       <div className="absolute bottom-0 -left-6 text-[10px] text-slate-500">WGB</div>
                   </div>
                   
                   {/* Curve Viz */}
                   <div className="flex-1 h-[80%] relative">
                       <svg width="100%" height="100%" overflow="visible">
                           <path 
                             d={`M 10,0 Q ${vibData.upper.amp/3},50 10,100 T 10,200`} 
                             fill="none" stroke="#f59e0b" strokeWidth="2"
                             className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                           />
                           {/* Points */}
                           <circle cx={10 + vibData.upper.amp/10} cy="0" r="3" fill="#22d3ee" />
                           <circle cx={10 + vibData.lower.amp/10} cy="50%" r="3" fill="#22d3ee" />
                           <circle cx={10 + vibData.water.amp/10} cy="100%" r="3" fill="#ef4444" />
                       </svg>
                   </div>
                   
                   <div className="w-20 text-right space-y-8 text-xs font-mono text-white">
                       <div>{vibData.upper.amp.toFixed(0)}</div>
                       <div>{vibData.lower.amp.toFixed(0)}</div>
                       <div className="text-red-400">{vibData.water.amp.toFixed(0)}</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};