
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-freeze]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-freeze';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Snowflake, Thermometer, Clock, Activity, 
  Settings, Play, Pause, RefreshCw, 
  Layers, Lock, AlertCircle, Droplets
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ReferenceLine
} from 'recharts';

// --- DATA ---
const TEMP_HISTORY_TEMPLATE = Array.from({length: 30}, (_, i) => ({
    day: i,
    mainFace: 15,
    interface: 15,
    wall: 15
}));

export const MineFreezeSimView: React.FC = () => {
  // State
  const [isRunning, setIsRunning] = useState(true);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [brineTemp, setBrineTemp] = useState(-30); // Target temp
  const [flowRate, setFlowRate] = useState(120); // m3/h
  const [mode, setMode] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');

  // Metrics
  const [metrics, setMetrics] = useState({
    avgWallTemp: 15,
    wallThickness: 0,
    closureStatus: 'OPEN', // OPEN, CLOSING, CLOSED
    energyCop: 2.4
  });

  const [tempHistory, setTempHistory] = useState(TEMP_HISTORY_TEMPLATE);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        setDaysElapsed(d => d + 1);

        setMetrics(prev => {
            const days = daysElapsed + 1;
            // Simplified Stefan Formula approx logic
            // Thickness ~ sqrt(days) * (Ambient - Brine) * k
            const deltaT = Math.abs(brineTemp);
            const rate = mode === 'ACTIVE' ? 0.05 : 0.01;
            const thickness = Math.min(4.0, rate * Math.sqrt(days) * (deltaT / 30));
            
            // Wall temp drops
            const wallTemp = 15 - (days * (deltaT/100));

            return {
                avgWallTemp: Math.max(brineTemp, wallTemp),
                wallThickness: thickness,
                closureStatus: thickness > 2.5 ? 'CLOSED' : 'CLOSING',
                energyCop: 2.4 - (Math.abs(brineTemp)/100)
            };
        });

        // Update Chart
        setTempHistory(prev => {
            const last = prev[prev.length - 1];
            const newDay = last.day + 1;
            const deltaT = Math.abs(brineTemp);
            // Temp decay curves
            return [...prev.slice(1), {
                day: newDay,
                mainFace: Math.max(brineTemp + 5, last.mainFace - 0.2 * (deltaT/30)),
                interface: Math.max(brineTemp + 2, last.interface - 0.4 * (deltaT/30)),
                wall: Math.max(brineTemp, last.wall - 0.6 * (deltaT/30))
            }];
        });

    }, 200); // Fast forward time

    return () => clearInterval(interval);
  }, [isRunning, daysElapsed, brineTemp, mode]);

  return (
    <div className="h-full w-full relative bg-[#020617] text-sky-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-freeze" 
            simData={{ 
                days: daysElapsed,
                brineTemp: brineTemp
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020617_100%)] pointer-events-none"></div>
          {/* Frost Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#082f49]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Snowflake size={14} /> ARTIFICIAL GROUND FREEZING (AGF)
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿山井筒 <span className="text-cyan-500">冻结法施工仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Frozen Wall Status</div>
                   <div className={`text-2xl font-bold flex items-center justify-end gap-2 ${metrics.closureStatus === 'CLOSED' ? 'text-green-400' : 'text-yellow-400'}`}>
                       {metrics.closureStatus === 'CLOSED' ? <Lock size={20}/> : <Activity size={20}/>}
                       {metrics.closureStatus}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Elapsed Time</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       DAY {daysElapsed}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#081826]/90 backdrop-blur-md border border-cyan-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-cyan-900/50 pb-2">
                  <Settings size={16} className="text-cyan-500"/> 冷冻站参数控制
              </h3>
              
              <div className="space-y-6">
                  {/* Brine Temp */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Brine Supply Temp</span>
                          <span className="font-mono text-cyan-300">{brineTemp.toFixed(1)} °C</span>
                      </div>
                      <input 
                        type="range" min="-40" max="-10" step="1" 
                        value={brineTemp} 
                        onChange={(e) => setBrineTemp(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Flow Rate */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Circulation Flow</span>
                          <span className="font-mono text-blue-300">{flowRate} m³/h</span>
                      </div>
                      <input 
                        type="range" min="50" max="200" step="10" 
                        value={flowRate} 
                        onChange={(e) => setFlowRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex gap-2 bg-slate-900/50 p-1 rounded border border-slate-700">
                      <button 
                         onClick={() => setMode('ACTIVE')}
                         className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${mode === 'ACTIVE' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                          ACTIVE FREEZE
                      </button>
                      <button 
                         onClick={() => setMode('MAINTENANCE')}
                         className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${mode === 'MAINTENANCE' ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                          MAINTENANCE
                      </button>
                  </div>
              </div>

              {/* Playback */}
              <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${isRunning ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
                    `}
                  >
                      {isRunning ? <Pause size={14}/> : <Play size={14}/>}
                      {isRunning ? 'PAUSE' : 'RESUME'}
                  </button>
                  <button 
                    onClick={() => { setDaysElapsed(0); setMetrics(m => ({...m, wallThickness: 0, closureStatus: 'OPEN'})); }}
                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                      <RefreshCw size={14}/>
                  </button>
              </div>
          </div>

          {/* Quick Stats */}
          <SciFiCard title="冻结壁参数监测" subtitle="WALL STATS" className="flex-1 border-cyan-900/50 bg-[#081826]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase">Avg Temp</div>
                          <div className={`text-lg font-bold ${metrics.avgWallTemp < 0 ? 'text-cyan-300' : 'text-orange-400'}`}>
                              {metrics.avgWallTemp.toFixed(1)} °C
                          </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase">Thickness</div>
                          <div className="text-lg font-bold text-white">
                              {metrics.wallThickness.toFixed(2)} m
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-auto">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Design Thickness (2.5m)</span>
                          <span>{(metrics.wallThickness/2.5*100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300" style={{width: `${Math.min(100, metrics.wallThickness/2.5*100)}%`}}></div>
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Temperature Field Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="温度场演化曲线" subtitle="TEMP vs TIME" className="h-[300px] border-cyan-900/50 bg-[#081826]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[-40, 20]} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9'}} />
                          <ReferenceLine y={0} stroke="#fff" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="wall" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Freeze Wall" />
                          <Line type="monotone" dataKey="interface" stroke="#3b82f6" strokeWidth={2} dot={false} name="Interface" />
                          <Line type="monotone" dataKey="mainFace" stroke="#f59e0b" strokeWidth={2} dot={false} name="Excavation Face" />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <SciFiCard title="纵向测温孔数据" subtitle="DEPTH PROFILE" className="flex-1 border-cyan-900/50 bg-[#081826]/90 pointer-events-auto">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {[
                      { depth: 100, temp: metrics.avgWallTemp + 2, status: 'Frozen' },
                      { depth: 200, temp: metrics.avgWallTemp, status: 'Frozen' },
                      { depth: 300, temp: metrics.avgWallTemp - 1, status: 'Frozen' },
                      { depth: 400, temp: metrics.avgWallTemp + 5, status: 'Closing' },
                      { depth: 500, temp: metrics.avgWallTemp + 8, status: 'Unfrozen' },
                  ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex items-center gap-3">
                              <Layers size={14} className="text-slate-500" />
                              <span className="text-xs font-bold text-white">-{row.depth}m</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className={`text-xs font-mono font-bold ${row.temp < 0 ? 'text-cyan-300' : 'text-orange-300'}`}>{row.temp.toFixed(1)}°C</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded w-16 text-center ${
                                  row.status === 'Frozen' ? 'bg-cyan-900/40 text-cyan-400' : 
                                  row.status === 'Closing' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
                              }`}>{row.status}</span>
                          </div>
                      </div>
                  ))}
                  
                  <div className="mt-auto p-2 bg-slate-800/50 rounded border border-slate-700 flex items-center gap-2">
                      <AlertCircle size={14} className="text-yellow-500" />
                      <span className="text-[10px] text-slate-300">
                          Closure anomaly detected at -450m level. Check brine flow balance.
                      </span>
                  </div>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
