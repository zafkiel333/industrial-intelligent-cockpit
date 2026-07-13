import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-turb]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-turb';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Zap, Fan, Activity, Droplets, 
  Gauge, AlertTriangle, TrendingUp, RotateCw,
  Wind, ArrowDownCircle, Settings2, Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- MOCK DATA ---
const HILL_CHART_POINTS = Array.from({length: 100}, (_, i) => {
    // Generate efficiency contours (Hill)
    const head = 80 + Math.random() * 40; // X
    const power = 100 + Math.random() * 200; // Y
    const distToPeak = Math.sqrt(Math.pow(head-100, 2) + Math.pow(power-200, 2));
    const eff = Math.max(70, 95 - distToPeak * 0.2);
    return { head, power, eff };
});

const PULSATION_DATA = Array.from({length: 40}, (_, i) => ({
    freq: i * 5,
    amp: Math.random() * 0.5 + (i===5 ? 2.0 : 0) // Draft tube vortex peak
}));

export const HydroTurbineSimView: React.FC = () => {
  // --- STATE ---
  const [head, setHead] = useState(100); // m
  const [guideVane, setGuideVane] = useState(80); // %
  const [rpm, setRpm] = useState(150); // RPM
  
  const [metrics, setMetrics] = useState({
    power: 200, // MW
    efficiency: 92.5, // %
    flow: 220, // m3/s
    cavitationSigma: 0.12,
    vibration: 0.8 // mm/s
  });

  const [currentOpPoint, setCurrentOpPoint] = useState({ head: 100, power: 200 });

  // Physics Loop
  useEffect(() => {
    const interval = setInterval(() => {
        // Simple Characteristic Calculation
        // P ~ H * Q * eta
        // Q ~ sqrt(H) * Opening
        const q = (guideVane / 100) * 250 * Math.sqrt(head / 100);
        
        // Efficiency Hill Logic
        const headDev = Math.abs(head - 100);
        const loadDev = Math.abs(guideVane - 80);
        const eta = 0.95 - (headDev * 0.002) - (loadDev * 0.003);
        
        const p = 9.81 * q * head * eta / 1000; // MW

        // Cavitation Risk (Sigma)
        // Thoma Sigma approx
        const sigma = 0.2 - (head / 1000); 

        // Vibration (Draft tube vortex if partial load)
        const vib = guideVane < 50 ? 2.5 + Math.random() : 0.8 + Math.random() * 0.2;

        setMetrics({
            power: p,
            efficiency: eta * 100,
            flow: q,
            cavitationSigma: sigma,
            vibration: vib
        });

        setCurrentOpPoint({ head, power: p });

    }, 200);
    return () => clearInterval(interval);
  }, [head, guideVane, rpm]);

  return (
    <div className="h-full w-full relative bg-[#04080c] text-cyan-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE (Full Background) */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-turbine" 
            simData={{ 
                rpm,
                guideVaneOpen: guideVane,
                cavitation: metrics.cavitationSigma < 0.1 ? 0.8 : 0
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#04080c_90%)] pointer-events-none"></div>
      </div>

      {/* OVERLAY DASHBOARD UI */}
      
      {/* 1. Header (Top) */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Fan size={14} /> FLUID DYNAMICS LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水轮机组 <span className="text-cyan-500">水力性能仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto">
              <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Active Power</div>
                  <div className="text-3xl font-mono font-bold text-white">{metrics.power.toFixed(1)} <span className="text-sm text-slate-500">MW</span></div>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                  <div className="text-3xl font-mono font-bold text-green-400">{metrics.efficiency.toFixed(1)}%</div>
              </div>
          </div>
      </div>

      {/* 2. Left HUD: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 z-20 pointer-events-none flex flex-col gap-6">
          
          {/* Main Control Panel */}
          <div className="bg-[#061016]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-5 pointer-events-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 border-b border-cyan-900/50 pb-2">
                  <Settings2 size={16} className="text-cyan-400"/> 工况调节控制
              </h3>
              
              <div className="space-y-6">
                  {/* Head */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-cyan-200">
                          <span className="flex items-center gap-2"><ArrowDownCircle size={14}/> 水头 (Head)</span>
                          <span className="font-mono text-white">{head} m</span>
                      </div>
                      <input 
                        type="range" min="60" max="150" step="1" 
                        value={head} onChange={(e) => setHead(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Guide Vane */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-cyan-200">
                          <span className="flex items-center gap-2"><Wind size={14}/> 导叶开度 (Opening)</span>
                          <span className="font-mono text-white">{guideVane}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1" 
                        value={guideVane} onChange={(e) => setGuideVane(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                  </div>

                  {/* RPM */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-cyan-200">
                          <span className="flex items-center gap-2"><RotateCw size={14}/> 转速 (Speed)</span>
                          <span className="font-mono text-white">{rpm} rpm</span>
                      </div>
                      <input 
                        type="range" min="0" max="200" step="10" 
                        value={rpm} onChange={(e) => setRpm(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                  </div>
              </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 bg-[#061016]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-5 pointer-events-auto">
              <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Flow Rate</span>
                      <span className="text-xl font-bold text-cyan-300 font-mono">{metrics.flow.toFixed(0)} <span className="text-xs text-slate-500">m³/s</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Cavitation σ</span>
                      <span className={`text-xl font-bold font-mono ${metrics.cavitationSigma < 0.1 ? 'text-red-500' : 'text-green-400'}`}>
                          {metrics.cavitationSigma.toFixed(3)}
                      </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Vibration</span>
                      <span className={`text-xl font-bold font-mono ${metrics.vibration > 2 ? 'text-red-500' : 'text-white'}`}>
                          {metrics.vibration.toFixed(2)} <span className="text-xs text-slate-500">mm/s</span>
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Right Panel: Analysis Charts */}
      <div className="absolute right-6 top-32 bottom-6 w-96 z-20 pointer-events-none flex flex-col gap-6">
          
          {/* Hill Chart */}
          <div className="bg-[#061016]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl h-[320px]">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400"/> 综合特性曲线 (Hill Chart)
              </h3>
              <div className="w-full h-full pb-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#164e63" />
                          <XAxis type="number" dataKey="head" name="Head" domain={[60, 140]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Head (m)', position: 'insideBottom', offset: -5, fill:'#64748b', fontSize:10 }} />
                          <YAxis type="number" dataKey="power" name="Power" domain={[0, 350]} stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fill:'#64748b', fontSize:10 }} />
                          <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9', fontSize: '10px'}} />
                          <ZAxis type="number" dataKey="eff" range={[0, 100]} name="Eff" />
                          
                          {/* Contours simulated by scatter cloud */}
                          <Scatter name="Zones" data={HILL_CHART_POINTS} fill="#155e75" shape="circle" r={3} />
                          
                          {/* Current Op Point */}
                          <Scatter name="Current" data={[currentOpPoint]} fill="#facc15" shape="cross" r={8} />
                      </ScatterChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Pulsation Spectrum */}
          <div className="flex-1 bg-[#061016]/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Waves size={16} className="text-blue-400"/> 尾水管压力脉动 (Spectrum)
              </h3>
              <div className="w-full h-full pb-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PULSATION_DATA}>
                          <defs>
                              <linearGradient id="gradPuls" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#164e63" vertical={false} />
                          <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Hz', position: 'insideBottom', offset: -5, fontSize:10 }} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6'}} />
                          <Area type="monotone" dataKey="amp" stroke="#3b82f6" fill="url(#gradPuls)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

      </div>

      {/* 4. Center Bottom: Flow Vector Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
           <div className="bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-cyan-700/50 flex gap-6 text-[10px] text-slate-300">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div> Streamline</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_yellow]"></div> Velocity Vector</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div> Cavitation</div>
           </div>
      </div>

    </div>
  );
};