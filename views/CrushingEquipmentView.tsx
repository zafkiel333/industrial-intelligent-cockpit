import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Activity, Zap, Gauge, Layers, RefreshCcw, 
  AlertOctagon, Hexagon, ArrowDownCircle, Boxes 
} from 'lucide-react';

export const CrushingEquipmentView: React.FC = () => {
  // --- STATE ---
  const [crusherData, setCrusherData] = useState({
    throughput: 450, // TPH (Tons Per Hour)
    power: 285, // kW
    css: 32, // mm (Closed Side Setting)
    mantleWear: 12, // % worn
    chamberLevel: 65, // %
    vibration: 4.2, // mm/s
    oilTemp: 52, // C
    status: 'RUNNING'
  });

  const [particleData, setParticleData] = useState<any[]>([]);
  const [powerTrend, setPowerTrend] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init Particle Size Distribution (Histogram)
    const initParticles = [
        { size: '0-5mm', pct: 15 },
        { size: '5-10mm', pct: 25 },
        { size: '10-20mm', pct: 35 },
        { size: '20-40mm', pct: 20 },
        { size: '>40mm', pct: 5 }
    ];
    setParticleData(initParticles);

    // Init Power History
    const initPower = Array.from({length: 30}, (_, i) => ({
        time: i,
        kW: 280 + Math.random() * 20
    }));
    setPowerTrend(initPower);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Crusher Dynamics
      setCrusherData(prev => ({
          ...prev,
          throughput: 450 + Math.sin(time * 0.2) * 50,
          power: 285 + Math.sin(time * 0.5) * 15 + (Math.random() - 0.5) * 10,
          chamberLevel: Math.min(100, Math.max(0, 65 + Math.sin(time * 0.1) * 20)),
          vibration: 4.2 + (Math.random() - 0.5) * 0.5,
          oilTemp: Math.min(70, prev.oilTemp + 0.01),
          // Simulate CSS adjustment
          css: 32 + Math.sin(time * 0.05) * 1
      }));

      // 2. Particle Size Fluctuation
      setParticleData(prev => prev.map(p => ({
          ...p,
          pct: Math.max(0, p.pct + (Math.random() - 0.5) * 2)
      })));

      // 3. Power Trend
      setPowerTrend(prev => {
          const lastTime = prev[prev.length - 1].time;
          return [...prev.slice(1), { 
              time: lastTime + 1, 
              kW: 285 + Math.sin(time * 0.5) * 15 + (Math.random() - 0.5) * 10
          }];
      });

    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-stone-50 selection:bg-yellow-500/30">
      
      {/* HEADER: Heavy Industry Theme */}
      <div className="flex items-end justify-between border-b border-stone-600/40 pb-4 bg-gradient-to-r from-[#1c1917] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 uppercase tracking-wider">
             <Hexagon size={12} className="animate-spin" />
             AGGREGATE PROCESSING UNIT
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-stone-400 text-shadow-glow">破碎设备</span> 智能运维站
             <span className="text-xl text-yellow-600 font-light border border-stone-700 px-2 rounded">CONE-C300</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Throughput (TPH)</div>
                <div className="text-3xl font-mono font-bold text-white">{crusherData.throughput.toFixed(0)} <span className="text-sm text-slate-500">t/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-stone-700/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Power Draw</div>
                <div className="text-2xl font-mono font-bold text-yellow-500">{crusherData.power.toFixed(0)} <span className="text-sm text-slate-500">kW</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-stone-700/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Status</div>
                <div className="text-2xl font-mono font-bold text-green-500 bg-green-900/20 px-2 rounded border border-green-800/30">RUNNING</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Feed & Control */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Chamber Level */}
           <SciFiCard title="给料与料位监测" subtitle="CHAMBER LEVEL" className="border-stone-700/50 bg-[#1c1917]/80">
              <div className="flex items-center gap-4 h-full py-2">
                  {/* Vertical Level Bar */}
                  <div className="h-full w-12 bg-stone-800 rounded-full relative overflow-hidden border border-stone-600">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-yellow-700 to-yellow-500 transition-all duration-500" 
                        style={{height: `${crusherData.chamberLevel}%`}}
                      ></div>
                      {/* Scale Marks */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2 items-center pointer-events-none">
                          <div className="w-4 h-[1px] bg-stone-500"></div>
                          <div className="w-4 h-[1px] bg-stone-500"></div>
                          <div className="w-4 h-[1px] bg-stone-500"></div>
                          <div className="w-4 h-[1px] bg-stone-500"></div>
                          <div className="w-4 h-[1px] bg-stone-500"></div>
                      </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                      <div>
                          <div className="text-xs text-stone-400 mb-1">Fill Percentage</div>
                          <div className="text-3xl font-bold text-white">{crusherData.chamberLevel.toFixed(0)}%</div>
                          <div className="text-[10px] text-yellow-600">Optimal Range: 60-75%</div>
                      </div>
                      <div className="bg-stone-800 p-2 rounded">
                          <div className="flex justify-between text-xs text-stone-300">
                              <span>Feed Rate</span>
                              <span>Auto</span>
                          </div>
                          <div className="font-mono text-lg text-white">100%</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Hydroset System (CSS) */}
           <SciFiCard title="排矿口设置 (CSS)" className="flex-1 border-stone-700/50">
              <div className="flex flex-col gap-4 h-full justify-center">
                 <div className="text-center">
                     <div className="relative inline-block p-4 border-2 border-stone-600 rounded-full">
                         <RefreshCcw size={32} className="text-yellow-500 animate-spin" style={{animationDuration: '10s'}} />
                         <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">{crusherData.css.toFixed(1)}</div>
                     </div>
                     <div className="text-xs text-stone-400 mt-2">Current CSS (mm)</div>
                 </div>

                 <div className="space-y-3 w-full">
                     <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-1">
                         <span className="text-stone-400">Hydroset Pressure</span>
                         <span className="font-mono text-white">2.4 MPa</span>
                     </div>
                     <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-1">
                         <span className="text-stone-400">Accumulator Charge</span>
                         <span className="font-mono text-green-400">OK</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-stone-400">Adjustment Mode</span>
                         <span className="font-mono text-yellow-500">AUTO-WEAR</span>
                     </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0f0e0d] border border-stone-600/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(234,179,8,0.05)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-black/60 p-2 rounded border border-stone-500/30 backdrop-blur w-40">
                    <div className="text-[10px] text-stone-400 mb-1 font-bold">MANTLE WEAR</div>
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{width: `${crusherData.mantleWear}%`}}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-white">
                        <span>Current: {crusherData.mantleWear}%</span>
                        <span>Est: 450h left</span>
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Activity className="text-yellow-600" size={16} />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500">VIBRATION</span>
                        <span className="text-sm font-bold text-white">{crusherData.vibration.toFixed(1)} mm/s</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Gauge className="text-red-600" size={16} />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500">OIL TEMP</span>
                        <span className="text-sm font-bold text-white">{crusherData.oilTemp.toFixed(1)} °C</span>
                    </div>
                 </div>
              </div>

              <ThreeScene type="crusher" color="#f59e0b" />
           </div>

           {/* Power Curve */}
           <SciFiCard title="主电机功率曲线" subtitle="POWER vs LOAD" className="h-[250px] border-stone-700/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={powerTrend}>
                       <defs>
                          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#a8a29e" tick={{fontSize: 10}} domain={[200, 350]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f59e0b', color: '#fff'}} />
                       <ReferenceLine y={315} stroke="red" strokeDasharray="3 3" label={{value: 'Max', fill: 'red', fontSize: 10}} />
                       <Area type="monotone" dataKey="kW" stroke="#f59e0b" strokeWidth={2} fill="url(#colorPower)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Product Quality */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Particle Size Distribution */}
           <SciFiCard title="出料粒度分布 (PSD)" subtitle="GRANULARITY" className="flex-1 border-stone-700/50">
              <div className="h-full w-full min-h-[200px] flex flex-col">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={particleData} layout="vertical" margin={{top: 5, right: 30, left: 30, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                      <XAxis type="number" stroke="#78716c" hide />
                      <YAxis dataKey="size" type="category" stroke="#d6d3d1" width={50} tick={{fontSize: 10}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(245, 158, 11, 0.1)'}}
                        contentStyle={{backgroundColor: '#1c1917', borderColor: '#f59e0b', color: '#fff'}} 
                      />
                      <Bar dataKey="pct" fill="#f59e0b" barSize={15} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#fff', fontSize: 10, formatter: (v: any) => `${v.toFixed(0)}%` }} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="p-2 bg-stone-800 rounded mt-2 border border-stone-700">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400">P80 Size</span>
                          <span className="text-white font-bold">18.5 mm</span>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Production Stats */}
           <SciFiCard title="班次生产统计" className="border-stone-700/50">
               <div className="space-y-4">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-stone-800 rounded text-stone-300"><Boxes size={18} /></div>
                       <div>
                           <div className="text-xs text-stone-500">Total Shift Tons</div>
                           <div className="text-xl font-bold text-white">3,450 t</div>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-stone-800 rounded text-stone-300"><Zap size={18} /></div>
                       <div>
                           <div className="text-xs text-stone-500">Specific Energy</div>
                           <div className="text-xl font-bold text-white">0.65 <span className="text-xs font-normal text-stone-400">kWh/t</span></div>
                       </div>
                   </div>

                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-stone-800 rounded text-stone-300"><AlertOctagon size={18} /></div>
                       <div>
                           <div className="text-xs text-stone-500">Downtime</div>
                           <div className="text-xl font-bold text-green-400">0 min</div>
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};