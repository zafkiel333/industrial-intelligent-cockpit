
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-ice]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-ice';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Snowflake, Thermometer, Wind, AlertTriangle, 
  Waves, Gauge, Target, Play, Pause, RotateCcw, 
  Flame, Anchor, Lock, Activity, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const TEMP_FORECAST = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    temp: -5 - Math.sin(i * 0.3) * 5 - Math.random() * 2, // -5 to -12
    iceThickness: 0
})).map((d, i) => ({ ...d, iceThickness: 10 + i * 2 })); // Growing thickness

const LEVEL_DATA = Array.from({length: 60}, (_, i) => ({
    time: i,
    upstream: 10 + Math.random() * 0.2,
    downstream: 8 + Math.random() * 0.2
}));

export const HydroIceFloodSimView: React.FC = () => {
  // --- STATE ---
  const [airTemp, setAirTemp] = useState(-8.5);
  const [flowRate, setFlowRate] = useState(800); // m3/s
  const [iceThickness, setIceThickness] = useState(25); // cm
  const [isJammed, setIsJammed] = useState(false);
  
  const [metrics, setMetrics] = useState({
    upstreamLevel: 12.5, // m
    jamPressure: 450, // kPa
    riskIndex: 45 // 0-100
  });

  const [levelHistory, setLevelHistory] = useState(LEVEL_DATA);

  // Physics Logic
  useEffect(() => {
    const interval = setInterval(() => {
        // Logic:
        // Ice Jam forms if Flow is high AND Ice is thick AND Temp is low (Freeze-up jam)
        // OR Flow spikes and breaks ice (Break-up jam)
        
        // Auto-detect Jam condition for simulation
        // Froude number criteria usually used, simplified here:
        const jamProb = (iceThickness * flowRate) / 10000;
        
        if (!isJammed && jamProb > 2.5 && Math.random() > 0.95) {
            setIsJammed(true);
        }

        // Metrics update
        setMetrics(prev => {
            const targetUp = isJammed ? 18.0 : 12.5; // Rise if jammed
            const currentUp = prev.upstreamLevel + (targetUp - prev.upstreamLevel) * 0.1;
            
            return {
                upstreamLevel: currentUp,
                jamPressure: isJammed ? prev.jamPressure + 10 : Math.max(0, prev.jamPressure - 50),
                riskIndex: isJammed ? Math.min(99, prev.riskIndex + 2) : Math.max(10, prev.riskIndex - 1)
            };
        });

        // Update Chart
        setLevelHistory(prev => {
            const next = [...prev.slice(1)];
            next.push({
                time: (prev[prev.length-1].time + 1),
                upstream: metrics.upstreamLevel + (Math.random()-0.5)*0.2,
                downstream: 8 + (Math.random()-0.5)*0.2
            });
            return next;
        });

    }, 500);
    return () => clearInterval(interval);
  }, [flowRate, iceThickness, isJammed, metrics.upstreamLevel]);

  return (
    <div className="h-full w-full relative bg-[#0f172a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-ice" 
            simData={{ 
                flowRate,
                temp: airTemp,
                isJammed,
                iceThickness
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Frost Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_95%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* 2. TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0c4a6e]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-300 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Snowflake size={14} /> CRYOSPHERE MONITORING STATION
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 冰情 (凌汛) <span className="text-cyan-400">行洪能力影响仿真</span>
              </h1>
          </div>
          
          {/* Global Stats */}
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-300 uppercase">Air Temp</div>
                   <div className="text-3xl font-mono font-bold text-cyan-200">{airTemp.toFixed(1)}°C</div>
               </div>
               <div className="w-px h-10 bg-slate-500"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-300 uppercase">Ice Thickness</div>
                   <div className="text-3xl font-mono font-bold text-white">{iceThickness} cm</div>
               </div>
               <div className="w-px h-10 bg-slate-500"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-300 uppercase">Risk Index</div>
                   <div className={`text-3xl font-black ${metrics.riskIndex > 80 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                       {metrics.riskIndex.toFixed(0)}
                   </div>
               </div>
          </div>
      </div>

      {/* 3. FLOAT PANELS (Glassmorphism) */}
      
      {/* Top Left: Thermal & Flow */}
      <div className="absolute left-6 top-32 w-80 pointer-events-none">
          <div className="bg-[#0c4a6e]/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-lg mb-4">
              <h3 className="text-sm font-bold text-cyan-100 mb-4 flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                  <Thermometer size={16}/> 气温与水力条件
              </h3>
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs text-cyan-200 mb-1">
                          <span>Air Temperature</span>
                          <span className="font-mono">{airTemp} °C</span>
                      </div>
                      <input 
                        type="range" min="-30" max="5" step="0.5" 
                        value={airTemp} onChange={(e) => setAirTemp(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-blue-200 mb-1">
                          <span>River Flow Rate</span>
                          <span className="font-mono">{flowRate} m³/s</span>
                      </div>
                      <input 
                        type="range" min="200" max="2000" step="50" 
                        value={flowRate} onChange={(e) => setFlowRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between text-xs text-white mb-1">
                          <span>Ice Thickness</span>
                          <span className="font-mono">{iceThickness} cm</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1" 
                        value={iceThickness} onChange={(e) => setIceThickness(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* Bottom Left: Ice Jam Mechanics */}
      <div className="absolute left-6 bottom-6 w-80 pointer-events-auto">
          <SciFiCard title="冰塞力学监测" subtitle="PRESSURE" className="h-[250px] border-cyan-500/30 bg-[#0c4a6e]/40 backdrop-blur-md">
              <div className="flex flex-col h-full gap-2 p-2">
                  <div className="grid grid-cols-2 gap-2 text-center mb-2">
                      <div className="bg-cyan-900/30 rounded p-2 border border-cyan-500/20">
                          <div className="text-[10px] text-cyan-200">Jam Pressure</div>
                          <div className="text-lg font-bold text-white">{metrics.jamPressure.toFixed(0)} kPa</div>
                      </div>
                      <div className="bg-cyan-900/30 rounded p-2 border border-cyan-500/20">
                          <div className="text-[10px] text-cyan-200">Backwater</div>
                          <div className={`text-lg font-bold ${metrics.upstreamLevel > 15 ? 'text-red-400' : 'text-white'}`}>
                              +{metrics.upstreamLevel.toFixed(1)} m
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={levelHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis hide />
                              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9'}} />
                              <Area type="monotone" dataKey="upstream" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Upstream" />
                              <Area type="monotone" dataKey="downstream" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="Downstream" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </SciFiCard>
      </div>

      {/* Right Panel: Discharge Capacity & Intervention */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 pointer-events-none">
          
          <SciFiCard title="行洪能力评估" subtitle="CAPACITY" className="h-[300px] border-cyan-500/30 bg-[#0c4a6e]/40 backdrop-blur-md pointer-events-auto">
              <div className="p-2 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-300 border-b border-cyan-900 pb-2">
                      <span className="flex items-center gap-2"><Waves size={14}/> Open Channel Cap.</span>
                      <span className="font-mono text-green-400">2500 m³/s</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 border-b border-cyan-900 pb-2">
                      <span className="flex items-center gap-2"><Lock size={14}/> Effective Cap. (Ice)</span>
                      <span className={`font-mono font-bold ${isJammed ? 'text-red-500' : 'text-yellow-400'}`}>
                          {isJammed ? '450' : '1800'} m³/s
                      </span>
                  </div>
                  <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden relative border border-slate-700">
                      <div className="absolute left-0 top-0 bottom-0 bg-green-500 w-full opacity-30"></div>
                      <div 
                         className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${isJammed ? 'bg-red-500' : 'bg-blue-500'}`}
                         style={{width: isJammed ? '18%' : '72%'}}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                          Current Throughput
                      </span>
                  </div>
                  
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-200">
                      {isJammed ? 
                        <div className="flex gap-2"><AlertTriangle size={16}/> <strong>CRITICAL:</strong> Ice Jam blockage detected at Bridge #3. Backwater rising 0.5m/h.</div> 
                        : 
                        <div className="flex gap-2"><CheckCircle2 size={16} className="text-green-400"/> Status Normal. Ice floes moving freely.</div>
                      }
                  </div>
              </div>
          </SciFiCard>

          <div className="flex-1 bg-[#0c4a6e]/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-cyan-900/50 pb-2">
                  <Activity size={16} className="text-orange-500"/> 应急处置干预
              </h3>
              
              <div className="space-y-3">
                  <button 
                    onClick={() => setIsJammed(false)}
                    className="w-full py-3 bg-cyan-700/80 hover:bg-cyan-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                      <Anchor size={16} /> DEPLOY ICE BREAKERS
                  </button>
                  <button 
                    onClick={() => { setIsJammed(false); setIceThickness(5); }}
                    className="w-full py-3 bg-orange-700/80 hover:bg-orange-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                      <Flame size={16} /> CONTROLLED BLASTING
                  </button>
                  <button 
                    onClick={() => setFlowRate(2000)}
                    className="w-full py-3 bg-blue-700/80 hover:bg-blue-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                      <Waves size={16} /> FLUSHING PULSE (Release Dam)
                  </button>
              </div>
          </div>
      </div>

      {/* 4. BOTTOM CENTER: Sim Control */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-cyan-700/50 flex gap-6 text-xs text-slate-300">
               <div className="flex items-center gap-2 cursor-pointer hover:text-white"><Play size={14}/> Run Sim</div>
               <div className="flex items-center gap-2 cursor-pointer hover:text-white"><Pause size={14}/> Pause</div>
               <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => setIsJammed(!isJammed)}><Target size={14}/> Toggle Jam</div>
               <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => {setAirTemp(-8.5); setFlowRate(800); setIceThickness(25); setIsJammed(false);}}><RotateCcw size={14}/> Reset</div>
          </div>
      </div>

    </div>
  );
};
