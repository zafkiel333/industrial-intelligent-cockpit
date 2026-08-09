
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-equip]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-equip';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Zap, AlertCircle, Play, Pause, 
  RotateCcw, Scale, Gauge, Target, Hammer,
  Cpu, BarChart2, Triangle, Box, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  RadialBarChart, RadialBar, Legend, PolarAngleAxis
} from 'recharts';

// --- DATA ---

// S-N Curve Data (Stress Amplitude vs Cycles)
const SN_DATA = Array.from({length: 50}, (_, i) => {
    // Typical steel fatigue curve: S = A * N^b
    // log S = log A + b log N
    const n = Math.pow(10, 3 + i * 0.1); // 10^3 to 10^8
    const stress = 1000 * Math.pow(n, -0.1); 
    return { n: Math.log10(n), stress };
});

const RAINFLOW_DATA = [
    { range: '0-50 MPa', count: 1250 },
    { range: '50-100 MPa', count: 850 },
    { range: '100-150 MPa', count: 420 },
    { range: '150-200 MPa', count: 150 },
    { range: '>200 MPa', count: 45 },
];

const COMPONENTS = [
    { id: 'C-01', name: 'Boom Base Pivot', life: 85, stress: 185 },
    { id: 'C-02', name: 'Stick Cylinder Pin', life: 92, stress: 140 },
    { id: 'C-03', name: 'Bucket Linkage', life: 65, stress: 240 },
    { id: 'C-04', name: 'Swing Bearing', life: 98, stress: 90 },
];

