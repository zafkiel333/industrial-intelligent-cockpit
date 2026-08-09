import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-6]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-6';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Wind, RotateCw, Navigation, Zap, Fan, 
  Thermometer, Activity, Compass, Gauge
} from 'lucide-react';

export const WindTurbineView: React.FC = () => {
  // --- STATE ---
  const [metrics, setMetrics] = useState({
    activePower: 2.45, // MW
    windSpeed: 8.5, // m/s
    rotorSpeed: 14.2, // RPM
    pitchAngle: 2.5, // Deg
    yawAngle: 125, // Deg (North=0)
    capacityFactor: 42.5, // %
    gridFreq: 50.01
  });

  const [vibrationData, setVibrationData] = useState<any[]>([]);
  const [powerCurveData, setPowerCurveData] = useState<any[]>([]);
  const [currentPoint, setCurrentPoint] = useState({ wind: 8.5, power: 2450 });

  // Theoretical Power Curve (Mock)
  const theoreticalCurve = [
    { wind: 0, power: 0 }, { wind: 3, power: 0 }, { wind: 4, power: 150 },
    { wind: 5, power: 350 }, { wind: 6, power: 650 }, { wind: 7, power: 1100 },
    { wind: 8, power: 1600 }, { wind: 9, power: 2100 }, { wind: 10, power: 2600 },
    { wind: 11, power: 3000 }, { wind: 12, power: 3200 }, { wind: 13, power: 3300 },
    { wind: 25, power: 3300 }
  ];

  useEffect(() => {
    // Init Vibration Spectrum (0-200Hz)
    const initVib = Array.from({length: 40}, (_, i) => ({
        freq: i * 5,
        amp: Math.random() * 0.5 + (i === 12 ? 2.5 : 0) // Peak at 60Hz
    }));
    setVibrationData(initVib);

    const interval = setInterval(() => {
      // 1. Simulation Loop
      setMetrics(prev => ({
        activePower: Math.min(3.3, Math.max(0, 2.45 + (Math.random() - 0.5) * 0.2)),
        windSpeed: Math.max(0, 8.5 + (Math.random() - 0.5) * 1.5),
        rotorSpeed: 14.2 + (Math.random() - 0.5) * 0.2,
        pitchAngle: Math.max(0, 2.5 + (Math.random() - 0.5) * 0.1),
        yawAngle: 125 + (Math.random() - 0.5) * 1,
        capacityFactor: 42.5,
        gridFreq: 50.00 + (Math.random() - 0.5) * 0.02
      }));

      // 2. Update Operational Point for Scatter
      setCurrentPoint(prev => ({
          wind: metrics.windSpeed,
          power: metrics.activePower * 1000
      }));

      // 3. Jitter Vibration
      setVibrationData(prev => prev.map((p, i) => ({
          ...p,
          amp: Math.max(0, p.amp + (Math.random() - 0.5) * 0.1)
      })));

    }, 1000);
    return () => clearInterval(interval);
  }, [metrics.activePower, metrics.windSpeed]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-sky-50 selection:bg-sky-500/30">
      
      {/* HEADER: Clean & Airy */}
      <div className="flex items-end justify-between border-b border-sky-500/30 pb-4 bg-gradient-to-r from-sky-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 mb-1 uppercase tracking-wider">
             <Fan size={12} className="animate-spin" />
             RENEWABLE ENERGY
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-sky-400 text-shadow-glow">风机电组</span> 智能运维平台
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">TURBINE #07</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Active Power</div>
                <div className="text-2xl font-mono font-bold text-sky-300">{metrics.activePower.toFixed(2)} <span className="text-sm text-slate-500">MW</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-sky-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Wind Speed</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.windSpeed.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-sky-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Rotor Speed</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.rotorSpeed.toFixed(1)} <span className="text-sm text-slate-500">rpm</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Aerodynamics */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Wind Rose / Direction */}
           <SciFiCard title="风场气象监测" subtitle="METEOROLOGY" className="border-sky-900/50">
              <div className="flex flex-col items-center justify-center p-4">
                  <div className="relative w-32 h-32 border-2 border-slate-700 rounded-full flex items-center justify-center">
                      <div className="absolute top-0 text-[10px] text-slate-500">N</div>
                      <div className="absolute bottom-0 text-[10px] text-slate-500">S</div>
                      <div className="absolute left-0 text-[10px] text-slate-500">W</div>
                      <div className="absolute right-0 text-[10px] text-slate-500">E</div>
                      
                      {/* Compass Needle */}
                      <div className="w-1 h-14 bg-red-500 origin-bottom absolute top-2 transition-transform duration-1000" style={{transform: `rotate(${metrics.yawAngle}deg)`}}></div>
                      <div className="w-2 h-2 bg-white rounded-full z-10"></div>
                  </div>
                  <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-white">{metrics.yawAngle.toFixed(0)}°</div>
                      <div className="text-xs text-slate-400">Wind Direction</div>
                  </div>
              </div>
           </SciFiCard>

           {/* Pitch & Yaw Control */}
           <SciFiCard title="偏航与变桨控制" className="flex-1 border-sky-900/50">
              <div className="flex flex-col gap-4">
                 
                 <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-sky-400 font-bold uppercase">Pitch Angle (β)</span>
                       <Gauge size={14} className="text-sky-600" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-mono font-bold text-white">{metrics.pitchAngle.toFixed(1)}°</div>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500" style={{width: `${(metrics.pitchAngle/45)*100}%`}}></div>
                        </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-sky-400 font-bold uppercase">Nacelle Yaw</span>
                       <Compass size={14} className="text-sky-600" />
                    </div>
                    <div className="text-xs text-slate-400 mb-1">Aligning to wind vector...</div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Error</span>
                        <span className="text-green-400 font-mono">0.5°</span>
                    </div>
                 </div>

              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin & Curves */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-gradient-to-b from-[#0f172a] to-[#020617] border border-sky-800/40 relative rounded overflow-hidden shadow-[inset_0_0_40px_rgba(14,165,233,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                 <div className="bg-black/40 backdrop-blur p-2 rounded border border-white/10">
                     <div className="text-[10px] text-sky-300 font-mono">GRID FREQUENCY</div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white tracking-tighter">{metrics.gridFreq.toFixed(2)}</span>
                        <span className="text-xs text-slate-400">Hz</span>
                     </div>
                 </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-sky-500/30 backdrop-blur">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-sky-100">MPPT ACTIVE</span>
                 </div>
              </div>

              <ThreeScene type="wind-turbine" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Power Curve Analysis */}
           <SciFiCard title="功率曲线分析" subtitle="POWER CURVE" className="h-[280px] border-sky-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="wind" name="Wind Speed" unit="m/s" stroke="#64748b" domain={[0, 25]} />
                      <YAxis type="number" dataKey="power" name="Power" unit="kW" stroke="#64748b" domain={[0, 3500]} />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                      
                      {/* Theoretical Curve (Line simulated by scatter) */}
                      <Scatter name="Design Curve" data={theoreticalCurve} line={{stroke: '#0284c7', strokeWidth: 2}} shape={() => null} />
                      
                      {/* Real-time Operating Point */}
                      <Scatter name="Current Ops" data={[currentPoint]} fill="#facc15" shape="circle" r={6} />
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Drivetrain Health */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Vibration Analysis */}
           <SciFiCard title="传动链震动频谱" subtitle="FFT ANALYSIS" className="flex-1 border-sky-900/50">
              <div className="h-40 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vibrationData}>
                       <defs>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="freq" hide />
                       <YAxis hide domain={[0, 4]} />
                       <Area type="monotone" dataKey="amp" stroke="#ef4444" strokeWidth={1} fill="url(#colorVib)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-xs p-2 bg-slate-900/40 rounded border border-slate-800">
                    <span className="text-slate-400">Main Bearing</span>
                    <span className="text-green-400">0.8 mm/s</span>
                 </div>
                 <div className="flex justify-between items-center text-xs p-2 bg-slate-900/40 rounded border border-slate-800">
                    <span className="text-slate-400">Gearbox HSS</span>
                    <span className="text-yellow-500 font-bold">2.4 mm/s</span>
                 </div>
                 <div className="flex justify-between items-center text-xs p-2 bg-slate-900/40 rounded border border-slate-800">
                    <span className="text-slate-400">Generator DE</span>
                    <span className="text-green-400">1.1 mm/s</span>
                 </div>
              </div>
           </SciFiCard>

           {/* Temperature Monitor */}
           <SciFiCard title="关键部件温度" className="border-sky-900/50">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                       <Thermometer size={14} className="text-orange-500" /> Gearbox Oil
                    </div>
                    <span className="font-mono font-bold text-white">62.5°C</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{width: '60%'}}></div>
                 </div>

                 <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                       <Thermometer size={14} className="text-red-500" /> Generator Winding
                    </div>
                    <span className="font-mono font-bold text-white">98.2°C</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{width: '75%'}}></div>
                 </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};