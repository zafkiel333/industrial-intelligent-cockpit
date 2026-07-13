import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-13]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-13';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  Disc, Target, Layers, ArrowRight, Activity, Thermometer, 
  Gauge, AlertTriangle, RotateCw, Cylinder, Drill, Compass
} from 'lucide-react';

export const TunnelBoringMachineView: React.FC = () => {
  // --- STATE ---
  const [tbmStatus, setTbmStatus] = useState({
    advanceRate: 45, // mm/min
    totalThrust: 12500, // kN
    cutterTorque: 3400, // kNm
    rpm: 1.8, // rev/min
    chamberPressure: 2.4, // bar
    screwSpeed: 8.5, // rpm
    penetration: 1245.5, // meters (Chainage)
    ringNo: 842,
    mode: 'ADVANCE', // ADVANCE, ERECT, STANDBY
  });

  const [guidance, setGuidance] = useState({
    hDev: 12, // Horizontal deviation mm
    vDev: -5, // Vertical deviation mm
    roll: 0.4, // deg
    pitch: -0.2, // deg
    trend: 'CORRECTING'
  });

  const [sensors, setSensors] = useState([
    { id: 'HB-1', val: 2.4, type: 'pressure' },
    { id: 'HB-2', val: 2.5, type: 'pressure' },
    { id: 'HB-3', val: 2.3, type: 'pressure' },
    { id: 'HB-4', val: 2.4, type: 'pressure' },
    { id: 'Temp-Main', val: 62, type: 'temp' },
    { id: 'Gas-CH4', val: 0.02, type: 'gas' },
  ]);

  const [thrustHistory, setThrustHistory] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init History
    const initHist = Array.from({length: 30}, (_, i) => ({
        time: i,
        thrust: 12000 + Math.random() * 1000,
        torque: 3000 + Math.random() * 500
    }));
    setThrustHistory(initHist);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. TBM Dynamics
      setTbmStatus(prev => ({
          ...prev,
          advanceRate: prev.mode === 'ADVANCE' ? 45 + Math.sin(time) * 5 : 0,
          totalThrust: 12500 + (Math.random() - 0.5) * 500,
          cutterTorque: 3400 + (Math.random() - 0.5) * 200,
          rpm: prev.mode === 'ADVANCE' ? 1.8 + (Math.random() - 0.5) * 0.1 : 0,
          chamberPressure: 2.4 + (Math.random() - 0.5) * 0.1,
          penetration: prev.penetration + (prev.mode === 'ADVANCE' ? 0.001 : 0)
      }));

      // 2. Guidance
      setGuidance(prev => ({
          hDev: 12 + Math.sin(time * 0.2) * 2,
          vDev: -5 + Math.cos(time * 0.3) * 2,
          roll: Math.sin(time * 0.5) * 0.5,
          pitch: -0.2,
          trend: 'CORRECTING'
      }));

      // 3. Sensors
      setSensors(prev => prev.map(s => ({
          ...s,
          val: s.type === 'pressure' ? 2.4 + (Math.random()-0.5)*0.2 : s.val
      })));

      // 4. History
      setThrustHistory(prev => {
          const lastTime = prev[prev.length - 1].time;
          return [...prev.slice(1), { 
              time: lastTime + 1, 
              thrust: 12500 + (Math.random() - 0.5) * 500,
              torque: 3400 + (Math.random() - 0.5) * 200
          }];
      });

    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Data for Geological Slice
  const geoData = [
      { name: 'Soft Soil', value: 20, color: '#a8a29e' },
      { name: 'Mixed Ground', value: 40, color: '#78716c' },
      { name: 'Hard Rock', value: 40, color: '#44403c' },
  ];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-stone-50 selection:bg-red-500/30">
      
      {/* HEADER: Subterranean Theme */}
      <div className="flex items-end justify-between border-b border-red-900/40 pb-4 bg-gradient-to-r from-[#1c1917] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-500 mb-1 uppercase tracking-wider">
             <Disc size={12} className="animate-spin" />
             SHIELD TUNNELING SYSTEM
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-red-500 text-shadow-glow">掘进设备</span> 智能运维指挥舱
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">TBM-EARTHWORM</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Chainage (Distance)</div>
                <div className="text-2xl font-mono font-bold text-stone-300">K1+245.5 <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-red-900/30 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Current Ring</div>
                <div className="text-2xl font-mono font-bold text-white">#{tbmStatus.ringNo}</div>
            </div>
            <div className="flex flex-col items-end border-l border-red-900/30 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Operation Mode</div>
                <div className="text-2xl font-mono font-bold text-red-500 bg-red-950/30 px-2 rounded border border-red-900/50">{tbmStatus.mode}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Guidance & Geology */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Laser Guidance System (SLS) */}
           <SciFiCard title="激光导向系统 (SLS)" subtitle="DEVIATION" className="border-red-900/50 bg-[#0c0a09]/80">
              <div className="flex flex-col items-center justify-center p-4">
                  {/* Crosshair Visual */}
                  <div className="relative w-40 h-40 border border-stone-700 rounded-full flex items-center justify-center bg-stone-900/50">
                      {/* Grid */}
                      <div className="absolute w-full h-[1px] bg-stone-700"></div>
                      <div className="absolute h-full w-[1px] bg-stone-700"></div>
                      <div className="absolute w-20 h-20 border border-stone-700/50 rounded-full"></div>
                      
                      {/* Target Point (Moving) */}
                      <div 
                        className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] transition-all duration-500"
                        style={{ 
                            transform: `translate(${guidance.hDev}px, ${-guidance.vDev}px)` 
                        }}
                      ></div>
                      
                      {/* Axis Labels */}
                      <span className="absolute right-2 top-1/2 text-[8px] text-stone-500">X</span>
                      <span className="absolute top-2 left-1/2 text-[8px] text-stone-500">Y</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                      <div className="text-center bg-stone-800/50 p-2 rounded border border-stone-700">
                          <div className="text-[10px] text-stone-400">Horizontal (X)</div>
                          <div className={`font-mono font-bold ${Math.abs(guidance.hDev) > 20 ? 'text-red-500' : 'text-white'}`}>
                              {guidance.hDev > 0 ? '+' : ''}{guidance.hDev.toFixed(1)} mm
                          </div>
                      </div>
                      <div className="text-center bg-stone-800/50 p-2 rounded border border-stone-700">
                          <div className="text-[10px] text-stone-400">Vertical (Y)</div>
                          <div className={`font-mono font-bold ${Math.abs(guidance.vDev) > 20 ? 'text-red-500' : 'text-white'}`}>
                              {guidance.vDev > 0 ? '+' : ''}{guidance.vDev.toFixed(1)} mm
                          </div>
                      </div>
                  </div>
                  
                  <div className="w-full flex justify-between px-2 mt-2 text-[10px] text-stone-500">
                      <span>Roll: {guidance.roll.toFixed(1)}°</span>
                      <span>Pitch: {guidance.pitch.toFixed(1)}°</span>
                  </div>
              </div>
           </SciFiCard>

           {/* Geological Prediction */}
           <SciFiCard title="超前地质预报" className="flex-1 border-red-900/50">
              <div className="flex flex-col h-full gap-2">
                  <div className="flex justify-between items-center text-xs text-stone-400">
                      <span className="flex items-center gap-2"><Layers size={14}/> Strata Profile</span>
                      <span>Next 100m</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col relative bg-stone-900/50 border border-stone-800 rounded overflow-hidden">
                      {/* Geological Layers Visualization */}
                      <div className="flex-1 bg-[#44403c] flex items-center justify-center border-b border-stone-900 relative">
                          <span className="text-xs text-stone-300 font-bold z-10">Hard Rock (III)</span>
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')]"></div>
                      </div>
                      <div className="flex-1 bg-[#78716c] flex items-center justify-center border-b border-stone-900 relative">
                          <span className="text-xs text-stone-800 font-bold z-10">Mixed Ground</span>
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')]"></div>
                      </div>
                      <div className="h-16 bg-[#a8a29e] flex items-center justify-center relative">
                          <span className="text-xs text-stone-800 font-bold z-10">Soft Soil</span>
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]"></div>
                      </div>
                      
                      {/* TBM Position Indicator */}
                      <div className="absolute left-0 bottom-12 w-full h-1 bg-red-500 shadow-[0_0_8px_red]"></div>
                      <span className="absolute right-1 bottom-14 text-[10px] text-red-400 font-bold">CURRENT FACE</span>
                  </div>

                  <div className="p-2 bg-stone-800/30 rounded text-[10px] text-stone-400">
                      Warning: Transition zone detected at K1+260. Recommended thrust reduction.
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0a09] border border-red-900/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(239,68,68,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                 <div className="bg-black/60 p-2 rounded border border-red-500/30 backdrop-blur">
                    <div className="text-[10px] text-red-400 mb-1 font-bold">CUTTERHEAD</div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white">{tbmStatus.rpm.toFixed(1)}</span>
                            <span className="text-[8px] text-stone-400">RPM</span>
                        </div>
                        <div className="w-[1px] h-8 bg-stone-700"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white">{tbmStatus.cutterTorque.toFixed(0)}</span>
                            <span className="text-[8px] text-stone-400">kNm</span>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-stone-600">
                    <Activity className="text-green-500 animate-pulse" size={14} />
                    <span className="text-xs text-white font-mono">HYDRAULICS: OPTIMAL</span>
                 </div>
              </div>

              <ThreeScene type="tbm" color="#ef4444" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Propulsion Parameters Chart */}
           <SciFiCard title="掘进参数关联分析" subtitle="THRUST vs TORQUE" className="h-[250px] border-red-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={thrustHistory}>
                       <defs>
                          <linearGradient id="colorThrust" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis yAxisId="left" stroke="#ef4444" tick={{fontSize: 10}} domain={[10000, 15000]} label={{ value: 'Thrust (kN)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{fontSize: 10}} domain={[2000, 4000]} label={{ value: 'Torque (kNm)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10 }} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#ef4444', color: '#fff'}} />
                       <Area yAxisId="left" type="monotone" dataKey="thrust" stroke="#ef4444" fill="url(#colorThrust)" />
                       <Area yAxisId="right" type="monotone" dataKey="torque" stroke="#f97316" fill="url(#colorTorque)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: EPB & Auxiliaries */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Chamber Pressure (EPB) */}
           <SciFiCard title="土仓压力监测 (EPB)" subtitle="BAR" className="flex-1 border-red-900/50">
              <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                      {sensors.filter(s => s.type === 'pressure').map((sensor, i) => (
                          <div key={i} className="bg-stone-900/50 p-3 rounded border border-stone-800 flex flex-col items-center">
                              <span className="text-[10px] text-stone-500 uppercase">{sensor.id}</span>
                              <div className="flex items-center gap-1">
                                  <Gauge size={14} className="text-red-500" />
                                  <span className="text-xl font-bold text-white">{sensor.val.toFixed(2)}</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-2 p-3 bg-stone-800/30 rounded border border-stone-700">
                      <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-stone-400">Screw Conveyor Speed</span>
                          <span className="text-orange-400 font-mono font-bold">{tbmStatus.screwSpeed.toFixed(1)} rpm</span>
                      </div>
                      <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Auxiliary Systems */}
           <SciFiCard title="辅助系统状态" className="border-red-900/50">
               <div className="space-y-3">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-400">
                           <Thermometer size={14} className="text-yellow-500" /> Main Bearing Temp
                       </div>
                       <span className="font-mono font-bold text-white">62°C</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-400">
                           <AlertTriangle size={14} className="text-red-500" /> Gas Sensor (CH4)
                       </div>
                       <span className="font-mono font-bold text-green-400">0.02%</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-400">
                           <Cylinder size={14} className="text-blue-500" /> Grease System
                       </div>
                       <span className="font-mono font-bold text-white">OK</span>
                   </div>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-stone-400">
                           <Drill size={14} className="text-stone-300" /> Segment Erector
                       </div>
                       <span className="text-xs bg-stone-800 px-2 py-0.5 rounded text-stone-300">STANDBY</span>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};