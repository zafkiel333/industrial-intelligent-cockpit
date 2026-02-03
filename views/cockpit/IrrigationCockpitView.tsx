
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  Sprout, Droplets, CloudRain, LayoutGrid, 
  Settings, ArrowRight, Activity, Thermometer, 
  Wind, Map as MapIcon, Grip, Layers, Filter
} from 'lucide-react';

// --- MOCK DATA ---

// Channel Flow Data (Main Canal & Branch Canals)
const CHANNEL_FLOW = [
  { name: '总干渠', flow: 45.2, design: 50.0, efficiency: 92 },
  { name: '东干渠', flow: 18.5, design: 22.0, efficiency: 88 },
  { name: '西干渠', flow: 12.8, design: 15.0, efficiency: 90 },
  { name: '北支渠', flow: 5.2, design: 6.5, efficiency: 85 },
  { name: '南支渠', flow: 4.8, design: 5.0, efficiency: 94 },
];

// Soil Moisture & Crop Water Demand (24h)
const FIELD_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    moisture: 60 + Math.sin((i-6)*0.2) * 10 - Math.random() * 2, // Diurnal cycle
    et: i > 6 && i < 19 ? Math.sin((i-6)/13 * Math.PI) * 5 : 0.2, // Evapotranspiration peaks at noon
    irrigation: i === 20 ? 15 : 0 // Scheduled irrigation event
}));

// Water Allocation Plan vs Actual
const ALLOCATION_DATA = [
    { zone: '一分局', plan: 1200, actual: 1150, crop: 'Paddy' },
    { zone: '二分局', plan: 850, actual: 880, crop: 'Wheat' },
    { zone: '三分局', plan: 600, actual: 590, crop: 'Corn' },
    { zone: '四分局', plan: 920, actual: 910, crop: 'Veg' },
];

// Gate Status
const GATES = [
    { id: 'G-01', name: '总干首部进水闸', open: 85, flow: 45.2, status: 'Remote' },
    { id: 'G-02', name: '东干渠分水闸', open: 60, flow: 18.5, status: 'Remote' },
    { id: 'G-03', name: '西干渠分水闸', open: 45, flow: 12.8, status: 'Auto' },
    { id: 'G-04', name: '退水闸 (泄洪)', open: 0, flow: 0, status: 'Closed' },
];

