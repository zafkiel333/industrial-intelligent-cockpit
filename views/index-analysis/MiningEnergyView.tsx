
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-mining-energy]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-mining-energy';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, Legend, ReferenceLine, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Zap, Droplets, Leaf, Activity, Layers, 
  TrendingUp, Gauge, Fuel, BatteryCharging
} from 'lucide-react';

// --- MOCK DATA ---

// Energy Mix (Electricity vs Diesel)
const ENERGY_MIX = [
  { name: 'Grid Elec (网电)', value: 55, fill: '#06b6d4' },
  { name: 'Diesel (柴油)', value: 35, fill: '#f59e0b' },
  { name: 'Renewable (绿电)', value: 10, fill: '#22c55e' },
];

// Unit Consumption Trend (SEC)
const SEC_TREND = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    mining: 25 + Math.sin(i * 0.5) * 5 + Math.random(), // kWh/t
    processing: 42 + Math.cos(i * 0.5) * 3 + Math.random(), // kWh/t
    transport: 15 + Math.sin(i * 0.2) * 2 // L/t (Scaled for chart)
}));

// Process Energy Breakdown
const PROCESS_BREAKDOWN = [
    { name: 'Excavation', value: 2500, target: 2400 },
    { name: 'Haulage', value: 4500, target: 4200 },
    { name: 'Crushing', value: 3200, target: 3000 },
    { name: 'Grinding', value: 5800, target: 5500 }, // High consumption
    { name: 'Auxiliary', value: 1500, target: 1500 },
];

export const MiningEnergyView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
    totalEnergy: 18500, // tce (Total Coal Equivalent)
    secMining: 24.5, // kWh/t
    secProcessing: 41.2, // kWh/t
    secTransport: 0.85, // L/t
    carbonIntensity: 12.4, // kgCO2/t
    costRealtime: 0.65 // $/t
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            totalEnergy: prev.totalEnergy + 0.1,
            secMining: 24.5 + Math.sin(Date.now()/5000) * 0.5,
            secProcessing: 41.2 + Math.cos(Date.now()/4000) * 0.8,
            costRealtime: 0.65 + (Math.random()-0.5) * 0.01
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#02040a] text-cyan-50 relative overflow-hidden">
      
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-cyan-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Zap size={14} className="animate-pulse" /> Energy Efficiency Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山能耗 <span className="text-cyan-500">单耗精细化分析</span>
          </h1>
        </div>
        
        {/* Core Metrics */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Layers size={10}/> Total Energy (YTD)</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.totalEnergy.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm text-slate-500">tce</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Leaf size={10}/> Carbon Intensity</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.carbonIntensity.toFixed(1)} <span className="text-sm text-slate-500">kg/t</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Real-time Cost</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">${metrics.costRealtime.toFixed(3)} <span className="text-sm text-slate-500">/t</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Energy Mix & Benchmarks */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="能源消费结构" subtitle="MIX" className="h-[280px] border-cyan-900/50 bg-[#050b14]/80">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={ENERGY_MIX}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {ENERGY_MIX.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#06b6d4', color: '#fff'}} />
                              <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                          <span className="text-2xl font-bold text-white">55%</span>
                          <span className="text-[10px] text-cyan-400 uppercase">Elec</span>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="工序单耗对标 (SEC)" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4 h-full justify-center">
                      
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Mining (kWh/t)</span>
                              <span className="font-bold text-cyan-300">{metrics.secMining.toFixed(1)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{width: `${(metrics.secMining/30)*100}%`}}></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                              <span>Target: 22.0</span>
                              <span className="text-red-400">+11%</span>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Processing (kWh/t)</span>
                              <span className="font-bold text-blue-300">{metrics.secProcessing.toFixed(1)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${(metrics.secProcessing/50)*100}%`}}></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                              <span>Target: 40.0</span>
                              <span className="text-yellow-400">+3%</span>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Haulage (L/t)</span>
                              <span className="font-bold text-amber-400">{metrics.secTransport.toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{width: `${(metrics.secTransport/1.2)*100}%`}}></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                              <span>Target: 0.80</span>
                              <span className="text-green-400">+6%</span>
                          </div>
                      </div>

                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Energy Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#030508] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(6,182,212,0.15)] group">
                  
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Grid Load</div>
                              <div className="text-sm font-bold text-white">42.5 MW</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-amber-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Fuel size={16} className="text-amber-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Fuel Rate</div>
                              <div className="text-sm font-bold text-white">1,250 L/h</div>
                          </div>
                      </div>
                  </div>

                  {/* Node Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/70 p-2 rounded border border-slate-700 text-[10px] text-slate-300">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Electrical Node</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Diesel Node</div>
                  </div>

                  <ThreeScene type="mining-energy-analysis" color="#06b6d4" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Energy Trend Chart */}
              <SciFiCard title="工序能耗趋势 (12 Months)" subtitle="kWh/t" className="h-[240px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={SEC_TREND}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#06b6d4', color: '#fff'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Line type="monotone" dataKey="mining" stroke="#06b6d4" strokeWidth={2} dot={false} name="Mining (Elec)" />
                              <Line type="monotone" dataKey="processing" stroke="#3b82f6" strokeWidth={2} dot={false} name="Processing (Elec)" />
                              <Line type="monotone" dataKey="transport" stroke="#f59e0b" strokeWidth={2} dot={false} name="Haul (Fuel eq)" />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Optimization & Peak Shifting */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Process Breakdown (Bar) */}
              <SciFiCard title="能耗流向分解" subtitle="CONSUMPTION" className="h-[280px] border-cyan-900/50">
                  <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={PROCESS_BREAKDOWN} layout="vertical" margin={{left: 10}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#02040a', borderColor: '#06b6d4'}} />
                              <Bar dataKey="value" name="Actual" fill="#3b82f6" barSize={10} radius={[0, 4, 4, 0]} />
                              <Bar dataKey="target" name="Target" fill="#1e293b" stroke="#06b6d4" strokeDasharray="3 3" barSize={10} radius={[0, 4, 4, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Peak Shifting Advice */}
              <SciFiCard title="削峰填谷建议 (TOU)" subtitle="SAVINGS" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4">
                      <div className="p-3 bg-cyan-900/20 border border-cyan-800/30 rounded flex items-center justify-between">
                          <div>
                              <div className="text-xs text-slate-400">Current Rate</div>
                              <div className="text-sm font-bold text-red-400">PEAK ($0.12/kWh)</div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-slate-400">Potential Save</div>
                              <div className="text-sm font-bold text-green-400">$450 /hr</div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <div className="flex items-start gap-2 text-xs text-slate-300">
                              <BatteryCharging size={14} className="text-yellow-400 mt-0.5" />
                              <span>Shift <strong>Crushing Line B</strong> to 22:00 (Valley).</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-slate-300">
                              <Gauge size={14} className="text-blue-400 mt-0.5" />
                              <span>Throttle <strong>Vent Fan 3</strong> by 10% (Air Quality OK).</span>
                          </div>
                      </div>

                      <button className="mt-auto w-full py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 text-xs rounded border border-cyan-700/50 transition-colors">
                          Apply Optimization Strategy
                      </button>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
