
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-flood-control]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-flood-control';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';
import { 
  CloudRain, Waves, AlertTriangle, Droplets, 
  Map as MapIcon, Siren, Umbrella, Navigation, ShieldCheck
} from 'lucide-react';

// --- MOCK DATA ---

// Rainfall Radar Grid (Simplified for UI)
const RAIN_GRID = Array.from({length: 25}, (_, i) => ({
    id: i,
    intensity: Math.random() * 100 // 0-100 mm/h
}));

// Hydrograph Data (Rain + Flow)
const HYDROGRAPH_DATA = Array.from({length: 48}, (_, i) => {
    const t = i;
    // Rain pulse
    const rain = t > 10 && t < 20 ? Math.random() * 20 + 10 : Math.random() * 2;
    // Delayed flow response (Unit Hydrograph concept)
    const baseFlow = 500;
    const peakTime = 25;
    const flow = baseFlow + (t > 15 ? 2000 * Math.exp(-Math.pow(t - peakTime, 2) / 50) : 0);
    
    return {
        time: `${t}:00`,
        rain: rain,
        flow: flow,
        warningLevel: 2000
    };
});

// Reservoir Status
const RESERVOIRS = [
    { name: 'A水库', level: 145.2, limit: 150, capacity: 85, inflow: 1200, outflow: 1000 },
    { name: 'B水库', level: 88.5, limit: 90, capacity: 92, inflow: 800, outflow: 1200 },
    { name: 'C水库', level: 210.4, limit: 225, capacity: 65, inflow: 450, outflow: 200 },
];