export const MineEquipStrengthSimView: React.FC = () => {
  // --- STATE ---
  const [simState, setSimState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [payload, setPayload] = useState(80); // %
  const [rockHardness, setRockHardness] = useState(60); // MPa
  const [cycles, setCycles] = useState(14500);
  
  const [metrics, setMetrics] = useState({
    maxStress: 245, // MPa
    strain: 1200, // microstrain
    fatigueDamage: 0.15, // 0-1
    safetyFactor: 1.8
  });
  
  const [stressHistory, setStressHistory] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    if (simState !== 'RUNNING') return;
    
    const interval = setInterval(() => {
        setCycles(c => c + 1);
        
        setMetrics(prev => {
            // Dynamic stress based on cyclic load + randomness
            const baseStress = (payload / 100) * 150 + (rockHardness / 100) * 100;
            const dynamic = Math.sin(Date.now() / 200) * 50; // Cyclic loading
            const currentStress = Math.max(0, baseStress + dynamic + Math.random() * 20);
            
            const newDamage = prev.fatigueDamage + (currentStress > 200 ? 0.0001 : 0.00001);
            
            return {
                maxStress: currentStress,
                strain: currentStress * 5, // Simple Elastic Modulus relation
                fatigueDamage: Math.min(1, newDamage),
                safetyFactor: 400 / (currentStress || 1) // Yield / Stress
            };
        });

        // Update history graph
        setStressHistory(prev => {
            const newPoint = {
                t: prev.length,
                stress: metrics.maxStress,
                limit: 350
            };
            return [...prev.slice(-49), newPoint];
        });

    }, 100);
    
    return () => clearInterval(interval);
  }, [simState, payload, rockHardness, metrics.maxStress]);

  return (
    <div className="h-full w-full relative bg-[#050508] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-equip-strength" 
            simData={{ 
                load: metrics.maxStress / 4, // Norm for viz
                cycle: 'DIG' 
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,150,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,150,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050508_100%)] pointer-events-none"></div>
      </div>

      {/* TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0a0f1e] to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Hammer size={14} /> STRUCTURAL INTEGRITY LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 采矿设备 <span className="text-cyan-500">结构强度与疲劳寿命仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Safety Factor</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.safetyFactor < 1.5 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.safetyFactor.toFixed(2)}
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Cycle Count</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {cycles.toLocaleString()}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Digital Twin HUD */}
      <div className="absolute left-6 top-32 bottom-6 w-72 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Stress Gauge */}
          <div className="bg-[#0a0f1e]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400"/> Max Stress (Von Mises)
              </h3>
              <div className="relative h-32 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadialBarChart 
                          innerRadius="70%" 
                          outerRadius="100%" 
                          barSize={10} 
                          data={[{name:'stress', value: metrics.maxStress, fill: metrics.maxStress > 250 ? '#ef4444' : '#22d3ee'}]} 
                          startAngle={180} 
                          endAngle={0}
                        >
                           <PolarAngleAxis type="number" domain={[0, 400]} angleAxisId={0} tick={false} />
                           <RadialBar background dataKey="value" cornerRadius={5} />
                       </RadialBarChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                       <span className="text-2xl font-bold text-white">{metrics.maxStress.toFixed(0)}</span>
                       <span className="text-[10px] text-slate-400">MPa</span>
                   </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-4">
                  <span>0</span>
                  <span>Limit: 350</span>
                  <span>400</span>
              </div>
          </div>

          {/* Real-time Oscilloscope */}
          <SciFiCard title="应力波形实时监测" subtitle="SENSOR: SG-04" className="flex-1 border-cyan-500/30 bg-[#0a0f1e]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col">
                  <div className="flex-1 min-h-0 bg-black/40 rounded border border-slate-800 relative overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stressHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                              <YAxis domain={[0, 400]} hide />
                              <ReferenceLine y={350} stroke="red" strokeDasharray="3 3" />
                              <Line type="monotone" dataKey="stress" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                      </ResponsiveContainer>
                      {/* Grid Overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Strain: {metrics.strain.toFixed(0)} µε</span>
                      <span className="text-green-400">Sample: 100Hz</span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Fatigue Analysis */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Life Prediction */}
          <div className="h-[280px] bg-[#0a0f1e]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-400"/> 疲劳寿命预测 (S-N Curve)
              </h3>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={SN_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="n" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Log(N) Cycles', position: 'insideBottom', offset: -5, fontSize: 10 }} domain={[3, 8]} type="number" />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                          <Line type="basis" dataKey="stress" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                          {/* Current State Point */}
                          <ReferenceLine x={Math.log10(cycles)} stroke="#fff" label={{value:'Now', fill:'#fff', fontSize:10}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2 mt-2 flex justify-between items-center">
                  <span className="text-xs text-purple-200">Rem. Life (Est)</span>
                  <span className="text-lg font-bold text-white font-mono">12,450 Hrs</span>
              </div>
          </div>

          {/* Component Health */}
          <SciFiCard title="关键部件损伤度" subtitle="DAMAGE ACCUMULATION" className="flex-1 border-cyan-500/30 bg-[#0a0f1e]/90 pointer-events-auto">
              <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-1">
                  {COMPONENTS.map((comp, i) => (
                      <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800 hover:border-cyan-500/50 transition-colors">
                          <div className="flex justify-between mb-2">
                              <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${comp.life < 70 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                  {comp.life}% Life
                              </span>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${comp.life < 70 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                                    style={{width: `${100 - comp.life}%`}} // Inverted: damage bar
                                  ></div>
                              </div>
                              <span className="text-[10px] text-slate-500 w-12 text-right">D: {(1 - comp.life/100).toFixed(2)}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 flex gap-2">
                              <span>Peak Stress: {comp.stress} MPa</span>
                          </div>
                      </div>
                  ))}

                  {/* Rainflow Histogram Mini */}
                  <div className="mt-auto pt-3 border-t border-slate-800">
                      <div className="text-[10px] text-slate-400 mb-2 uppercase">Stress Cycle Distribution</div>
                      <div className="h-20 w-full flex items-end gap-1">
                          {RAINFLOW_DATA.map((d, i) => (
                              <div key={i} className="flex-1 bg-cyan-900/40 hover:bg-cyan-600 transition-colors rounded-t-sm relative group" style={{height: `${(d.count/1500)*100}%`}}>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">{d.range}</div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* 5. BOTTOM BAR: Simulation Controller */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0a0f1e] border-t border-cyan-900/50 z-20 px-8 flex items-center gap-8 pointer-events-auto">
          
          {/* Playback Controls */}
          <div className="flex gap-2">
              <button 
                  onClick={() => setSimState(simState === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${simState === 'RUNNING' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-green-600 border-green-400 text-white'}`}
              >
                  {simState === 'RUNNING' ? <Pause size={16}/> : <Play size={16}/>}
              </button>
              <button 
                  onClick={() => { setSimState('IDLE'); setCycles(0); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-600 bg-slate-800 text-slate-400 hover:text-white"
              >
                  <RotateCcw size={16}/>
              </button>
          </div>

          <div className="h-8 w-px bg-slate-700"></div>

          {/* Parameter Sliders */}
          <div className="flex-1 grid grid-cols-2 gap-8">
              <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-2"><Scale size={12}/> Payload (Load)</span>
                      <span className="font-mono text-cyan-400">{payload}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="120" step="5" 
                    value={payload} onChange={(e) => setPayload(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-2"><Box size={12}/> Rock Hardness</span>
                      <span className="font-mono text-orange-400">{rockHardness} MPa</span>
                  </div>
                  <input 
                    type="range" min="20" max="150" step="5" 
                    value={rockHardness} onChange={(e) => setRockHardness(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
              </div>
          </div>
          
          <div className="w-px h-8 bg-slate-700"></div>

          {/* Warning Indicator */}
          <div className={`px-4 py-2 rounded border flex items-center gap-2 text-xs font-bold transition-colors
              ${metrics.fatigueDamage > 0.8 ? 'bg-red-900/50 border-red-500 text-red-200 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-500'}
          `}>
              <AlertCircle size={14} />
              {metrics.fatigueDamage > 0.8 ? 'CRITICAL FATIGUE WARNING' : 'SYSTEM HEALTHY'}
          </div>

      </div>

    </div>
  );
};
