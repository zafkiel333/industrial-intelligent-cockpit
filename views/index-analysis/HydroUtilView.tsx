
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-hydro-util]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-hydro-util';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Droplets, Zap, Activity, Waves, Gauge, 
  TrendingUp, ArrowDown, Settings, AlertCircle
} from 'lucide-react';

// --- MOCK DATA ---

// Efficiency Hill Curve (Head vs Power)
const HILL_CURVE = Array.from({length: 50}, (_, i) => {
    // Generate scattered points to represent operation zones
    const head = 80 + Math.random() * 40; // m
    const power = 100 + Math.random() * 200; // MW
    const distToOptimal = Math.sqrt(Math.pow(head - 100, 2) + Math.pow(power - 200, 2));
    const eff = 95 - distToOptimal * 0.2; // Peak at 100m, 200MW
    return { head, power, eff: Math.max(0, eff) };
});

const CONSUMPTION_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    rate: 2.4 + Math.sin(i * 0.3) * 0.2 + Math.random() * 0.05, // m3/kWh
    standard: 2.35
}));

export const HydroUtilView: React.FC = () => {
  // --- STATE ---
  const [waterHead, setWaterHead] = useState(105.0); // m
  const [activePower, setActivePower] = useState(185.0); // MW
  
  const [metrics, setMetrics] = useState({
    flowRate: 185.5, // m3/s
    efficiency: 92.5, // %
    consumptionRate: 2.45, // m3/kWh
    potentialEnergy: 205.0, // MW (Theoretical)
    utilizationRate: 90.2 // %
  });

  // Physics Simulation
  useEffect(() => {
    // P = 9.81 * eta * Q * H
    // => Q = P / (9.81 * eta * H)
    // Efficiency curve approximation based on Head/Power deviation from design
    const designHead = 100;
    const designPower = 200;
    
    // Efficiency penalty for off-design
    const headFactor = 1 - Math.abs(waterHead - designHead) / 200;
    const powerFactor = 1 - Math.abs(activePower - designPower) / 400;
    const eta = 0.94 * headFactor * powerFactor; // Max 94%

    const flow = (activePower * 1000) / (9.81 * eta * waterHead); // m3/s
    
    // Consumption Rate = Q * 3600 / (P * 1000)  (m3 per kWh)
    // Simplify: 3.6 / (9.81 * eta * H) * 1000 is wrong unit conversion logic check...
    // Correct: (m3/s * 3600 s/h) / (MW * 1000 kW/MW) = m3/kWh
    const consRate = (flow * 3600) / (activePower * 1000);

    const potential = 9.81 * flow * waterHead / 1000; // MW

    setMetrics({
        flowRate: flow,
        efficiency: eta * 100,
        consumptionRate: consRate,
        potentialEnergy: potential,
        utilizationRate: (activePower / potential) * 100
    });

  }, [waterHead, activePower]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#081b2e] text-cyan-50 relative overflow-hidden">
      
      {/* Fluid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-blue-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Waves size={14} className="animate-pulse" /> Hydropower Efficiency Lab
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水能利用率 <span className="text-cyan-500">& 耗水率分析</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Zap size={10}/> Utilization Rate</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.utilizationRate.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Droplets size={10}/> Water Consumption</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.consumptionRate.toFixed(3)} <span className="text-sm text-slate-500">m³/kWh</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Efficiency</div>
                <div className="text-2xl font-mono font-bold text-blue-300">{metrics.efficiency.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Controls & Real-time Metrics */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="工况仿真控制 (Simulation)" subtitle="INPUTS" className="flex-1 border-cyan-900/50 bg-[#0c1624]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Water Head Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-cyan-200">
                              <span className="flex items-center gap-2"><ArrowDown size={12}/> 水头 (Net Head)</span>
                              <span className="font-mono">{waterHead.toFixed(1)} m</span>
                          </div>
                          <input 
                            type="range" min="80" max="130" step="0.5" 
                            value={waterHead} onChange={(e) => setWaterHead(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                      </div>

                      {/* Active Power Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><Zap size={12}/> 负荷 (Active Power)</span>
                              <span className="font-mono">{activePower.toFixed(1)} MW</span>
                          </div>
                          <input 
                            type="range" min="50" max="250" step="1" 
                            value={activePower} onChange={(e) => setActivePower(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-cyan-900/20 p-2 rounded border border-cyan-800/30">
                              <div className="text-[10px] text-slate-400">Flow (Q)</div>
                              <div className="text-lg font-bold text-white">{metrics.flowRate.toFixed(1)} m³/s</div>
                          </div>
                          <div className="bg-cyan-900/20 p-2 rounded border border-cyan-800/30">
                              <div className="text-[10px] text-slate-400">Potential (P)</div>
                              <div className="text-lg font-bold text-white">{metrics.potentialEnergy.toFixed(1)} MW</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="仪表盘" className="h-[200px] border-cyan-900/50">
                  <div className="flex items-center justify-center h-full relative">
                      <div className="relative w-40 h-40">
                          {/* Gauge Arc */}
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" />
                              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="126" strokeDashoffset={126 - (126 * (metrics.efficiency - 80) / 20)} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                              <span className="text-3xl font-bold text-white">{metrics.efficiency.toFixed(1)}%</span>
                              <span className="text-[10px] text-slate-400 uppercase">Efficiency</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#05080c] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Gauge size={16} className="text-cyan-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Specific Consumption</div>
                              <div className="text-sm font-bold text-white">{metrics.consumptionRate.toFixed(3)} m³/kWh</div>
                          </div>
                      </div>
                  </div>

                  {/* Flow Visualization Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-cyan-900 text-[10px] text-slate-300">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Water Flow Vector</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Energy Conversion</div>
                  </div>

                  <ThreeScene type="hydro-util-analysis" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Trend Chart */}
              <SciFiCard title="耗水率趋势分析 (24H)" subtitle="m³/kWh" className="h-[220px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={CONSUMPTION_TREND}>
                              <defs>
                                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[2.0, 3.0]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#22d3ee'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Area type="monotone" dataKey="rate" stroke="#22d3ee" fill="url(#colorRate)" strokeWidth={2} name="Actual Rate" />
                              <Line type="step" dataKey="standard" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Standard" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Hill Chart & Losses */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Hill Chart */}
              <SciFiCard title="运行工况区 (Hill Chart)" subtitle="OPTIMIZATION" className="h-[280px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis type="number" dataKey="head" name="Head" unit="m" stroke="#64748b" domain={[60, 140]} label={{ value: 'Head (m)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis type="number" dataKey="power" name="Power" unit="MW" stroke="#64748b" domain={[0, 300]} label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                              
                              {/* Operating Zone Points */}
                              <Scatter name="Zones" data={HILL_CURVE} fill="#1e3a8a" shape="circle" />
                              
                              {/* Current Point */}
                              <Scatter name="Current" data={[{head: waterHead, power: activePower}]} fill="#facc15" shape="cross" r={8} />
                          </ScatterChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] bg-black/50 px-2 py-1 rounded text-slate-400">
                          Yellow Cross: Current Op
                      </div>
                  </div>
              </SciFiCard>

              {/* Loss Analysis */}
              <SciFiCard title="能量损失分析" subtitle="LOSSES" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Hydraulic Loss</span>
                              <span className="text-white">3.5%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full" style={{width: '40%'}}></div>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Mechanical Loss</span>
                              <span className="text-white">1.2%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-yellow-600 h-full" style={{width: '15%'}}></div>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">Electrical Loss</span>
                              <span className="text-white">1.8%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-600 h-full" style={{width: '20%'}}></div>
                          </div>
                      </div>
                      
                      <div className="mt-auto p-2 bg-slate-800 rounded border border-slate-700 flex items-center gap-2">
                          <AlertCircle size={14} className="text-yellow-500" />
                          <div className="text-[10px] text-slate-300">
                              Suggestion: Operate near 190MW for peak eff.
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
