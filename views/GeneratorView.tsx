import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-1]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-1';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { Zap, Activity, Cpu, Thermometer, BatteryCharging, Gauge, RotateCw } from 'lucide-react';

interface GeneratorViewProps {
  title?: string;
}

export const GeneratorView: React.FC<GeneratorViewProps> = () => {
  // --- STATE FOR REAL-TIME SIMULATION ---
  const [waveData, setWaveData] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [metrics, setMetrics] = useState({
    voltage: 13.8,
    current: 24.5,
    frequency: 50.00,
    powerFactor: 0.95,
    activePower: 585,
    reactivePower: 192,
    excitationCurrent: 2100,
  });
  
  // Stator Temp Heatmap Data (Mock)
  const statorTemps = [
      [78, 80, 79, 81, 82, 80],
      [79, 82, 83, 85, 84, 82],
      [80, 83, 86, 88, 85, 83],
      [78, 81, 82, 84, 81, 80]
  ];

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.2); // Advance phase
      
      // Update metrics with jitter
      setMetrics(prev => ({
        voltage: 13.8 + (Math.random() - 0.5) * 0.05,
        current: 24.5 + (Math.random() - 0.5) * 0.2,
        frequency: 50.00 + (Math.random() - 0.5) * 0.01,
        powerFactor: 0.95 + (Math.random() - 0.5) * 0.005,
        activePower: 585 + (Math.random() - 0.5) * 2,
        reactivePower: 192 + (Math.random() - 0.5) * 1.5,
        excitationCurrent: 2100 + (Math.random() - 0.5) * 5,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate Waveform Data based on current offset
  useEffect(() => {
    const data = [];
    for (let i = 0; i < 40; i++) {
      const x = i * 0.2 + offset;
      data.push({
        time: i,
        // Three phases offset by 2PI/3
        phaseA: Math.sin(x) * 100,
        phaseB: Math.sin(x - (2 * Math.PI / 3)) * 100,
        phaseC: Math.sin(x - (4 * Math.PI / 3)) * 100,
      });
    }
    setWaveData(data);
  }, [offset]);

  // --- COMPONENT RENDER ---
  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-amber-50 selection:bg-amber-500/30">
      
      {/* HEADER: Specific to Generator */}
      <div className="flex items-end justify-between border-b border-amber-500/30 pb-4 bg-gradient-to-r from-amber-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Activity size={12} className="animate-pulse" />
             ELECTRICAL SUBSYSTEM
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-amber-500 text-shadow-glow">发电机</span> 智能运维驾驶舱
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">GEN-01</span>
          </h1>
        </div>
        
        {/* Top KPIs Row (Inline) */}
        <div className="flex gap-6">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Terminal Voltage</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{metrics.voltage.toFixed(2)} <span className="text-sm text-amber-700">kV</span></div>
            </div>
            <div className="text-right pl-6 border-l border-amber-900/30">
                <div className="text-[10px] text-slate-500 uppercase">System Freq</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.frequency.toFixed(2)} <span className="text-sm text-slate-600">Hz</span></div>
            </div>
            <div className="text-right pl-6 border-l border-amber-900/30">
                <div className="text-[10px] text-slate-500 uppercase">Power Factor</div>
                <div className="text-2xl font-mono font-bold text-blue-300">{metrics.powerFactor.toFixed(3)} <span className="text-sm text-slate-600">lag</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Electrical Analytics */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Waveform Monitor */}
           <SciFiCard title="三相电压波形实时监测" subtitle="PHASE A/B/C" className="border-amber-900/50 bg-[#0b0800]/80">
              <div className="h-[200px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={waveData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#451a03" opacity={0.3} vertical={false} />
                       {/* Removing X/Y Axis for pure waveform look */}
                       <Line type="monotone" dataKey="phaseA" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
                       <Line type="monotone" dataKey="phaseB" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                       <Line type="monotone" dataKey="phaseC" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                 </ResponsiveContainer>
                 {/* Legend Overlay */}
                 <div className="absolute top-2 right-2 flex gap-3 text-[10px] font-mono bg-black/50 p-1 rounded border border-amber-900/50">
                    <span className="text-amber-400">Phase A</span>
                    <span className="text-emerald-400">Phase B</span>
                    <span className="text-rose-400">Phase C</span>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                 <div className="bg-amber-950/20 rounded p-2 border border-amber-900/30">
                    <div className="text-[10px] text-slate-500">Uab (kV)</div>
                    <div className="font-mono text-amber-200">13.81</div>
                 </div>
                 <div className="bg-amber-950/20 rounded p-2 border border-amber-900/30">
                    <div className="text-[10px] text-slate-500">Ubc (kV)</div>
                    <div className="font-mono text-amber-200">13.79</div>
                 </div>
                 <div className="bg-amber-950/20 rounded p-2 border border-amber-900/30">
                    <div className="text-[10px] text-slate-500">Uca (kV)</div>
                    <div className="font-mono text-amber-200">13.80</div>
                 </div>
              </div>
           </SciFiCard>

           {/* Excitation System */}
           <SciFiCard title="励磁系统状态" className="flex-1 border-amber-900/50">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <BatteryCharging className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-300">励磁电流</span>
                 </div>
                 <span className="text-2xl font-mono text-white">{metrics.excitationCurrent.toFixed(0)} <span className="text-xs text-slate-500">A</span></span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-6 border border-slate-700">
                 <div className="bg-gradient-to-r from-amber-700 to-amber-500 h-full transition-all duration-300" style={{width: '75%'}}></div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-center bg-white/5 p-2 rounded border-l-2 border-amber-600">
                    <span className="text-xs text-slate-400">AVR 状态</span>
                    <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded">AUTO / 自动</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-2 rounded border-l-2 border-slate-600">
                    <span className="text-xs text-slate-400">PSS (电力系统稳定器)</span>
                    <span className="text-xs font-bold text-amber-400">ACTIVE / 投入</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-2 rounded border-l-2 border-slate-600">
                    <span className="text-xs text-slate-400">强励倍数</span>
                    <span className="text-xs font-bold text-white">2.5x</span>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 bg-[#050300] border border-amber-800/40 relative rounded overflow-hidden shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10">
                 <div className="text-[10px] text-amber-700 font-mono mb-1">ROTOR SPEED</div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tighter">3000</span>
                    <span className="text-xs text-amber-500">RPM</span>
                 </div>
              </div>

              <div className="absolute top-4 right-4 z-10 text-right">
                 <div className="text-[10px] text-amber-700 font-mono mb-1">AIR GAP FLUX</div>
                 <div className="flex items-baseline justify-end gap-1">
                    <span className="text-xl font-bold text-white tracking-tighter">1.24</span>
                    <span className="text-xs text-amber-500">T</span>
                 </div>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-amber-600/30"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-amber-600/30"></div>

              <ThreeScene type="generator" color="#f59e0b" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Active/Reactive Power Gauge Block */}
           <div className="h-32 bg-amber-950/20 border border-amber-900/40 p-4 flex items-center justify-around rounded">
              <div className="text-center">
                 <div className="text-xs text-slate-400 mb-1">Active Power (P)</div>
                 <div className="text-3xl font-bold text-white font-mono">{metrics.activePower.toFixed(0)}</div>
                 <div className="text-[10px] text-amber-500 mt-1">MW</div>
              </div>
              <div className="h-12 w-[1px] bg-amber-800/50"></div>
              <div className="text-center">
                 <div className="text-xs text-slate-400 mb-1">Reactive Power (Q)</div>
                 <div className="text-3xl font-bold text-slate-300 font-mono">{metrics.reactivePower.toFixed(0)}</div>
                 <div className="text-[10px] text-blue-400 mt-1">MVar</div>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Thermal & Mechanical */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           
           {/* Stator Thermal Map */}
           <SciFiCard title="定子铁芯温度分布" subtitle="THERMAL MATRIX" className="border-amber-900/50">
              <div className="flex flex-col gap-1 p-2">
                 {statorTemps.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1 h-8">
                       {row.map((temp, cIdx) => {
                          // Color Logic
                          let bg = 'bg-slate-800';
                          if (temp > 85) bg = 'bg-red-500';
                          else if (temp > 82) bg = 'bg-orange-500';
                          else if (temp > 80) bg = 'bg-amber-500';
                          else bg = 'bg-emerald-600/50';

                          return (
                             <div key={cIdx} className={`flex-1 rounded-sm ${bg} flex items-center justify-center text-[10px] font-bold text-white/90 transition-colors hover:scale-105 cursor-crosshair group relative`}>
                                {temp}°
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] rounded hidden group-hover:block z-20 whitespace-nowrap">
                                   Slot {rIdx}-{cIdx}: {temp}°C
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 ))}
              </div>
              <div className="flex justify-between px-2 mt-2 text-[10px] text-slate-500">
                 <span>Slot 01</span>
                 <span>Avg: 81.2°C</span>
                 <span>Slot 24</span>
              </div>
           </SciFiCard>

           {/* Insulation & PD */}
           <SciFiCard title="绝缘与局放监测" className="flex-1 border-amber-900/50">
              <div className="space-y-4">
                 
                 <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                       <span>局部放电 (PD)</span>
                       <span className="text-green-400">Normal</span>
                    </div>
                    <div className="flex gap-1 h-12 items-end pb-1 border-b border-slate-700">
                        {[10, 25, 15, 40, 35, 20, 15, 10, 5, 8, 12, 5].map((h, i) => (
                           <div key={i} className="flex-1 bg-amber-500/40 hover:bg-amber-400 transition-all rounded-t-sm" style={{height: `${h}%`}}></div>
                        ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">氢气纯度</div>
                        <div className="text-xl font-bold text-white mt-1">99.8%</div>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">漏氢量</div>
                        <div className="text-xl font-bold text-green-400 mt-1">0.5 <span className="text-xs">m³/d</span></div>
                     </div>
                 </div>

              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};