export const IrrigationCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalDiversion: 1258000, // m3 (Season cumulative)
    instantFlow: 45.2, // m3/s
    irrigatedArea: 45.2, // 10k mu
    waterUseCoeff: 0.58, // Efficiency coefficient
    soilMoistureAvg: 68.5, // %
    cropStressIndex: 0.12 // 0-1, lower is better
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            totalDiversion: prev.totalDiversion + prev.instantFlow * 60,
            instantFlow: 45.2 + Math.sin(Date.now()/5000) * 2,
            soilMoistureAvg: 68.5 - Math.random() * 0.1, // Drying out slowly
            waterUseCoeff: 0.58 + (Math.random()-0.5)*0.001
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#031810] text-emerald-50 relative overflow-hidden">
      
      {/* Organic Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/30 via-[#031810] to-[#031810] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #059669 25%, transparent 25%, transparent 75%, #059669 75%, #059669), repeating-linear-gradient(45deg, #059669 25%, #031810 25%, #031810 75%, #059669 75%, #059669)',
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
      }}></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-emerald-800/50 pb-4 px-2 bg-gradient-to-r from-emerald-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Sprout size={14} className="animate-pulse" /> Smart Agriculture Water Network
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             大型灌区 <span className="text-emerald-500">水资源智能配置驾驶舱</span>
          </h1>
        </div>
        
        {/* KPI Banner */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Droplets size={10}/> Total Diversion</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{(metrics.totalDiversion/10000).toFixed(2)} <span className="text-sm text-slate-500">万m³</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><LayoutGrid size={10}/> Irrigated Area</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.irrigatedArea.toFixed(1)} <span className="text-sm text-slate-500">万亩</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Efficiency Coeff</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{metrics.waterUseCoeff.toFixed(3)}</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Source & Canal Network */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Canal Flow Monitoring */}
              <SciFiCard title="骨干渠系流量监测" subtitle="REAL-TIME FLOW" className="flex-1 border-emerald-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                          {CHANNEL_FLOW.map((ch, i) => (
                              <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-emerald-500/30 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-bold text-emerald-100">{ch.name}</span>
                                      <span className="text-xs text-slate-500">Eff: {ch.efficiency}%</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                              <span>Current: {ch.flow.toFixed(1)}</span>
                                              <span>Design: {ch.design}</span>
                                          </div>
                                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                              <div className="bg-cyan-500 h-full transition-all duration-1000" style={{width: `${(ch.flow/ch.design)*100}%`}}></div>
                                          </div>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">{ch.flow.toFixed(1)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

              {/* Gate Control Status */}
              <SciFiCard title="闸门自动化控制" subtitle="GATE CONTROL" className="h-[280px] border-emerald-900/50">
                  <div className="space-y-3 h-full overflow-y-auto pr-1">
                      {GATES.map((gate, i) => (
                          <div key={i} className="flex flex-col p-2 bg-emerald-900/10 border border-emerald-900/30 rounded">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="text-xs font-bold text-emerald-200">{gate.name}</div>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${gate.status === 'Closed' ? 'bg-slate-700 text-slate-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                      {gate.status}
                                  </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                  <div className="flex-1">
                                      <div className="text-[9px] text-slate-500 uppercase">Opening</div>
                                      <div className="text-sm font-mono font-bold text-white">{gate.open}%</div>
                                  </div>
                                  <div className="w-[1px] h-6 bg-emerald-900/50"></div>
                                  <div className="flex-1">
                                      <div className="text-[9px] text-slate-500 uppercase">Flow</div>
                                      <div className="text-sm font-mono font-bold text-cyan-300">{gate.flow} m³/s</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin & Allocation */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-gradient-to-b from-[#062c20] to-[#020b08] border border-emerald-700/30 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(16,185,129,0.1)] group">
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-emerald-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Settings size={16} className="text-emerald-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Dispatch Mode</div>
                              <div className="text-sm font-bold text-white">Dynamic / On-Demand</div>
                          </div>
                      </div>
                  </div>

                  {/* Weather/ET Overlay */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                      <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs text-blue-200 flex items-center gap-2">
                          <CloudRain size={12}/> Rain Forecast: <span className="font-bold text-white">5mm</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs text-orange-200 flex items-center gap-2">
                          <Wind size={12}/> ET0 (Ref): <span className="font-bold text-white">4.2 mm/d</span>
                      </div>
                  </div>

                  <ThreeScene type="irrigation-network" color="#10b981" />
                  
                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-emerald-900 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Main Canal</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Branch Canal</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Irrigated Field</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Water Stress</div>
                  </div>
              </div>

              {/* Water Allocation Chart */}
              <SciFiCard title="分局需水与配水对比" subtitle="ALLOCATION PLAN" className="h-[240px] border-emerald-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ALLOCATION_DATA} barGap={0}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                              <XAxis dataKey="zone" stroke="#64748b" tick={{fontSize: 12}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Volume (万m³)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#022c22', borderColor: '#10b981', color: '#fff'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Bar dataKey="plan" name="需水计划 (Demand)" fill="#334155" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="actual" name="实配水量 (Allocated)" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Field & Crop Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Field Sensors */}
              <SciFiCard title="田间墒情与作物" subtitle="FIELD SENSORS" className="flex-1 border-emerald-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="flex justify-between items-center p-2 border-b border-emerald-900/30">
                          <span className="text-xs text-slate-400">Avg Soil Moisture</span>
                          <span className="text-xl font-mono font-bold text-blue-300">{metrics.soilMoistureAvg.toFixed(1)}%</span>
                      </div>
                      
                      {/* Soil Moisture Chart */}
                      <div className="flex-1 min-h-[120px]">
                          <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                              <span>Moisture & ET Trend (24h)</span>
                              <span className="text-orange-400">CWSI: {metrics.cropStressIndex}</span>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={FIELD_DATA}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                                  <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 8}} interval={3} />
                                  <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 8}} domain={[0, 100]} hide />
                                  <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{fontSize: 8}} domain={[0, 10]} hide />
                                  <Tooltip contentStyle={{backgroundColor: '#000'}} />
                                  <Area yAxisId="left" type="monotone" dataKey="moisture" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                  <Line yAxisId="right" type="monotone" dataKey="et" stroke="#f97316" strokeWidth={1} dot={false} />
                                  <Bar yAxisId="right" dataKey="irrigation" fill="#10b981" barSize={4} />
                              </ComposedChart>
                          </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-auto">
                          <div className="bg-emerald-900/20 p-2 rounded border border-emerald-800/30 text-center">
                              <div className="text-[10px] text-slate-500">Root Depth</div>
                              <div className="text-sm font-bold text-white">45 cm</div>
                          </div>
                          <div className="bg-emerald-900/20 p-2 rounded border border-emerald-800/30 text-center">
                              <div className="text-[10px] text-slate-500">Salinity (EC)</div>
                              <div className="text-sm font-bold text-yellow-200">1.2 dS/m</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Crop Yield Prediction */}
              <SciFiCard title="作物产量预测" subtitle="AI MODEL" className="h-[200px] border-emerald-900/50">
                  <div className="flex flex-col h-full justify-between py-2">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-500/30">
                              <Filter size={20} className="text-yellow-400" />
                          </div>
                          <div>
                              <div className="text-xs text-slate-400 uppercase tracking-wider">Est. Yield (Wheat)</div>
                              <div className="text-2xl font-bold text-white font-mono">
                                  585 <span className="text-sm text-slate-500 font-normal">kg/mu</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                          <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full w-[92%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Target: 630</span>
                          <span className="text-green-400">+4% vs Last Year</span>
                      </div>

                      <div className="p-2 bg-slate-900/50 rounded border border-slate-700 text-[10px] text-slate-300 mt-2">
                          <span className="font-bold text-emerald-400">Suggestion:</span> Increase irrigation in Zone-2 by 10% to optimize grain filling stage.
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
