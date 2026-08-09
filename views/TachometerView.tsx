import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-11]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-11';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  Gauge, Activity, Zap, Radio, Settings, AlertTriangle, 
  Orbit, Fingerprint, RefreshCw 
} from 'lucide-react';

export const TachometerView: React.FC = () => {
  // --- STATE ---
  const [speedData, setSpeedData] = useState({
    rpm: 3600, // Revolutions Per Minute
    rads: 376.99, // Radians per Second
    frequency: 60.0, // Hz
    gap: 1.2, // mm (Sensor gap)
    vibration: 2.5, // mm/s
    tripStatus: 'NORMAL'
  });

  const [pulseWave, setPulseWave] = useState<any[]>([]);
  const [spectrumData, setSpectrumData] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init Pulse Wave (Square wave simulation)
    const initPulse = Array.from({length: 100}, (_, i) => ({
        time: i,
        volts: i % 10 < 5 ? 0 : 5 // Simple square wave
    }));
    setPulseWave(initPulse);

    // Init Spectrum (Harmonics)
    const initSpec = Array.from({length: 20}, (_, i) => ({
        order: i,
        amp: i === 1 ? 80 : (i === 2 ? 15 : Math.random() * 5) // 1X is dominant
    }));
    setSpectrumData(initSpec);

    const interval = setInterval(() => {
      // 1. Speed Dynamics
      setSpeedData(prev => {
          const noise = (Math.random() - 0.5) * 10;
          const newRpm = 3600 + Math.sin(Date.now() / 2000) * 50 + noise;
          return {
              rpm: newRpm,
              rads: newRpm * 0.10472,
              frequency: newRpm / 60,
              gap: 1.2 + Math.sin(Date.now() / 500) * 0.05,
              vibration: 2.5 + Math.abs(noise / 5),
              tripStatus: newRpm > 3960 ? 'TRIPPED' : 'NORMAL' // 110% overspeed
          };
      });

      // 2. Pulse Wave Animation (Shift phase)
      setPulseWave(prev => {
          const shift = 2; // speed of wave
          const newWave = prev.map((p, i) => {
              const srcIndex = (i + shift) % prev.length;
              return { ...p, volts: prev[srcIndex].volts };
          });
          return newWave;
      });

      // 3. Spectrum Jitter
      setSpectrumData(prev => prev.map(p => ({
          ...p,
          amp: p.order === 1 ? 80 + Math.random()*2 : Math.max(0, p.amp + (Math.random()-0.5))
      })));

    }, 50); // Fast update for smooth gauge

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-fuchsia-50 selection:bg-fuchsia-500/30">
      
      {/* HEADER: High-Speed Theme */}
      <div className="flex items-end justify-between border-b border-fuchsia-500/30 pb-4 bg-gradient-to-r from-fuchsia-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-fuchsia-400 mb-1 uppercase tracking-wider">
             <Gauge size={12} className="animate-spin" style={{animationDuration: '2s'}} />
             PRECISION TELEMETRY
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-fuchsia-400 text-shadow-glow">测速仪</span> 智能运维中心
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">TACH-Z01</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Rotational Freq</div>
                <div className="text-2xl font-mono font-bold text-fuchsia-300">{speedData.frequency.toFixed(2)} <span className="text-sm text-slate-500">Hz</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-fuchsia-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Angular Velocity</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{speedData.rads.toFixed(1)} <span className="text-sm text-slate-500">rad/s</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-fuchsia-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Overspeed Trip</div>
                <div className={`text-2xl font-mono font-bold ${speedData.tripStatus === 'TRIPPED' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {speedData.tripStatus}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Main Gauge */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Digital Tachometer */}
           <SciFiCard title="实时转速监测" subtitle="RPM GAUGE" className="border-fuchsia-900/50 bg-[#1a0518]/60">
              <div className="flex flex-col items-center justify-center py-6 relative">
                  {/* Outer Ring */}
                  <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex items-center justify-center relative shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                      
                      {/* Dynamic Arc (SVG) */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="96" cy="96" r="88" fill="none" stroke="#334155" strokeWidth="8" strokeDasharray="553" strokeDashoffset="0" />
                          <circle 
                            cx="96" cy="96" r="88" fill="none" stroke="#d946ef" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray="553" 
                            strokeDashoffset={553 - (553 * (speedData.rpm / 5000))} 
                            className="transition-all duration-100 ease-out"
                          />
                      </svg>

                      <div className="text-center z-10">
                          <div className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                              {speedData.rpm.toFixed(0)}
                          </div>
                          <div className="text-xs text-fuchsia-400 mt-1 uppercase tracking-widest">RPM</div>
                      </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between w-full px-4 text-xs font-mono">
                      <div className="text-center">
                          <div className="text-slate-500">MIN</div>
                          <div className="text-slate-300">0</div>
                      </div>
                      <div className="text-center">
                          <div className="text-slate-500">RATED</div>
                          <div className="text-green-400">3600</div>
                      </div>
                      <div className="text-center">
                          <div className="text-slate-500">TRIP</div>
                          <div className="text-red-500">3960</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Sensor Health */}
           <SciFiCard title="探头健康诊断" className="flex-1 border-fuchsia-900/50">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-fuchsia-500/20">
                    <div className="flex items-center gap-3">
                        <Radio size={18} className="text-fuchsia-400" />
                        <div>
                            <div className="text-xs text-slate-400">GAP VOLTAGE</div>
                            <div className="text-sm font-bold text-white">-9.4 Vdc</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500">Dist</div>
                        <div className="text-sm font-mono text-fuchsia-300">{speedData.gap.toFixed(2)} mm</div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-fuchsia-500/20">
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-cyan-400" />
                        <div>
                            <div className="text-xs text-slate-400">SNR LEVEL</div>
                            <div className="text-sm font-bold text-white">45 dB</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="text-xs font-bold text-green-400 bg-green-900/20 px-1 rounded">GOOD</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin & Pulse */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#05020a] border border-fuchsia-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(217,70,239,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                     <Fingerprint className="text-fuchsia-500" size={16} />
                     <span className="text-xs text-fuchsia-200 font-bold">KEYPHASOR: LOCKED</span>
                 </div>
              </div>
              
              <div className="absolute bottom-4 right-4 z-10">
                 <div className="bg-black/60 px-3 py-1 rounded border border-fuchsia-500/30 text-xs text-slate-300">
                    Teeth Count: <span className="text-white font-bold">60</span>
                 </div>
              </div>

              <ThreeScene type="tachometer" color="#d946ef" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Pulse Train Analysis */}
           <SciFiCard title="脉冲信号分析" subtitle="OSCILLOSCOPE" className="h-[250px] border-fuchsia-900/50" noPadding>
              <div className="w-full h-full p-4 flex flex-col">
                 <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                     <span>Channel A: Hall Sensor Raw</span>
                     <span className="font-mono text-fuchsia-400">5V TTL</span>
                 </div>
                 <div className="flex-1 bg-[#0a050a] border border-slate-800 rounded relative overflow-hidden">
                     {/* Grid Lines */}
                     <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3}}></div>
                     
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pulseWave}>
                           <Line type="step" dataKey="volts" stroke="#d946ef" strokeWidth={2} dot={false} isAnimationActive={false} />
                           <YAxis domain={[-1, 6]} hide />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Spectrum & Logic */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Order Analysis */}
           <SciFiCard title="阶次频谱分析" subtitle="ORDER TRACKING" className="flex-1 border-fuchsia-900/50">
              <div className="h-40 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spectrumData} margin={{top: 5, right: 0, bottom: 5, left: 0}}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331c12" vertical={false} />
                       <XAxis dataKey="order" tick={{fontSize: 10}} label={{ value: 'Order (X)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#666' }} />
                       <Tooltip cursor={{fill: '#331c12'}} contentStyle={{backgroundColor: '#0f0510', borderColor: '#d946ef', color: '#fff'}} />
                       <Bar dataKey="amp" fill="#d946ef" />
                    </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>1X (Unbalance)</span>
                      <span className="text-white font-bold">0.8 mm/s</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>2X (Misalignment)</span>
                      <span className="text-green-400">0.1 mm/s</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Total Vibration</span>
                      <span className="text-fuchsia-300 font-bold">{speedData.vibration.toFixed(2)} mm/s</span>
                  </div>
              </div>
           </SciFiCard>

           {/* Overspeed Logic */}
           <SciFiCard title="超速保护逻辑" className="border-fuchsia-900/50">
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Trip Setpoint (110%)</span>
                    <span className="text-xs font-mono text-red-400">3960 RPM</span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${speedData.rpm > 3960 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-slate-700'}`}></div>
                    <span className="text-xs text-slate-300">Logic Channel A</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${speedData.rpm > 3960 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-slate-700'}`}></div>
                    <span className="text-xs text-slate-300">Logic Channel B</span>
                 </div>
                 
                 <div className="pt-2 border-t border-slate-700">
                     <button className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-600 flex items-center justify-center gap-2">
                         <RefreshCw size={10} /> RESET LATCH
                     </button>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};