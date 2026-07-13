import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-12]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-12';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  ArrowDown, ArrowUp, Lock, Gauge, Settings, 
  AlertTriangle, Hammer, Ruler, ChevronsDown
} from 'lucide-react';

export const MineHoistView: React.FC = () => {
  // --- STATE ---
  const [hoistStatus, setHoistStatus] = useState({
    depth: 450, // meters
    velocity: 8.5, // m/s
    payload: 24.5, // tons
    mode: 'AUTO', // AUTO, MAN, INSPECT
    drumSpeed: 42, // rpm
    brakePressure: 14.5, // MPa
    direction: 'DOWN' as 'UP' | 'DOWN' | 'STOP'
  });

  const [velocityCurve, setVelocityCurve] = useState<any[]>([]);
  const [ropeTensions, setRopeTensions] = useState([
      { id: 'R1', val: 120 },
      { id: 'R2', val: 122 },
      { id: 'R3', val: 119 },
      { id: 'R4', val: 121 },
  ]);

  // Simulate Hoist Cycle
  useEffect(() => {
    // Generate S-Curve for velocity chart visualization
    const curve = [];
    for(let i=0; i<=60; i++) {
        let v = 0;
        if(i < 10) v = i; // Accel
        else if (i < 50) v = 10; // Constant
        else v = 10 - (i-50); // Decel
        curve.push({ time: i, vel: Math.max(0, v) });
    }
    setVelocityCurve(curve);

    const interval = setInterval(() => {
      const time = Date.now() / 3000;
      
      // 1. Dynamics
      setHoistStatus(prev => {
          const cyclePos = Math.sin(time); // -1 to 1
          const newDepth = 400 + cyclePos * 350; // 50m to 750m
          const newDir = cyclePos > prev.depth ? 'DOWN' : 'UP'; // Simplified logic
          const newVel = Math.abs(Math.cos(time)) * 12; // Speed varies with position change

          return {
              ...prev,
              depth: newDepth,
              velocity: newVel,
              direction: Math.abs(newVel) < 0.5 ? 'STOP' : (Math.cos(time) > 0 ? 'DOWN' : 'UP'),
              payload: 24.5 + (Math.random() - 0.5) * 0.2,
              drumSpeed: newVel * 4.5,
              brakePressure: 14.5 + (Math.random() - 0.5) * 0.1
          };
      });

      // 2. Rope Tensions
      setRopeTensions(prev => prev.map(r => ({
          ...r,
          val: 120 + (Math.random() - 0.5) * 5
      })));

    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-amber-50 selection:bg-amber-500/30">
      
      {/* HEADER: Deep Earth Theme */}
      <div className="flex items-end justify-between border-b border-amber-700/40 pb-4 bg-gradient-to-r from-[#2a1b0a] to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <ChevronsDown size={12} className="animate-bounce" />
             DEEP SHAFT TRANSPORTATION
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-amber-500 text-shadow-glow">矿山提升机</span> 智能运维系统
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">SHAFT-MAIN-01</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Current Depth</div>
                <div className="text-2xl font-mono font-bold text-amber-400">-{hoistStatus.depth.toFixed(1)} <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Cage Velocity</div>
                <div className="text-2xl font-mono font-bold text-white">{hoistStatus.velocity.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">System Mode</div>
                <div className="text-2xl font-mono font-bold text-green-500 bg-green-900/20 px-2 rounded border border-green-800/30">{hoistStatus.mode}</div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Drive & Safety */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Safety Braking System */}
           <SciFiCard title="液压制动站监测" subtitle="SAFETY CRITICAL" className="border-amber-900/50 bg-[#160b00]/80">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border-l-4 border-amber-600">
                    <div className="flex items-center gap-3">
                        <Gauge size={20} className="text-amber-500" />
                        <div>
                            <div className="text-xs text-slate-400">OIL PRESSURE (E1)</div>
                            <div className="text-sm font-bold text-white">{hoistStatus.brakePressure.toFixed(2)} MPa</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-white/5 rounded border-l-4 border-amber-600">
                    <div className="flex items-center gap-3">
                        <Gauge size={20} className="text-amber-500" />
                        <div>
                            <div className="text-xs text-slate-400">OIL PRESSURE (E2)</div>
                            <div className="text-sm font-bold text-white">{(hoistStatus.brakePressure - 0.1).toFixed(2)} MPa</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                         <div className="text-[10px] text-slate-500">Brake Shoe Gap</div>
                         <div className="text-green-400 font-mono">1.5 mm</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                         <div className="text-[10px] text-slate-500">Disc Temp</div>
                         <div className="text-orange-400 font-mono">65 °C</div>
                     </div>
                 </div>
              </div>
           </SciFiCard>

           {/* Motor Status */}
           <SciFiCard title="主电机状态" className="flex-1 border-amber-900/50">
              <div className="flex flex-col gap-4 justify-center h-full">
                 <div className="text-center">
                     <div className="relative inline-block">
                         <div className={`w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center ${hoistStatus.velocity > 0.5 ? 'animate-[spin_3s_linear_infinite]' : ''}`}>
                             <div className="w-2 h-2 bg-amber-500 rounded-full absolute top-2"></div>
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center flex-col">
                             <span className="text-3xl font-bold text-white">{hoistStatus.drumSpeed.toFixed(0)}</span>
                             <span className="text-[10px] text-slate-500">RPM</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-slate-400">Armature Current</span>
                         <span className="text-amber-200 font-mono">1250 A</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-amber-500 h-full" style={{width: '65%'}}></div>
                     </div>
                     
                     <div className="flex justify-between text-xs mt-2">
                         <span className="text-slate-400">Stator Temp</span>
                         <span className="text-amber-200 font-mono">72 °C</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-red-500 h-full" style={{width: '40%'}}></div>
                     </div>
                 </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Shaft Visualization */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0500] border border-amber-800/40 relative rounded overflow-hidden shadow-[inset_0_0_80px_rgba(217,119,6,0.1)]">
              {/* Depth Ruler Overlay (Left) */}
              <div className="absolute top-0 left-0 bottom-0 w-12 bg-black/40 border-r border-amber-900/30 flex flex-col justify-between py-4 items-center z-10">
                  <span className="text-[10px] text-slate-500">0m</span>
                  <div className="flex-1 w-[1px] bg-slate-700 my-2 relative">
                      {/* Moving Marker */}
                      <div 
                        className="absolute w-3 h-3 bg-amber-500 -left-1.5 rounded-sm shadow-[0_0_10px_orange]"
                        style={{ top: `${(hoistStatus.depth / 800) * 100}%` }}
                      ></div>
                  </div>
                  <span className="text-[10px] text-slate-500">-800m</span>
              </div>

              {/* Status Overlay (Top Right) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                     {hoistStatus.direction === 'UP' && <ArrowUp className="text-green-500 animate-bounce" />}
                     {hoistStatus.direction === 'DOWN' && <ArrowDown className="text-amber-500 animate-bounce" />}
                     {hoistStatus.direction === 'STOP' && <Lock className="text-red-500" />}
                     <span className="text-lg font-bold text-white tracking-widest">{hoistStatus.direction}</span>
                 </div>
                 <div className="text-[10px] text-slate-400 font-mono">Payload: {hoistStatus.payload.toFixed(2)} t</div>
              </div>

              <ThreeScene type="mine-hoist" color="#d97706" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Velocity Chart (S-Curve) */}
           <SciFiCard title="提升速度曲线" subtitle="VELOCITY PROFILE" className="h-[250px] border-amber-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={velocityCurve}>
                       <defs>
                          <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#b45309" tick={{fontSize: 10}} domain={[0, 12]} />
                       <Tooltip contentStyle={{backgroundColor: '#1a0d00', borderColor: '#d97706', color: '#fff'}} />
                       <Area type="monotone" dataKey="vel" stroke="#d97706" strokeWidth={2} fill="url(#colorVel)" isAnimationActive={false} />
                       {/* Current Speed Line */}
                       <ReferenceLine y={hoistStatus.velocity} stroke="#fff" strokeDasharray="3 3" label={{value: 'Current', fill: '#fff', fontSize: 10}} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Ropes & Environment */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Wire Rope Tension Balance */}
           <SciFiCard title="钢丝绳张力平衡" subtitle="TENSION (kN)" className="flex-1 border-amber-900/50">
              <div className="h-48 w-full flex items-end justify-between gap-2 px-2 pb-4 border-b border-slate-800">
                  {ropeTensions.map((rope, i) => (
                      <div key={rope.id} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="text-[10px] text-slate-400 group-hover:text-white transition-colors">{rope.val.toFixed(0)}</div>
                          <div className="w-full bg-slate-800 rounded-t-sm relative overflow-hidden h-32">
                              <div 
                                className={`absolute bottom-0 w-full transition-all duration-500 ${rope.val > 123 || rope.val < 117 ? 'bg-red-500' : 'bg-amber-600'}`} 
                                style={{height: `${(rope.val / 150) * 100}%`}}
                              ></div>
                          </div>
                          <div className="text-xs font-bold text-slate-500">{rope.id}</div>
                      </div>
                  ))}
              </div>
              <div className="mt-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Imbalance Coefficient</div>
                  <div className="text-xl font-mono text-green-400">1.2% <span className="text-xs text-slate-600">(Limit: 5%)</span></div>
              </div>
           </SciFiCard>

           {/* Safety Chain */}
           <SciFiCard title="安全回路监控" className="border-amber-900/50">
              <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Lock size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Shaft Gate: CLOSED</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Ruler size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Overwind: OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Hammer size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">Slack Rope: OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800/30">
                      <Settings size={12} className="text-green-500" />
                      <span className="text-[10px] text-green-200">PLC Health: OK</span>
                  </div>
              </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};