import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-14]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-14';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ArrowDown, RotateCw, Activity, Droplets, Thermometer, 
  Layers, Database, Hammer, AlignVerticalJustifyCenter, Gauge
} from 'lucide-react';

export const DrillingRigView: React.FC = () => {
  // --- STATE ---
  const [drillParams, setDrillParams] = useState({
    depth: 3450.5, // m
    rop: 25.4, // m/h (Rate of Penetration)
    wob: 15.2, // ton (Weight on Bit)
    rpm: 118, // rev/min
    torque: 14.5, // kNm
    spp: 21.5, // MPa (Standpipe Pressure)
    mudFlow: 2450, // L/min
    hookLoad: 125, // ton
  });

  const [formation, setFormation] = useState({
    lithology: 'Sandstone',
    porosity: 12.5, // %
    resistivity: 150, // ohm.m
    gamma: 45, // API
  });

  const [bitHealth, setBitHealth] = useState(88.5); // %

  // MWD (Measurement While Drilling) Log Data
  const [logData, setLogData] = useState<any[]>([]);

  // Init Data
  useEffect(() => {
    const initLogs = Array.from({length: 50}, (_, i) => ({
        depth: 3400 + i,
        gamma: 40 + Math.random() * 60,
        res: 10 + Math.random() * 200,
        rop: 20 + Math.random() * 10
    }));
    setLogData(initLogs);

    const interval = setInterval(() => {
      // 1. Update Drilling Parameters (Simulation)
      setDrillParams(prev => ({
          ...prev,
          depth: prev.depth + 0.01,
          rop: 25 + (Math.random() - 0.5) * 5,
          wob: 15 + (Math.random() - 0.5) * 1,
          rpm: 118 + (Math.random() - 0.5) * 2,
          torque: 14.5 + (Math.random() - 0.5) * 0.5,
          spp: 21.5 + (Math.random() - 0.5) * 0.2,
          hookLoad: 125 + (Math.random() - 0.5) * 2
      }));

      // 2. Update Formation Info
      if (Math.random() > 0.95) {
          const types = ['Sandstone', 'Shale', 'Limestone', 'Dolomite'];
          setFormation(prev => ({
              ...prev,
              lithology: types[Math.floor(Math.random() * types.length)],
              gamma: Math.random() * 150
          }));
      }

      // 3. Bit Wear
      setBitHealth(prev => Math.max(0, prev - 0.001));

      // 4. Update Log Data (Scroll)
      setLogData(prev => {
          const lastDepth = prev[prev.length - 1].depth;
          const newPoint = {
              depth: lastDepth + 1,
              gamma: 40 + Math.random() * 60,
              res: 10 + Math.random() * 200,
              rop: 25 + (Math.random() - 0.5) * 10
          };
          return [...prev.slice(1), newPoint];
      });

    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-cyan-50 selection:bg-cyan-500/30">
      
      {/* HEADER: Deep Drilling Theme */}
      <div className="flex items-end justify-between border-b border-cyan-700/40 pb-4 bg-gradient-to-r from-[#082f49] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <AlignVerticalJustifyCenter size={12} className="animate-pulse" />
             DEEP EARTH EXPLORATION
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-cyan-400 text-shadow-glow">钻孔设备</span> 智能运维指挥舱
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">RIG-Z88</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Bit Depth</div>
                <div className="text-3xl font-mono font-bold text-white">{drillParams.depth.toFixed(2)} <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">ROP (Speed)</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{drillParams.rop.toFixed(1)} <span className="text-sm text-slate-500">m/h</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-cyan-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Total Hook Load</div>
                <div className="text-2xl font-mono font-bold text-orange-400">{drillParams.hookLoad.toFixed(1)} <span className="text-sm text-slate-500">t</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Driller's Console */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Primary Gauges */}
           <SciFiCard title="司钻控制台" subtitle="DRILLER CONSOLE" className="border-cyan-900/50 bg-[#0c1220]/80">
              <div className="grid grid-cols-2 gap-4">
                  
                  {/* WOB Gauge */}
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-700 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">WOB (Weight on Bit)</span>
                      <div className="relative w-20 h-10 overflow-hidden mb-1">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
                          <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-white origin-bottom" style={{transform: `translateX(-50%) rotate(${(drillParams.wob / 30) * 180 - 90}deg)`}}></div>
                      </div>
                      <span className="text-xl font-mono font-bold text-cyan-300">{drillParams.wob.toFixed(1)} <span className="text-xs">t</span></span>
                  </div>

                  {/* Torque Gauge */}
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-700 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">TORQUE</span>
                      <div className="relative w-20 h-10 overflow-hidden mb-1">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-slate-700 border-t-orange-500"></div>
                          <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-white origin-bottom" style={{transform: `translateX(-50%) rotate(${(drillParams.torque / 25) * 180 - 90}deg)`}}></div>
                      </div>
                      <span className="text-xl font-mono font-bold text-orange-400">{drillParams.torque.toFixed(1)} <span className="text-xs">kNm</span></span>
                  </div>

                  {/* RPM Box */}
                  <div className="col-span-2 bg-slate-900/50 p-3 rounded border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <RotateCw size={18} className="text-green-400 animate-spin" />
                          <span className="text-xs text-slate-300 font-bold">ROTARY SPEED</span>
                      </div>
                      <span className="text-2xl font-mono font-bold text-white">{drillParams.rpm.toFixed(0)} <span className="text-xs text-slate-500">RPM</span></span>
                  </div>

              </div>
           </SciFiCard>

           {/* Hydraulic System */}
           <SciFiCard title="泥浆循环系统" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Gauge size={16} className="text-red-400" />
                          <span className="text-xs text-slate-300">Standpipe Pressure</span>
                      </div>
                      <span className="text-xl font-bold text-white font-mono">{drillParams.spp.toFixed(1)} <span className="text-xs">MPa</span></span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{width: `${(drillParams.spp/35)*100}%`}}></div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                          <Droplets size={16} className="text-blue-400" />
                          <span className="text-xs text-slate-300">Flow Rate (In)</span>
                      </div>
                      <span className="text-xl font-bold text-blue-200 font-mono">{drillParams.mudFlow.toFixed(0)} <span className="text-xs">L/min</span></span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: `${(drillParams.mudFlow/3000)*100}%`}}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                      <div className="p-2 bg-slate-800/50 rounded border border-slate-700">
                          <div className="text-[10px] text-slate-500">Density</div>
                          <div className="text-sm font-bold text-white">1.25 sg</div>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded border border-slate-700">
                          <div className="text-[10px] text-slate-500">Viscosity</div>
                          <div className="text-sm font-bold text-white">45 sec</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin + MWD */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#000a14] border border-cyan-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(34,211,238,0.1)]">
              {/* Overlay: Drilling Mode */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-cyan-500/30">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-cyan-100">MODE: ROTARY DRILLING</span>
              </div>

              {/* Overlay: Survey Data */}
              <div className="absolute bottom-4 left-4 z-10 p-2 bg-black/70 rounded border border-slate-600 backdrop-blur">
                  <div className="text-[10px] text-slate-400 mb-1 font-bold">LAST SURVEY</div>
                  <div className="flex gap-4 font-mono text-xs">
                      <div>
                          <div className="text-slate-500">INC</div>
                          <div className="text-white font-bold">2.5°</div>
                      </div>
                      <div>
                          <div className="text-slate-500">AZI</div>
                          <div className="text-white font-bold">145°</div>
                      </div>
                      <div>
                          <div className="text-slate-500">TVD</div>
                          <div className="text-white font-bold">3448m</div>
                      </div>
                  </div>
              </div>

              <ThreeScene type="drilling-rig" color="#22d3ee" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* MWD Logs (Horizontal Chart) */}
           <SciFiCard title="随钻测井曲线 (MWD)" subtitle="REAL-TIME LOGS" className="h-[250px] border-cyan-900/50" noPadding>
              <div className="w-full h-full p-4 flex gap-2">
                 {/* Gamma Ray Track */}
                 <div className="flex-1 flex flex-col">
                     <div className="text-[10px] text-center text-green-400 border-b border-slate-700 mb-1">GAMMA (API)</div>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart layout="vertical" data={logData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <YAxis type="number" dataKey="depth" domain={['dataMin', 'dataMax']} reversed stroke="#64748b" tick={{fontSize: 10}} width={40} />
                           <XAxis type="number" domain={[0, 150]} hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#22c55e', fontSize: '10px'}} />
                           <Line dataKey="gamma" stroke="#22c55e" strokeWidth={1} dot={false} isAnimationActive={false} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>

                 {/* Resistivity Track */}
                 <div className="flex-1 flex flex-col border-l border-slate-800 pl-2">
                     <div className="text-[10px] text-center text-red-400 border-b border-slate-700 mb-1">RESISTIVITY (Ωm)</div>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart layout="vertical" data={logData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <YAxis type="number" dataKey="depth" domain={['dataMin', 'dataMax']} reversed hide />
                           <XAxis type="number" domain={[0, 200]} hide />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444', fontSize: '10px'}} />
                           <Line dataKey="res" stroke="#ef4444" strokeWidth={1} dot={false} isAnimationActive={false} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>

                 {/* ROP Track */}
                 <div className="flex-1 flex flex-col border-l border-slate-800 pl-2">
                     <div className="text-[10px] text-center text-cyan-400 border-b border-slate-700 mb-1">ROP (m/h)</div>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart layout="vertical" data={logData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <YAxis type="number" dataKey="depth" domain={['dataMin', 'dataMax']} reversed hide />
                           <XAxis type="number" domain={[0, 100]} hide />
                           <Area dataKey="rop" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} isAnimationActive={false} />
                        </AreaChart>
                     </ResponsiveContainer>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Geology & Bit */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Geological Evaluation */}
           <SciFiCard title="地层岩性分析" subtitle="FORMATION EVAL" className="flex-1 border-cyan-900/50">
              <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700 flex flex-col items-center">
                      <Layers size={32} className="text-yellow-600 mb-2" />
                      <div className="text-lg font-bold text-white uppercase tracking-wider">{formation.lithology}</div>
                      <div className="text-xs text-slate-500">Current Formation</div>
                  </div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Porosity (Φ)</span>
                          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${formation.porosity * 3}%`}}></div>
                          </div>
                          <span className="text-white font-mono">{formation.porosity.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Gamma Ray</span>
                          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{width: `${(formation.gamma / 150) * 100}%`}}></div>
                          </div>
                          <span className="text-white font-mono">{formation.gamma.toFixed(0)}</span>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Drill Bit Health */}
           <SciFiCard title="钻头寿命预测" className="border-cyan-900/50">
               <div className="flex items-center gap-4">
                   <div className="relative w-20 h-20">
                       {/* Circular Progress */}
                       <svg className="w-full h-full transform -rotate-90">
                           <circle cx="40" cy="40" r="36" stroke="#1e293b" strokeWidth="8" fill="none" />
                           <circle cx="40" cy="40" r="36" stroke={bitHealth > 50 ? '#10b981' : '#ef4444'} strokeWidth="8" fill="none" strokeDasharray="226" strokeDashoffset={226 - (226 * bitHealth) / 100} />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center flex-col">
                           <span className="text-sm font-bold text-white">{bitHealth.toFixed(0)}%</span>
                           <span className="text-[8px] text-slate-500">HEALTH</span>
                       </div>
                   </div>
                   <div className="flex-1 space-y-2">
                       <div className="text-xs text-slate-400">Type: PDC 8-Blade</div>
                       <div className="text-xs text-slate-400">Hrs Run: 48.5h</div>
                       <div className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-950/30 px-2 py-1 rounded border border-orange-900/50">
                           <Hammer size={10} /> High Vibration Detect
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};