export const FloodControlView: React.FC = () => {
  // --- STATE ---
  const [floodStatus, setFloodStatus] = useState({
    alertLevel: 'II', // I, II, III, IV
    avgRainfall: 45.2, // mm
    soilSaturation: 88, // %
    riverLevel: 14.5, // m (at key station)
    forecastPeak: 16.2, // m
    peakTime: '14h',
  });

  const [activeStation, setActiveStation] = useState('Station-A');

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setFloodStatus(prev => ({
            ...prev,
            riverLevel: 14.5 + Math.sin(Date.now()/5000) * 0.2,
            avgRainfall: Math.max(0, prev.avgRainfall + (Math.random()-0.5) * 2),
            soilSaturation: Math.min(100, prev.soilSaturation + 0.05)
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0f172a] text-blue-50 relative overflow-hidden">
      
      {/* Background Rain Effect (CSS) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-blue-800/50 pb-4 px-2 bg-gradient-to-r from-blue-950/90 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Umbrella size={14} className="animate-bounce" /> Flood Defense Command
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             防洪度汛 <span className="text-blue-500">& 水情测报驾驶舱</span>
          </h1>
        </div>
        
        {/* Alert Banner */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/50 px-4 py-2 rounded shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse">
                <Siren className="text-red-500" size={24} />
                <div>
                    <div className="text-[10px] text-red-300 font-bold uppercase">Emergency Response</div>
                    <div className="text-2xl font-black text-white leading-none">LEVEL {floodStatus.alertLevel}</div>
                </div>
            </div>
            
            <div className="text-right border-l border-blue-900/50 pl-6">
                <div className="text-[10px] text-slate-400 uppercase">Basin Avg Rain (24h)</div>
                <div className="text-2xl font-mono font-bold text-blue-300">{floodStatus.avgRainfall.toFixed(1)} <span className="text-sm text-slate-500">mm</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Rain & Soil (The "Sky") */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="雨情雷达拼图" subtitle="REAL-TIME RADAR" className="h-[300px] border-blue-900/50 bg-[#0b1120]" noPadding>
                  <div className="w-full h-full p-4 flex flex-col items-center">
                      {/* Simulated Radar Grid Heatmap */}
                      <div className="grid grid-cols-5 gap-1 w-full aspect-square max-w-[220px]">
                          {RAIN_GRID.map((cell) => {
                              // Color mapping
                              let color = '#1e293b';
                              if (cell.intensity > 50) color = '#7f1d1d'; // Extreme
                              else if (cell.intensity > 25) color = '#b91c1c'; // Heavy
                              else if (cell.intensity > 10) color = '#eab308'; // Moderate
                              else if (cell.intensity > 0) color = '#0ea5e9'; // Light
                              
                              return (
                                  <div 
                                    key={cell.id} 
                                    className="w-full h-full rounded-sm transition-colors duration-1000"
                                    style={{backgroundColor: color, opacity: 0.8}}
                                  ></div>
                              );
                          })}
                      </div>
                      <div className="w-full mt-4 flex justify-between text-[10px] text-slate-400 px-4">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sky-500"></div> Light</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500"></div> Mod</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600"></div> Heavy</div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="土壤墒情监测" className="flex-1 border-blue-900/50">
                  <div className="flex flex-col gap-4 justify-center h-full">
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <Droplets size={18} className="text-blue-400" />
                              <span className="text-sm font-bold text-slate-200">Soil Saturation</span>
                          </div>
                          <span className="text-xl font-bold text-white">{floodStatus.soilSaturation.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${floodStatus.soilSaturation > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${floodStatus.soilSaturation}%`}}></div>
                      </div>
                      <div className="p-2 bg-blue-900/20 border border-blue-800/30 rounded text-xs text-blue-200">
                          <span className="font-bold">Analysis:</span> High saturation levels indicate minimal infiltration capacity. Runoff coefficient estimated at 0.85.
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Basin & Forecast */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* 3D Basin Container */}
              <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(59,130,246,0.15)] group">
                  {/* Floating Labels (Hydro Stations) */}
                  <div className="absolute top-1/4 left-1/4 z-20 cursor-pointer hover:scale-110 transition-transform" onClick={() => setActiveStation('Station-A')}>
                      <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_yellow] animate-pulse"></div>
                          <div className="mt-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white border border-slate-600">Station A</div>
                      </div>
                  </div>
                  
                  <div className="absolute top-1/3 right-1/3 z-20 cursor-pointer hover:scale-110 transition-transform" onClick={() => setActiveStation('Station-B')}>
                      <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-pulse"></div>
                          <div className="mt-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white border border-slate-600">Reservoir X</div>
                      </div>
                  </div>

                  {/* Top HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 p-2 rounded flex items-center gap-3">
                          <Waves size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">River Level (Ref)</div>
                              <div className="text-lg font-bold text-white font-mono">{floodStatus.riverLevel.toFixed(2)} m</div>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="flood-basin" color="#3b82f6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* Hydrograph (Forecast) */}
              <SciFiCard title="洪水预报过程线 (Hydrograph)" subtitle="FORECAST" className="h-[280px] border-blue-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={HYDROGRAPH_DATA}>
                              <defs>
                                  <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} interval={4} />
                              
                              {/* Left Y: Flow/Level */}
                              <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Flow (m³/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6' }} />
                              
                              {/* Right Y: Rainfall (Inverted) */}
                              <YAxis yAxisId="right" orientation="right" reversed stroke="#94a3b8" tick={{fontSize: 10}} label={{ value: 'Rain (mm)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#94a3b8' }} />
                              
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              {/* Rain Bars */}
                              <Bar yAxisId="right" dataKey="rain" fill="#94a3b8" barSize={4} name="Rainfall" />
                              
                              {/* Flow Area */}
                              <Area yAxisId="left" type="monotone" dataKey="flow" stroke="#3b82f6" fill="url(#flowGrad)" strokeWidth={2} name="Discharge" />
                              
                              {/* Warning Line */}
                              <ReferenceLine yAxisId="left" y={2000} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Warning Flow', fill: '#ef4444', fontSize: 10}} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Water Regimen (The "Ground") */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Reservoir Capacity Status */}
              <SciFiCard title="水库纳洪能力" subtitle="CAPACITY" className="flex-1 border-blue-900/50">
                  <div className="flex flex-col gap-4">
                      {RESERVOIRS.map((res, i) => (
                          <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-200">{res.name}</span>
                                  <span className={`text-[10px] px-1.5 rounded ${res.capacity > 90 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                      库容 {res.capacity}%
                                  </span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                                  <div className={`h-full ${res.capacity > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${res.capacity}%`}}></div>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>水位：{res.level} m</span>
                                  <span>入流：{res.inflow} / 出流：{res.outflow}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Dispatch Action Panel */}
              <SciFiCard title="调度指令状态" subtitle="ACTIONS" className="border-blue-900/50">
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-blue-900/10 border border-blue-800/30 rounded">
                          <div className="flex items-center gap-2">
                              <ShieldCheck size={16} className="text-green-400" />
                              <div className="text-xs text-white">Dam A: Spillway Open</div>
                          </div>
                          <span className="text-xs font-bold text-blue-300">50%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-900/10 border border-blue-800/30 rounded">
                          <div className="flex items-center gap-2">
                              <AlertTriangle size={16} className="text-yellow-400" />
                              <div className="text-xs text-white">River Section B</div>
                          </div>
                          <span className="text-xs font-bold text-yellow-400">EVACUATE</span>
                      </div>
                      
                      <div className="mt-2 text-[10px] text-slate-500 text-center">
                          Next dispatch consultation at 16:00
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
