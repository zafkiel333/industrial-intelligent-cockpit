
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-trans]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-trans';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Play, Pause, RotateCcw, Activity, 
  Zap, Settings, AlertTriangle, ChevronsUp,
  Cpu, Power, Gauge, RefreshCw, BarChart2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  BarChart, Bar, Cell, Legend
} from 'recharts';

// --- TYPES ---
type Phase = 'STOP' | 'STARTUP' | 'SYNC' | 'LOAD' | 'REJECTION';

// --- MOCK DATA ---
const PHASE_STEPS = [
    { id: 'STOP', label: '停机 (Stop)' },
    { id: 'STARTUP', label: '开机 (Startup)' },
    { id: 'SYNC', label: '并网 (Sync)' },
    { id: 'LOAD', label: '发电 (Load)' },
    { id: 'REJECTION', label: '甩负荷 (Reject)' },
];

export const HydroTransitionSimView: React.FC = () => {
  // State
  const [phase, setPhase] = useState<Phase>('STOP');
  const [rpm, setRpm] = useState(0);
  const [gateOpen, setGateOpen] = useState(0);
  const [power, setPower] = useState(0);
  const [hammer, setHammer] = useState(0); // Penstock pressure deviation
  const [elapsed, setElapsed] = useState(0);
  
  // Real-time data buffers for charts
  const [trendData, setTrendData] = useState<{t:number, rpm:number, power:number}[]>([]);
  const [oscData, setOscData] = useState<{t:number, v:number}[]>([]); // Synchroscope

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setElapsed(t => t + 0.1);
        
        // Physics State Machine
        let targetRpm = 0;
        let targetGate = 0;
        let targetPower = 0;
        let hammerEffect = 0;

        switch(phase) {
            case 'STOP':
                targetRpm = 0;
                targetGate = 0;
                targetPower = 0;
                break;
            case 'STARTUP':
                targetRpm = 100; // Rated speed (normalized)
                targetGate = 20; // No-load opening
                targetPower = 0;
                break;
            case 'SYNC':
                targetRpm = 100;
                targetGate = 25;
                targetPower = 0;
                break;
            case 'LOAD':
                targetRpm = 100;
                targetGate = 85;
                targetPower = 600; // MW
                break;
            case 'REJECTION':
                // Overspeed transient
                targetRpm = 140; 
                targetGate = 0; // Fast close
                targetPower = 0;
                // Water hammer spike logic below
                break;
        }

        // Dynamics (Lag)
        setRpm(prev => {
            const diff = targetRpm - prev;
            // Overshoot logic for rejection
            if (phase === 'REJECTION' && prev < 135) return prev + 2.0; 
            if (phase === 'REJECTION' && prev >= 135) return prev * 0.99; // Coast down friction
            return prev + diff * 0.05;
        });

        setGateOpen(prev => {
             const diff = targetGate - prev;
             const rate = phase === 'REJECTION' ? 2.0 : 0.5; // Fast close
             if (Math.abs(diff) < rate) return targetGate;
             return prev + Math.sign(diff) * rate;
        });

        setPower(prev => {
            if (phase === 'REJECTION') return 0; // Instant cut
            const diff = targetPower - prev;
            return prev + diff * 0.1;
        });

        // Water Hammer Calculation (Proportional to dGate/dt)
        // Simplified: if gate closing fast, pressure spikes
        if (phase === 'REJECTION' && gateOpen > 10) {
            setHammer(h => h + 0.5 + Math.random());
        } else {
            setHammer(h => h * 0.9); // Decay
        }

        // Update Charts
        setTrendData(prev => {
            const next = [...prev, { t: elapsed, rpm, power }];
            if (next.length > 50) next.shift();
            return next;
        });

        // Synchroscope Wave
        // Phase diff depends on RPM error from 100
        const slip = (rpm - 100) * 0.1;
        const waveVal = Math.sin(elapsed * 5 + elapsed * slip); 
        setOscData(prev => {
            const next = [...prev, { t: elapsed, v: waveVal }];
            if (next.length > 50) next.shift();
            return next;
        });

    }, 50);

    return () => clearInterval(interval);
  }, [phase, rpm, gateOpen, power, elapsed]);

  return (
    <div className="h-full w-full relative bg-[#050510] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE (Central Focus) */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-trans" 
            simData={{ 
                rpm, 
                gate: gateOpen, 
                phase,
                waterHammer: hammer
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Radial vignette for focus */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_85%)] pointer-events-none"></div>
      </div>

      {/* 2. TOP: Sequence Timeline */}
      <div className="absolute top-0 left-0 right-0 z-20 h-24 bg-gradient-to-b from-[#0a0a20]/90 to-transparent flex flex-col items-center justify-start pt-4 pointer-events-none">
          <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-3 text-shadow-glow mb-2">
             <Activity className="text-cyan-400"/> TRANSIENT SIMULATION
          </h1>
          
          <div className="flex gap-1 pointer-events-auto bg-black/40 backdrop-blur rounded-full p-1 border border-cyan-900/50">
              {PHASE_STEPS.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => setPhase(step.id as Phase)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2
                        ${phase === step.id 
                           ? 'bg-cyan-600 text-white shadow-[0_0_10px_#0891b2]' 
                           : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
                    `}
                  >
                      <div className={`w-2 h-2 rounded-full ${phase === step.id ? 'bg-white' : 'bg-slate-600'}`}></div>
                      {step.label}
                  </button>
              ))}
          </div>
      </div>

      {/* 3. LEFT WING: Mechanical & Hydraulic */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* RPM Gauge */}
          <SciFiCard title="机组转速 (RPM)" subtitle="MECHANICAL" className="h-[200px] border-cyan-900/50 bg-[#0a0a1a]/80 pointer-events-auto">
              <div className="flex flex-col items-center justify-center h-full relative">
                  <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke={rpm > 110 ? '#ef4444' : '#22d3ee'} strokeWidth="8" 
                                  strokeDasharray="283" strokeDashoffset={283 - (283 * Math.min(1.5, rpm/100))} 
                                  className="transition-all duration-100 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-bold font-mono ${rpm > 110 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                              {rpm.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400">Rated Speed</span>
                      </div>
                  </div>
              </div>
          </SciFiCard>

          {/* Hydraulic Params */}
          <SciFiCard title="水力参数监测" subtitle="HYDRAULIC" className="flex-1 border-cyan-900/50 bg-[#0a0a1a]/80 pointer-events-auto">
              <div className="flex flex-col gap-6 p-2">
                  {/* Gate Opening */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-cyan-200">
                          <span className="flex items-center gap-2"><Settings size={12}/> 导叶开度 (Gate)</span>
                          <span className="font-mono">{gateOpen.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${gateOpen}%`}}></div>
                      </div>
                  </div>

                  {/* Penstock Pressure (Hammer) */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-blue-200">
                          <span className="flex items-center gap-2"><Gauge size={12}/> 蜗壳压力 (Pressure)</span>
                          <span className={`font-mono ${hammer > 2 ? 'text-red-400 font-bold' : 'text-blue-300'}`}>
                              {(4.5 + hammer).toFixed(2)} MPa
                          </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                          {/* Base Pressure */}
                          <div className="absolute left-0 h-full bg-blue-600" style={{width: '60%'}}></div>
                          {/* Hammer Spike */}
                          <div className="absolute left-[60%] h-full bg-red-500 transition-all duration-100" style={{width: `${Math.min(40, hammer*10)}%`}}></div>
                      </div>
                      {hammer > 2 && <div className="text-[10px] text-red-400 animate-pulse">⚠ WATER HAMMER DETECTED</div>}
                  </div>

                  {/* Vibration */}
                  <div className="p-3 bg-cyan-900/20 border border-cyan-800/30 rounded flex items-center justify-between">
                      <div className="text-xs text-slate-300">Shaft Vibration</div>
                      <div className={`text-sm font-mono font-bold ${phase === 'REJECTION' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {(0.05 + Math.abs(rpm-100)*0.01 + hammer*0.1).toFixed(3)} mm
                      </div>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* 4. RIGHT WING: Electrical & Control */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Electrical Output */}
          <SciFiCard title="电气输出指标" subtitle="GENERATOR" className="h-[200px] border-cyan-900/50 bg-[#0a0a1a]/80 pointer-events-auto">
              <div className="grid grid-cols-2 gap-3 p-1 h-full content-center">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Active Power</div>
                      <div className="text-xl font-bold text-white font-mono">{power.toFixed(0)} <span className="text-xs font-normal">MW</span></div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Frequency</div>
                      <div className="text-xl font-bold text-green-400 font-mono">{(rpm/100 * 50).toFixed(2)} <span className="text-xs font-normal">Hz</span></div>
                  </div>
                  <div className="col-span-2 bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">Voltage</div>
                      <div className="text-xl font-bold text-blue-300 font-mono">{(rpm > 90 ? 18.0 : 0).toFixed(1)} <span className="text-xs font-normal">kV</span></div>
                  </div>
              </div>
          </SciFiCard>

          {/* Oscilloscope (Sync) */}
          <SciFiCard title="同期并网示波器" subtitle="SYNCHROSCOPE" className="h-[180px] border-cyan-900/50 bg-[#0a0a1a]/80 pointer-events-auto">
              <div className="w-full h-full p-2 relative bg-black/40 rounded border border-slate-800">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={oscData}>
                          <YAxis domain={[-1.5, 1.5]} hide />
                          <Line type="monotone" dataKey="v" stroke="#00ff00" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                  </ResponsiveContainer>
                  {phase === 'SYNC' && Math.abs(rpm - 100) < 0.5 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 text-xs font-bold bg-black/80 px-2 rounded border border-green-500 animate-pulse">
                          SYNC OK
                      </div>
                  )}
              </div>
          </SciFiCard>

          {/* Trend Chart */}
          <SciFiCard title="过渡过程曲线" subtitle="TREND" className="flex-1 border-cyan-900/50 bg-[#0a0a1a]/80 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                          <defs>
                              <linearGradient id="gradPower" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="t" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 9}} width={30} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22d3ee', fontSize: '10px'}} />
                          <Legend verticalAlign="top" height={20} wrapperStyle={{fontSize: '10px'}}/>
                          
                          <Line type="monotone" dataKey="rpm" stroke="#22d3ee" strokeWidth={2} dot={false} name="RPM %" />
                          <Area type="monotone" dataKey="power" stroke="#facc15" fill="url(#gradPower)" name="MW" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* 5. BOTTOM BAR: Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur px-8 py-3 rounded-full border border-cyan-900/50 flex gap-8 pointer-events-auto">
          <button 
            onClick={() => setPhase('STARTUP')}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${phase === 'STARTUP' ? 'text-green-400' : 'text-slate-400'}`}
          >
              <Play size={20} />
              <span className="text-[9px] font-bold">START</span>
          </button>
          
          <button 
            onClick={() => setPhase('REJECTION')}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-110 ${phase === 'REJECTION' ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
          >
              <AlertTriangle size={20} />
              <span className="text-[9px] font-bold">TRIP (ESD)</span>
          </button>

          <div className="w-px h-8 bg-slate-700"></div>

          <button 
            onClick={() => { setPhase('STOP'); setRpm(0); setPower(0); setGateOpen(0); }}
            className="flex flex-col items-center gap-1 transition-all hover:scale-110 text-slate-400 hover:text-white"
          >
              <RotateCcw size={20} />
              <span className="text-[9px] font-bold">RESET</span>
          </button>
      </div>

    </div>
  );
};