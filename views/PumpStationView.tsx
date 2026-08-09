import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-3]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-3';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { 
  Waves, Activity, Gauge, RotateCw, Power, Droplets, 
  ArrowRight, AlertCircle, TrendingUp, Settings2 
} from 'lucide-react';

export const PumpStationView: React.FC = () => {
  // --- STATE ---
  const [systemMetrics, setSystemMetrics] = useState({
    totalFlow: 12500, // m3/h
    inletPressure: 0.25, // MPa
    outletPressure: 1.45, // MPa
    activePumps: 3,
    totalPower: 2450, // kW
    efficiency: 88.5, // %
    energyConsumption: 0.195, // kWh/m3
  });

  const [pumpCluster, setPumpCluster] = useState([
    { id: 'P1', status: 'running', rpm: 1450, temp: 45, vib: 1.2, flow: 4200 },
    { id: 'P2', status: 'running', rpm: 1448, temp: 46, vib: 1.4, flow: 4150 },
    { id: 'P3', status: 'running', rpm: 1452, temp: 44, vib: 1.1, flow: 4150 },
    { id: 'P4', status: 'standby', rpm: 0, temp: 22, vib: 0, flow: 0 },
  ]);

  // H-Q Curve Data (Head vs Flow)
  const [hqData, setHqData] = useState<{flow: number, head: number, designHead: number}[]>([]);
  const [operatingPoint, setOperatingPoint] = useState({ flow: 4200, head: 52 });

  // Simulation Loop
  useEffect(() => {
    // Generate static design curve
    const curve = [];
    for(let f = 0; f <= 6000; f+=500) {
        // Simple quadratic pump curve approximation: H = H0 - k*Q^2
        // H0 = 80m, Shutoff head
        const h = 80 - (0.0000015 * f * f);
        curve.push({ flow: f, designHead: h, head: 0 }); // head 0 is placeholder
    }
    setHqData(curve);

    const interval = setInterval(() => {
      // 1. System Metrics Simulation
      setSystemMetrics(prev => ({
        totalFlow: 12000 + (Math.random() - 0.5) * 500,
        inletPressure: 0.25 + (Math.random() - 0.5) * 0.02,
        outletPressure: 1.45 + (Math.random() - 0.5) * 0.05,
        activePumps: 3,
        totalPower: 2400 + (Math.random() - 0.5) * 100,
        efficiency: 88 + (Math.random() - 0.5) * 1,
        energyConsumption: 0.19 + (Math.random() - 0.5) * 0.01,
      }));

      // 2. Pump Cluster Simulation
      setPumpCluster(prev => prev.map(p => {
        if (p.status === 'running') {
            return {
                ...p,
                rpm: 1450 + (Math.random() - 0.5) * 10,
                temp: Math.min(60, Math.max(40, p.temp + (Math.random() - 0.5) * 0.5)),
                vib: Math.max(0.5, p.vib + (Math.random() - 0.5) * 0.1),
                flow: 4100 + (Math.random() - 0.5) * 100
            };
        }
        return p;
      }));

      // 3. Operating Point Drift
      setOperatingPoint(prev => ({
          flow: 4200 + (Math.random() - 0.5) * 200,
          head: 52 + (Math.random() - 0.5) * 2
      }));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-cyan-50 selection:bg-cyan-500/30">
      
      {/* HEADER: Specific to Pump Station */}
      <div className="flex items-end justify-between border-b border-cyan-500/30 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Waves size={12} className="animate-pulse" />
             HYDRAULIC CONTROL SYSTEM
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-cyan-400 text-shadow-glow">泵站集群</span> 智能集控中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">STATION-Z12</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Total Flow (Q)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{systemMetrics.totalFlow.toFixed(0)} <span className="text-sm text-slate-500">m³/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Diff Pressure (ΔP)</div>
                <div className="text-2xl font-mono font-bold text-white">{(systemMetrics.outletPressure - systemMetrics.inletPressure).toFixed(2)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">System Eff (η)</div>
                <div className="text-2xl font-mono font-bold text-green-400">{systemMetrics.efficiency.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Hydraulic Status */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Water Levels */}
           <SciFiCard title="液位监测" subtitle="POOLS & TANKS" className="border-cyan-900/50">
              <div className="flex gap-4 h-40">
                  {/* Intake Pool */}
                  <div className="flex-1 bg-slate-900/50 rounded border border-slate-700 relative overflow-hidden flex flex-col justify-end p-2 group">
                      <div className="absolute inset-0 z-0">
                          <div className="absolute bottom-0 w-full bg-cyan-600/40 transition-all duration-1000 animate-pulse" style={{height: '65%'}}></div>
                          <div className="absolute bottom-0 w-full bg-cyan-500/20" style={{height: '62%'}}>
                             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                          </div>
                      </div>
                      <div className="relative z-10 text-right">
                          <div className="text-xs text-slate-300 font-bold mb-1">INTAKE POOL</div>
                          <div className="text-2xl font-mono text-white">4.2m</div>
                          <div className="text-[10px] text-cyan-400">Target: 4.5m</div>
                      </div>
                  </div>
                  
                   {/* Discharge Pool */}
                  <div className="flex-1 bg-slate-900/50 rounded border border-slate-700 relative overflow-hidden flex flex-col justify-end p-2">
                       <div className="absolute inset-0 z-0">
                          <div className="absolute bottom-0 w-full bg-blue-600/40 transition-all duration-1000" style={{height: '82%'}}></div>
                      </div>
                      <div className="relative z-10 text-right">
                          <div className="text-xs text-slate-300 font-bold mb-1">DISCHARGE</div>
                          <div className="text-2xl font-mono text-white">12.8m</div>
                          <div className="text-[10px] text-blue-400">Stable</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Pressure Matrix */}
           <SciFiCard title="压力流体矩阵" className="flex-1 border-cyan-900/50">
              <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded border-l-4 border-cyan-500">
                    <div className="flex items-center gap-3">
                        <Gauge className="text-cyan-500" />
                        <div>
                            <div className="text-xs text-slate-400">INLET PRESSURE</div>
                            <div className="text-xs text-slate-500">Suction Manifold</div>
                        </div>
                    </div>
                    <div className="text-xl font-mono font-bold text-white">{systemMetrics.inletPressure.toFixed(2)} <span className="text-xs">MPa</span></div>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-white/5 rounded border-l-4 border-blue-500">
                    <div className="flex items-center gap-3">
                        <Gauge className="text-blue-500" />
                        <div>
                            <div className="text-xs text-slate-400">OUTLET PRESSURE</div>
                            <div className="text-xs text-slate-500">Main Header</div>
                        </div>
                    </div>
                    <div className="text-xl font-mono font-bold text-white">{systemMetrics.outletPressure.toFixed(2)} <span className="text-xs">MPa</span></div>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-white/5 rounded border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <Activity className="text-green-500" />
                        <div>
                            <div className="text-xs text-slate-400">NPSH (Margin)</div>
                            <div className="text-xs text-slate-500">Cavitation Check</div>
                        </div>
                    </div>
                    <div className="text-xl font-mono font-bold text-green-400">3.5 <span className="text-xs">m</span></div>
                 </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-slate-400">Vibration (Avg)</span>
                     <span className="text-xs text-yellow-500">1.2 mm/s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full w-[30%]"></div>
                  </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin & Curves */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[300px] bg-[#001519] border border-cyan-800/40 relative rounded overflow-hidden shadow-[inset_0_0_40px_rgba(6,182,212,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="text-[10px] text-cyan-600 font-mono">FLOW VELOCITY</div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tracking-tighter">2.4</span>
                    <span className="text-xs text-cyan-500">m/s</span>
                 </div>
              </div>

              <div className="absolute bottom-4 left-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-cyan-100">AI OPTIMIZATION ACTIVE</span>
                 </div>
              </div>

              <ThreeScene type="pump" color="#06b6d4" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* H-Q Curve (The Core Analytic) */}
           <SciFiCard title="性能曲线分析" subtitle="H-Q CURVE" className="h-[280px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="flow" name="Flow" unit="m³/h" stroke="#64748b" domain={[0, 6000]} />
                      <YAxis type="number" dataKey="designHead" name="Head" unit="m" stroke="#64748b" domain={[0, 100]} />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#0891b2'}} />
                      
                      {/* Design Curve */}
                      <Scatter name="Design Curve" data={hqData} line={{stroke: '#0891b2', strokeWidth: 2}} shape={() => null} />
                      
                      {/* Operating Point */}
                      <ReferenceLine x={operatingPoint.flow} stroke="#f59e0b" strokeDasharray="3 3" />
                      <ReferenceLine y={operatingPoint.head} stroke="#f59e0b" strokeDasharray="3 3" />
                      <Scatter name="Operating Point" data={[operatingPoint]} fill="#f59e0b" shape="cross" r={6}>
                      </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
                 <div className="absolute top-12 right-12 bg-black/70 p-2 rounded border border-slate-700 text-[10px] pointer-events-none">
                     <div className="flex items-center gap-2 text-cyan-400">
                         <div className="w-3 h-0.5 bg-cyan-400"></div> Design Curve
                     </div>
                     <div className="flex items-center gap-2 text-amber-400 mt-1">
                         <div className="w-2 h-2 text-amber-400">+</div> Operating Point
                     </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Cluster Status & Energy */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Pump Cluster Status */}
           <SciFiCard title="泵组集群状态" className="flex-1 border-cyan-900/50">
              <div className="grid grid-cols-1 gap-3">
                 {pumpCluster.map(pump => (
                    <div key={pump.id} className={`p-3 rounded border ${pump.status === 'running' ? 'bg-cyan-950/20 border-cyan-800/50' : 'bg-slate-900/20 border-slate-800'} transition-all`}>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              <RotateCw size={14} className={pump.status === 'running' ? 'text-cyan-400 animate-spin' : 'text-slate-600'} style={{animationDuration: '3s'}} />
                              <span className="font-bold text-slate-200">{pump.id}</span>
                           </div>
                           <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${pump.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                              {pump.status}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                           <div>RPM: <span className="text-white">{pump.rpm}</span></div>
                           <div>VIB: <span className={pump.vib > 1.5 ? 'text-yellow-400' : 'text-white'}>{pump.vib.toFixed(1)}</span></div>
                           <div>TMP: <span className="text-white">{pump.temp}°</span></div>
                           <div>FLO: <span className="text-white">{pump.flow}</span></div>
                        </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Energy Analysis */}
           <SciFiCard title="能效分析" subtitle="ENERGY EFF" className="border-cyan-900/50">
              <div className="flex flex-col gap-4">
                 <div>
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Power size={12}/> Specific Energy Consumption</div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-white font-mono">{systemMetrics.energyConsumption.toFixed(3)}</span>
                       <span className="text-xs text-cyan-500">kWh/m³</span>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                       <span>Total Power</span>
                       <span>Target: &lt;2500kW</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="bg-cyan-500 h-full transition-all duration-1000" style={{width: `${(systemMetrics.totalPower / 3000) * 100}%`}}></div>
                    </div>
                    <div className="text-right text-xs font-mono text-cyan-300 mt-1">{systemMetrics.totalPower.toFixed(0)} kW</div>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};