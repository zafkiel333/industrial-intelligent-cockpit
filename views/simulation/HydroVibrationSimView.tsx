
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-vib]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-vib';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, Zap, AlertTriangle, Play, Pause, 
  RotateCcw, Wind, Settings, Layers, Gauge,
  TrendingUp, Radio
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line
} from 'recharts';

// --- MOCK DATA ---
const SPECTRUM_DATA = Array.from({length: 50}, (_, i) => ({
    freq: i, // Hz
    amp: 0
}));

const TIME_DOMAIN_TEMPLATE = Array.from({length: 100}, (_, i) => ({
    t: i,
    val: 0
}));

export const HydroVibrationSimView: React.FC = () => {
  // --- STATE ---
  const [isRunning, setIsRunning] = useState(true);
  const [flowVel, setFlowVel] = useState(4.0); // m/s
  const [damping, setDamping] = useState(0.05); // Ratio
  const [naturalFreq, setNaturalFreq] = useState(5.0); // Hz
  const [modeShape, setModeShape] = useState(1);

  // Metrics
  const [metrics, setMetrics] = useState({
    forcingFreq: 0, // Hz (Strouhal)
    amplitude: 0, // mm
    magFactor: 1, // Dynamic Magnification
    fatigueLife: 100, // %
    resonanceRisk: 'LOW'
  });

  const [waveData, setWaveData] = useState(TIME_DOMAIN_TEMPLATE);
  const [fftData, setFftData] = useState(SPECTRUM_DATA);

  // Physics Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
        // 1. Calculate Forcing Frequency (Vortex Shedding)
        // f = St * V / L. Assume St=0.2, L=0.5m (thickness)
        const strouhal = 0.2;
        const charLength = 0.5;
        const forceFreq = (strouhal * flowVel) / charLength;

        // 2. Calculate Magnification Factor (Resonance)
        // M = 1 / sqrt( (1 - r^2)^2 + (2*zeta*r)^2 )
        const r = forceFreq / naturalFreq;
        const zeta = damping;
        const magFactor = 1 / Math.sqrt(Math.pow(1 - r*r, 2) + Math.pow(2*zeta*r, 2));

        // 3. Amplitude
        // Static deflection approx ~ V^2
        const staticDeflection = 0.5 * Math.pow(flowVel/5, 2); 
        const dynamicAmp = staticDeflection * magFactor;

        // 4. Update Metrics
        let risk = 'LOW';
        if (magFactor > 3) risk = 'HIGH';
        else if (magFactor > 1.5) risk = 'MED';

        setMetrics(prev => ({
            forcingFreq: forceFreq,
            amplitude: dynamicAmp,
            magFactor: magFactor,
            fatigueLife: Math.max(0, prev.fatigueLife - (dynamicAmp > 5 ? 0.1 : 0.001)),
            resonanceRisk: risk
        }));

        // 5. Update Charts
        // Time Domain
        setWaveData(prev => {
            const t = Date.now() / 100;
            const newVal = dynamicAmp * Math.sin(t * forceFreq); // Simple sine
            const next = [...prev.slice(1), { t, val: newVal }];
            return next;
        });

        // FFT (Peak at forcing freq and natural freq)
        const newFFT = SPECTRUM_DATA.map(pt => {
            let amp = 0;
            // Peak at Forcing Freq
            if (Math.abs(pt.freq - forceFreq) < 1) amp += dynamicAmp * 0.8;
            // Peak at Natural Freq (Ring)
            if (Math.abs(pt.freq - naturalFreq) < 1) amp += dynamicAmp * 0.3;
            // Noise
            amp += Math.random() * 0.1;
            return { ...pt, amp };
        });
        setFftData(newFFT);

    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, flowVel, damping, naturalFreq]);

  return (
    <div className="h-full w-full relative bg-[#06030b] text-violet-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-vib" 
            simData={{ 
                amplitude: metrics.amplitude, // Visual scale
                frequency: metrics.forcingFreq,
                mode: modeShape,
                flowSpeed: flowVel
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#06030b_100%)] pointer-events-none"></div>
          {/* Stress Overlay if High Risk */}
          {metrics.resonanceRisk === 'HIGH' && (
              <div className="absolute inset-0 border-[10px] border-red-500/30 animate-pulse pointer-events-none"></div>
          )}
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e1b4b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-violet-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Activity size={14} /> STRUCTURAL HEALTH LAB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 水工建筑 <span className="text-violet-500">振动与动荷载响应仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Mag Factor (Dynamic)</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.magFactor > 3 ? 'text-red-500 animate-bounce' : 'text-cyan-400'}`}>
                       {metrics.magFactor.toFixed(2)}x
                   </div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Peak Amplitude</div>
                   <div className="text-3xl font-mono font-bold text-white">
                       {metrics.amplitude.toFixed(2)} <span className="text-sm text-slate-500">mm</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Excitation Control */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0f0a1a]/90 backdrop-blur-md border border-violet-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-violet-900/30 pb-2">
                  <Settings size={16} className="text-violet-500"/> 激励与结构参数
              </h3>
              
              <div className="space-y-6">
                  {/* Flow Vel */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Wind size={12}/> Flow Velocity</span>
                          <span className="font-mono text-cyan-300">{flowVel.toFixed(1)} m/s</span>
                      </div>
                      <input 
                        type="range" min="0" max="15" step="0.5" 
                        value={flowVel} onChange={(e) => setFlowVel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                  </div>

                  {/* Natural Freq */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Radio size={12}/> Structure Fn</span>
                          <span className="font-mono text-violet-300">{naturalFreq.toFixed(1)} Hz</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="0.5" 
                        value={naturalFreq} onChange={(e) => setNaturalFreq(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                  </div>

                  {/* Damping */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Layers size={12}/> Damping Ratio</span>
                          <span className="font-mono text-white">{damping.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0.01" max="0.2" step="0.01" 
                        value={damping} onChange={(e) => setDamping(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                  </div>
              </div>
          </div>

          <SciFiCard title="频响分析 (FFT Spectrum)" subtitle="RESONANCE" className="flex-1 border-violet-900/50 bg-[#0f0a1a]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fftData}>
                          <defs>
                              <linearGradient id="gradFFT" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e1065" vertical={false} />
                          <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis hide domain={[0, 10]} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#8b5cf6'}} />
                          <Area type="monotone" dataKey="amp" stroke="#8b5cf6" fill="url(#gradFFT)" strokeWidth={2} />
                          {/* Natural Freq Line */}
                          <ReferenceLine x={naturalFreq} stroke="#facc15" strokeDasharray="3 3" label={{value:'Fn', fill:'#facc15', fontSize:10}} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Response & Fatigue */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Time Domain */}
          <SciFiCard title="时域响应波形" subtitle="DISPLACEMENT" className="h-[250px] border-violet-900/50 bg-[#0f0a1a]/90 pointer-events-auto">
              <div className="w-full h-full p-2 bg-black/40 rounded border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={waveData}>
                          <YAxis hide domain={[-10, 10]} />
                          <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Real-time</span>
                      <span>Forcing Freq: {metrics.forcingFreq.toFixed(1)} Hz</span>
                  </div>
              </div>
          </SciFiCard>

          {/* Health Monitor */}
          <div className="flex-1 bg-[#0f0a1a]/90 backdrop-blur-md border border-violet-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-violet-900/30 pb-2">
                  <Gauge size={16} className="text-green-500"/> 结构健康监测
              </h3>
              
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Fatigue Life</span>
                          <span className={metrics.fatigueLife < 80 ? 'text-red-400' : 'text-green-400'}>{metrics.fatigueLife.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${metrics.fatigueLife < 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${metrics.fatigueLife}%`}}></div>
                      </div>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex items-center gap-3">
                      <AlertTriangle size={16} className={metrics.resonanceRisk === 'HIGH' ? 'text-red-500 animate-bounce' : 'text-slate-500'} />
                      <div>
                          <div className="text-xs font-bold text-slate-200">Resonance Risk</div>
                          <div className={`text-[10px] font-bold ${metrics.resonanceRisk === 'HIGH' ? 'text-red-400' : metrics.resonanceRisk === 'MED' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {metrics.resonanceRisk}
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="mt-auto">
                   <div className="text-[10px] text-slate-400 uppercase mb-2">Mode Shape Select</div>
                   <div className="flex gap-2">
                       {[1, 2, 3].map(m => (
                           <button 
                             key={m} 
                             onClick={() => setModeShape(m)}
                             className={`flex-1 py-1 text-xs font-bold rounded border ${modeShape === m ? 'bg-violet-600 border-violet-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                           >
                               Mode {m}
                           </button>
                       ))}
                   </div>
              </div>
          </div>

      </div>

      {/* BOTTOM CONTROL */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur px-8 py-3 rounded-full border border-violet-900/50 flex gap-6 shadow-2xl">
              <button 
                 onClick={() => setIsRunning(!isRunning)}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs transition-colors
                     ${isRunning ? 'bg-slate-700 text-slate-300' : 'bg-green-600 text-white'}
                 `}
              >
                 {isRunning ? <Pause size={14}/> : <Play size={14}/>} {isRunning ? 'PAUSE' : 'RUN'}
              </button>
              <button 
                 onClick={() => { setFlowVel(4.0); setDamping(0.05); }}
                 className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs bg-slate-800 text-slate-400 hover:text-white"
              >
                 <RotateCcw size={14}/> RESET
              </button>
          </div>
      </div>

    </div>
  );
};
