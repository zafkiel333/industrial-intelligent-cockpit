
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-dust]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-dust';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Wind, CloudFog, Droplets, Fan, 
  Activity, Gauge, Power, ShieldCheck, 
  Settings, AlertTriangle, CloudRain,
  Play, Pause, RefreshCw, BarChart2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from 'recharts';

// --- Types & Data ---

const PM_HISTORY = Array.from({length: 60}, (_, i) => ({
    time: i,
    pm25: 15 + Math.random() * 5,
    pm10: 45 + Math.random() * 10,
    limit25: 35,
    limit10: 100
}));

const EFFICIENCY_DATA = [
    { name: 'Initial', dust: 1200, fill: '#ef4444' },
    { name: 'After Spray', dust: 450, fill: '#f59e0b' },
    { name: 'After Fan', dust: 80, fill: '#22c55e' },
];

export const MineDustSimView: React.FC = () => {
  // --- STATE ---
  const [isRunning, setIsRunning] = useState(true);
  
  // Controls
  const [productionRate, setProductionRate] = useState(60); // % (Source intensity)
  const [fanPower, setFanPower] = useState(70); // % (Suction)
  const [mistEnabled, setMistEnabled] = useState(false); // Spray
  
  // Metrics
  const [metrics, setMetrics] = useState({
    pm10: 145, // µg/m³
    pm25: 42,  // µg/m³
    captureEff: 85.5, // %
    pressureDrop: 1240, // Pa
    filterLoad: 45 // %
  });

  const [graphData, setGraphData] = useState(PM_HISTORY);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // Physics Logic
        // Base dust proportional to production
        let baseDust = (productionRate / 100) * 500;
        
        // Mitigation
        let mitigationFactor = 0;
        if (fanPower > 0) mitigationFactor += (fanPower/100) * 0.7; // Fan removes 70% max
        if (mistEnabled) mitigationFactor += 0.25; // Mist removes 25%

        const remainingDust = Math.max(10, baseDust * (1 - mitigationFactor));
        
        // Update Metrics
        setMetrics(prev => ({
            pm10: remainingDust + (Math.random()-0.5)*10,
            pm25: remainingDust * 0.3 + (Math.random()-0.5)*5,
            captureEff: mitigationFactor * 100,
            pressureDrop: 500 + (fanPower/100) * 1500 + (prev.filterLoad > 80 ? 500 : 0),
            filterLoad: Math.min(100, prev.filterLoad + (remainingDust > 100 ? 0.05 : 0))
        }));

        // Update Graph
        setGraphData(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: (prev[prev.length-1].time + 1),
                pm25: remainingDust * 0.3,
                pm10: remainingDust,
                limit25: 35,
                limit10: 150
            });
            return next;
        });

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, productionRate, fanPower, mistEnabled]);

  return (
    <div className="h-full w-full relative bg-[#0e161b] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-dust" 
            simData={{ 
                fanPower,
                mistEnabled,
                productionRate
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0e161b_100%)] pointer-events-none"></div>
          {/* Dust Haze Overlay if PM high */}
          {metrics.pm10 > 200 && (
             <div className="absolute inset-0 bg-yellow-900/10 pointer-events-none animate-pulse"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0f1f2e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <CloudFog size={14} /> AIR QUALITY CONTROL
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 粉尘源产生 <span className="text-cyan-500">& 除尘效率仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">PM10 Concentration</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.pm10 > 150 ? 'text-yellow-500' : 'text-cyan-400'}`}>
                       {metrics.pm10.toFixed(0)} <span className="text-sm text-slate-500">µg/m³</span>
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Capture Efficiency</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.captureEff.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Charts & Data */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* PM Trend */}
          <SciFiCard title="粉尘浓度实时监测" subtitle="PM2.5 / PM10" className="flex-1 border-cyan-900/50 bg-[#081014]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={graphData}>
                              <defs>
                                  <linearGradient id="gradPM" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="time" hide />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 500]} />
                              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#eab308'}} />
                              <ReferenceLine y={150} stroke="red" strokeDasharray="3 3" label={{value: 'Limit', fill: 'red', fontSize: 10}} />
                              <Area type="monotone" dataKey="pm10" stroke="#eab308" fill="url(#gradPM)" strokeWidth={2} name="PM10" />
                              <Line type="monotone" dataKey="pm25" stroke="#06b6d4" strokeWidth={1} dot={false} name="PM2.5" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-center text-[10px]">
                      <div className="bg-slate-900/50 rounded p-1 text-cyan-300">PM2.5: {metrics.pm25.toFixed(0)}</div>
                      <div className="bg-slate-900/50 rounded p-1 text-yellow-500">PM10: {metrics.pm10.toFixed(0)}</div>
                  </div>
              </div>
          </SciFiCard>

          {/* Efficiency Breakdown */}
          <SciFiCard title="除尘效果对比" subtitle="REDUCTION" className="h-[240px] border-cyan-900/50 bg-[#081014]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={EFFICIENCY_DATA} layout="vertical" margin={{left: 20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{fontSize: 10}} />
                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#000', borderColor: '#22c55e'}} />
                          <Bar dataKey="dust" radius={[0, 4, 4, 0]} barSize={20}>
                              {EFFICIENCY_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Controls */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#081014]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 系统运行控制
              </h3>
              
              <div className="space-y-6">
                  
                  {/* Fan Control */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-2"><Fan size={12}/> Suction Fan Power</span>
                          <span className="font-mono text-cyan-400">{fanPower}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={fanPower} 
                        onChange={(e) => setFanPower(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Mist Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${mistEnabled ? 'bg-blue-900/40 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                              <Droplets size={16}/>
                          </div>
                          <div>
                              <div className="text-xs font-bold text-white">Water Mist</div>
                              <div className="text-[10px] text-slate-400">Suppression Spray</div>
                          </div>
                      </div>
                      <button 
                         onClick={() => setMistEnabled(!mistEnabled)}
                         className={`w-12 h-6 rounded-full p-1 transition-colors ${mistEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${mistEnabled ? 'translate-x-6' : ''}`}></div>
                      </button>
                  </div>

                  {/* Production Load */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Production Rate (Dust Source)</span>
                          <span className="font-mono text-yellow-500">{productionRate}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="10" 
                        value={productionRate} 
                        onChange={(e) => setProductionRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                  </div>

              </div>

              {/* System State */}
              <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${isRunning ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
                    `}
                  >
                      {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                      {isRunning ? 'RUNNING' : 'PAUSED'}
                  </button>
                  <button onClick={() => { setFanPower(0); setMistEnabled(false); }} className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                      <RefreshCw size={14}/>
                  </button>
              </div>
          </div>

          {/* Filter Status */}
          <SciFiCard title="除尘器状态" subtitle="FILTER BAGS" className="flex-1 border-cyan-900/50 bg-[#081014]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 p-1">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Gauge size={14} className="text-purple-400"/> Pressure Drop
                      </div>
                      <span className="font-mono text-white font-bold">{metrics.pressureDrop.toFixed(0)} Pa</span>
                  </div>

                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                          <span>Bag Load</span>
                          <span className={`${metrics.filterLoad > 90 ? 'text-red-500' : 'text-green-400'}`}>{metrics.filterLoad.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${metrics.filterLoad > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                             style={{width: `${metrics.filterLoad}%`}}
                          ></div>
                      </div>
                  </div>
                  
                  {metrics.filterLoad > 90 && (
                      <div className="p-2 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-xs text-red-200">
                          <AlertTriangle size={14} /> Cleaning Cycle Required!
                      </div>
                  )}

                  <div className="mt-auto text-center text-[10px] text-slate-500">
                      Pulse-Jet System: Auto
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
