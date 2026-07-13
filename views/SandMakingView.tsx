import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-17]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-17';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, AreaChart, Area, Legend
} from 'recharts';
import { 
  Loader2, Activity, Zap, TrendingUp, Layers, 
  Settings2, RefreshCw, Hexagon, Filter
} from 'lucide-react';

export const SandMakingView: React.FC = () => {
  // --- STATE ---
  const [opsData, setOpsData] = useState({
    throughput: 280, // TPH
    rotorCurrent: 345, // A
    rotorSpeed: 1650, // RPM (High speed for VSI)
    vibration: 2.1, // mm/s
    bearingTemp: 62, // C
    finenessModulus: 2.7, // FM (Standard concrete sand ~2.3-3.1)
    feedRatio: 40, // % Center Feed vs Cascade
  });

  const [vibrationOrbit, setVibrationOrbit] = useState<any[]>([]);
  const [gradationCurve, setGradationCurve] = useState<any[]>([]);
  const [fmTrend, setFmTrend] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init Gradation (Sieve Analysis)
    const sieveSizes = ['0.15mm', '0.3mm', '0.6mm', '1.18mm', '2.36mm', '4.75mm'];
    // Ideal curve for Zone II Sand
    const idealPass = [5, 20, 45, 70, 85, 98]; 
    
    // Init Trend
    setFmTrend(Array.from({length: 20}, (_,i) => ({time: i, val: 2.7})));

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Operational Dynamics
      setOpsData(prev => ({
          throughput: 280 + Math.sin(time * 0.1) * 20,
          rotorCurrent: 345 + (Math.random() - 0.5) * 10,
          rotorSpeed: 1650 + (Math.random() - 0.5) * 2,
          vibration: 2.1 + (Math.random() - 0.5) * 0.2 + (Math.sin(time * 5) * 0.1),
          bearingTemp: Math.min(80, Math.max(50, prev.bearingTemp + (Math.random() - 0.5) * 0.1)),
          finenessModulus: 2.7 + Math.sin(time * 0.2) * 0.1,
          feedRatio: prev.feedRatio
      }));

      // 2. Vibration Orbit (Shaft Runout Simulation)
      // Generate a circular pattern with noise
      const orbitPoints = [];
      for(let i=0; i<360; i+=10) {
          const rad = i * Math.PI / 180;
          // Elliptical shape + noise
          const r = 1.5 + Math.sin(rad * 2 + time) * 0.2 + Math.random() * 0.1;
          orbitPoints.push({
              x: r * Math.cos(rad),
              y: r * Math.sin(rad)
          });
      }
      setVibrationOrbit(orbitPoints);

      // 3. Gradation Curve Update
      const currentPass = idealPass.map(p => Math.min(100, Math.max(0, p + (Math.random()-0.5)*5)));
      const gradData = sieveSizes.map((size, i) => ({
          size,
          ideal: idealPass[i],
          actual: currentPass[i]
      }));
      setGradationCurve(gradData);

      // 4. FM Trend Update
      setFmTrend(prev => {
          const lastTime = prev[prev.length - 1].time;
          return [...prev.slice(1), { 
              time: lastTime + 1, 
              val: 2.7 + Math.sin(time * 0.2) * 0.1 
          }];
      });

    }, 100); // Fast update for orbit

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-amber-50 selection:bg-amber-500/30">
      
      {/* HEADER: Sand/Stone Theme */}
      <div className="flex items-end justify-between border-b border-amber-600/40 pb-4 bg-gradient-to-r from-[#292524] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Hexagon size={12} className="animate-spin" />
             VERTICAL SHAFT IMPACT CRUSHER (VSI)
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-amber-500 text-shadow-glow">制砂机</span> 智能运维指挥舱
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">VSI-5X</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Output (TPH)</div>
                <div className="text-2xl font-mono font-bold text-white">{opsData.throughput.toFixed(0)} <span className="text-sm text-slate-500">t/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Fineness Modulus</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{opsData.finenessModulus.toFixed(2)} <span className="text-sm text-slate-500">FM</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Rotor Vib</div>
                <div className={`text-2xl font-mono font-bold ${opsData.vibration > 4 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {opsData.vibration.toFixed(1)} <span className="text-sm text-slate-500">mm/s</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Rotor Health & Dynamics */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Vibration Orbit Plot */}
           <SciFiCard title="转子轴心轨迹" subtitle="SHAFT RUNOUT" className="flex-1 border-amber-900/50 bg-[#1c1917]/80">
              <div className="flex flex-col h-full items-center justify-center p-4">
                  <div className="relative w-64 h-64 border border-slate-700 rounded-full bg-black/40 overflow-hidden">
                      {/* Grid */}
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800"></div>
                      <div className="absolute left-1/2 top-0 h-full w-[1px] bg-slate-800"></div>
                      <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-slate-800 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                      
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                            <XAxis type="number" dataKey="x" domain={[-3, 3]} hide />
                            <YAxis type="number" dataKey="y" domain={[-3, 3]} hide />
                            <Scatter name="Orbit" data={vibrationOrbit} fill="#ef4444" line={{stroke: '#ef4444', strokeWidth: 1}} lineType="fitting" />
                        </ScatterChart>
                      </ResponsiveContainer>
                      
                      {/* Center Point */}
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs">
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">Peak-Peak X</span>
                          <span className="text-white font-mono">1.85 mm</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">Peak-Peak Y</span>
                          <span className="text-white font-mono">1.92 mm</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">Phase Angle</span>
                          <span className="text-amber-400 font-mono">45°</span>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Motor Load */}
           <SciFiCard title="双电机负载监控" className="border-amber-900/50">
              <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-400">M1</div>
                      <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">Motor A Current</span>
                              <span className="text-amber-200">{opsData.rotorCurrent.toFixed(0)} A</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{width: `${(opsData.rotorCurrent/500)*100}%`}}></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-400">M2</div>
                      <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">Motor B Current</span>
                              <span className="text-amber-200">{(opsData.rotorCurrent * 0.98).toFixed(0)} A</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{width: `${(opsData.rotorCurrent*0.98/500)*100}%`}}></div>
                          </div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0a09] border border-amber-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(245,158,11,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-amber-500">
                     <RefreshCw size={16} className="animate-spin" />
                     <span className="text-xs font-bold">ROTOR SPEED</span>
                 </div>
                 <div className="text-3xl font-bold text-white tracking-tighter pl-6">{opsData.rotorSpeed.toFixed(0)} <span className="text-xs text-slate-400 font-normal">RPM</span></div>
                 <div className="text-[10px] text-slate-500 pl-6">Tip Speed: 72 m/s</div>
              </div>

              {/* Feed Mode Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                 <div className="flex items-center gap-4 bg-black/70 px-4 py-2 rounded-full border border-stone-600 backdrop-blur">
                     <div className="text-center">
                         <div className="text-[8px] text-slate-400 uppercase">Center Feed</div>
                         <div className="text-sm font-bold text-white">{100 - opsData.feedRatio}%</div>
                     </div>
                     <div className="h-6 w-[1px] bg-stone-700"></div>
                     <div className="text-center">
                         <div className="text-[8px] text-slate-400 uppercase">Cascade Feed</div>
                         <div className="text-sm font-bold text-amber-400">{opsData.feedRatio}%</div>
                     </div>
                 </div>
              </div>

              <ThreeScene type="sand-maker" color="#eab308" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* FM Trend */}
           <SciFiCard title="细度模数趋势 (FM)" subtitle="QUALITY CTRL" className="h-[200px] border-amber-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fmTrend}>
                       <defs>
                          <linearGradient id="colorFm" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#b45309" tick={{fontSize: 10}} domain={[2.0, 3.5]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#eab308', color: '#fff'}} />
                       <ReferenceLine y={3.0} stroke="red" strokeDasharray="3 3" />
                       <ReferenceLine y={2.3} stroke="red" strokeDasharray="3 3" />
                       <Area type="monotone" dataKey="val" stroke="#eab308" strokeWidth={2} fill="url(#colorFm)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Product Quality */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Gradation Curve */}
           <SciFiCard title="产物粒径分布 (PSD)" subtitle="SIEVE ANALYSIS" className="flex-1 border-amber-900/50">
              <div className="h-full w-full flex flex-col">
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradationCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                            <XAxis dataKey="size" stroke="#78716c" tick={{fontSize: 10}} />
                            <YAxis stroke="#78716c" tick={{fontSize: 10}} label={{ value: '% Passing', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#78716c' }} domain={[0, 100]} />
                            <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#eab308', color: '#fff'}} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
                            <Line name="Standard (Zone II)" type="monotone" dataKey="ideal" stroke="#78716c" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                            <Line name="Actual Prod" type="monotone" dataKey="actual" stroke="#eab308" strokeWidth={2} dot={{r:3}} />
                        </LineChart>
                    </ResponsiveContainer>
                  </div>
              </div>
           </SciFiCard>

           {/* Efficiency & Shape */}
           <SciFiCard title="成砂效率与粒形" className="border-amber-900/50">
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-stone-900/50 p-3 rounded border border-stone-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Sand Equivalent</div>
                       <div className="text-xl font-bold text-white mt-1">78%</div>
                       <div className="text-[9px] text-green-400">Excellent</div>
                   </div>
                   <div className="bg-stone-900/50 p-3 rounded border border-stone-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Shape Index</div>
                       <div className="text-xl font-bold text-white mt-1">0.92</div>
                       <div className="text-[9px] text-slate-400">Cubical</div>
                   </div>
                   <div className="col-span-2 bg-stone-900/50 p-2 rounded border border-stone-800 flex items-center justify-between px-4">
                       <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                           <Filter size={12} /> Powder Content (&lt;0.075)
                       </div>
                       <div className="text-sm font-bold text-amber-200">12.5%</div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};