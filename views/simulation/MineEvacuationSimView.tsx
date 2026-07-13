
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-mine-evac]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-mine-evac';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Users, Siren, Heart, Wind, ShieldCheck, 
  MapPin, Clock, AlertTriangle, Radio, 
  TrendingUp, Activity, Play, Octagon, RotateCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line
} from 'recharts';

// --- MOCK DATA ---

const BIO_DATA = Array.from({length: 30}, (_, i) => ({
    time: i,
    hr: 80 + Math.random() * 20, // Baseline
    stress: 20 + Math.random() * 10
}));

const GAS_DATA = Array.from({length: 24}, (_, i) => ({
    dist: i * 50, // m from source
    co: 100 * Math.exp(-0.1 * i), // ppm
    o2: 18 + 3 * (1 - Math.exp(-0.1 * i)) // %
}));

const ZONES = [
    { id: 'Z-01', name: 'West Wing (Face A)', count: 5, status: 'Clear' },
    { id: 'Z-02', name: 'East Wing (Face B)', count: 4, status: 'Clear' },
    { id: 'Z-03', name: 'Main Ramp', count: 0, status: 'Smoke' },
    { id: 'Z-04', name: 'Deep Sump', count: 6, status: 'Trapped' },
];

export const MineEvacuationSimView: React.FC = () => {
  // --- STATE ---
  const [simStatus, setSimStatus] = useState<'NORMAL' | 'EMERGENCY'>('NORMAL');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [survivors, setSurvivors] = useState(0);
  const [totalMiners] = useState(15);
  
  const [bioTelemetry, setBioTelemetry] = useState(BIO_DATA);

  // Simulation Loop
  useEffect(() => {
    let timer: any;
    if (simStatus === 'EMERGENCY') {
        timer = setInterval(() => {
            setElapsedTime(t => t + 1);
            
            // Simulate survivors arriving (randomly)
            if (Math.random() > 0.95 && survivors < 9) { // Max 9 (6 trapped)
                setSurvivors(s => s + 1);
            }

            // Update Bio-telemetry (Stress increases)
            setBioTelemetry(prev => {
                const next = [...prev.slice(1)];
                const last = prev[prev.length - 1];
                next.push({
                    time: last.time + 1,
                    hr: 120 + Math.random() * 40, // Panic HR
                    stress: 80 + Math.random() * 20
                });
                return next;
            });
        }, 1000);
    } else {
        setElapsedTime(0);
        setSurvivors(0);
        setBioTelemetry(BIO_DATA); // Reset
    }
    return () => clearInterval(timer);
  }, [simStatus, survivors]);

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  return (
    <div className="h-full w-full relative bg-[#050b07] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-evacuation" 
            simData={{ 
                status: simStatus,
                hazardLoc: 'HUB'
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          {/* Hex Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none"></div>
          {/* Radial Darkening */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] pointer-events-none"></div>
          
          {/* Emergency Flashing Overlay */}
          {simStatus === 'EMERGENCY' && (
              <div className="absolute inset-0 border-[20px] border-red-500/20 animate-pulse pointer-events-none box-border z-0"></div>
          )}
      </div>

      {/* TOP HEADER */}
      <div className={`absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start transition-colors duration-500
          ${simStatus === 'EMERGENCY' ? 'bg-gradient-to-b from-red-950/90' : 'bg-gradient-to-b from-[#0a1a12]/90'} to-transparent
      `}>
          <div>
              <div className={`flex items-center gap-2 text-xs mb-1 font-bold tracking-[0.2em] ${simStatus === 'EMERGENCY' ? 'text-red-500 animate-bounce' : 'text-green-500'}`}>
                 {simStatus === 'EMERGENCY' ? <Siren size={14} /> : <ShieldCheck size={14} />} 
                 {simStatus === 'EMERGENCY' ? 'EMERGENCY EVACUATION ACTIVE' : 'SAFETY MONITORING ACTIVE'}
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 井下行人 <span className={simStatus === 'EMERGENCY' ? 'text-red-500' : 'text-green-500'}>安全疏散路径仿真</span>
              </h1>
          </div>
          
          {/* Mission Stats */}
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="flex flex-col items-end">
                   <span className="text-[10px] text-slate-400 uppercase">Mission Timer</span>
                   <span className={`font-mono font-bold text-3xl ${simStatus === 'EMERGENCY' ? 'text-red-400' : 'text-slate-500'}`}>
                       {formatTime(elapsedTime)}
                   </span>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="flex flex-col items-end">
                   <span className="text-[10px] text-slate-400 uppercase">Rescued / Total</span>
                   <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-green-400">{survivors}</span>
                       <span className="text-xl text-slate-500">/ {totalMiners}</span>
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Personnel Status */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Zone Occupancy */}
          <SciFiCard title="区域人员分布" subtitle="ZONES" className={`flex-1 border-opacity-50 pointer-events-auto backdrop-blur-md ${simStatus === 'EMERGENCY' ? 'bg-red-950/20 border-red-500' : 'bg-[#0c120e]/90 border-green-900'}`}>
              <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar p-1">
                  {ZONES.map((zone, i) => (
                      <div key={i} className={`p-3 rounded border flex justify-between items-center
                          ${zone.status === 'Trapped' && simStatus === 'EMERGENCY' ? 'bg-red-900/40 border-red-500 animate-pulse' : 'bg-slate-900/40 border-slate-800'}
                      `}>
                          <div>
                              <div className="text-xs font-bold text-white mb-1">{zone.name}</div>
                              <div className="text-[10px] flex items-center gap-1 text-slate-400">
                                  <MapPin size={10} /> {zone.id}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-bold text-white">{zone.count} <span className="text-[10px] font-normal text-slate-500">pax</span></div>
                              <div className={`text-[9px] font-bold uppercase ${zone.status === 'Trapped' ? 'text-red-400' : 'text-green-400'}`}>{simStatus === 'EMERGENCY' ? zone.status : 'Normal'}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </SciFiCard>

          {/* Bio-Telemetry */}
          <SciFiCard title="生命体征监测" subtitle="VITAL SIGNS" className="h-[200px] border-green-900/50 bg-[#0c120e]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={bioTelemetry}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={[60, 180]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: simStatus === 'EMERGENCY' ? '#ef4444' : '#22c55e'}} />
                           <Line type="monotone" dataKey="hr" stroke={simStatus === 'EMERGENCY' ? '#ef4444' : '#22c55e'} strokeWidth={2} dot={false} isAnimationActive={false} />
                       </LineChart>
                   </ResponsiveContainer>
                   <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-2">
                       <span className="flex items-center gap-1"><Heart size={10} className="text-red-500"/> Avg HR: {simStatus === 'EMERGENCY' ? '142' : '85'} bpm</span>
                       <span>Stress Index: {simStatus === 'EMERGENCY' ? 'HIGH' : 'LOW'}</span>
                   </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Environmental Hazards */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Gas Sensors */}
          <SciFiCard title="环境气体监测" subtitle="SENSORS" className="h-[280px] border-green-900/50 bg-[#0c120e]/90 pointer-events-auto">
              <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-2 gap-3">
                      <div className={`p-2 rounded border text-center ${simStatus === 'EMERGENCY' ? 'bg-red-900/20 border-red-500' : 'bg-slate-900/40 border-slate-800'}`}>
                          <div className="text-[10px] text-slate-400 uppercase">CO Level</div>
                          <div className={`text-2xl font-bold ${simStatus === 'EMERGENCY' ? 'text-red-400' : 'text-white'}`}>
                              {simStatus === 'EMERGENCY' ? '125' : '12'} <span className="text-xs font-normal text-slate-500">ppm</span>
                          </div>
                      </div>
                      <div className="p-2 rounded border bg-slate-900/40 border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400 uppercase">O2 Level</div>
                          <div className="text-2xl font-bold text-white">
                              {simStatus === 'EMERGENCY' ? '18.5' : '20.9'} <span className="text-xs font-normal text-slate-500">%</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full min-h-0 bg-black/20 rounded border border-slate-800 p-2">
                      <div className="text-[9px] text-slate-500 mb-1">Hazard Propagation Model</div>
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={GAS_DATA}>
                              <defs>
                                  <linearGradient id="gradCO" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 9}} />
                              <YAxis hide />
                              <Area type="monotone" dataKey="co" stroke="#ef4444" fill="url(#gradCO)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </SciFiCard>

          {/* Action Log */}
          <div className="flex-1 bg-[#0c120e]/90 backdrop-blur-md border border-green-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-green-900/30 pb-2">
                  <Radio size={16} className="text-blue-400"/> 通信与指令日志
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-2">
                  <div className="text-slate-500">[10:00:00] System Check: Normal</div>
                  <div className="text-slate-500">[10:15:00] Shift Change Complete</div>
                  {simStatus === 'EMERGENCY' && (
                      <>
                          <div className="text-red-400 font-bold">[10:42:05] ALERT: Fire detected at Hub Node 0!</div>
                          <div className="text-yellow-400">[10:42:06] AUTO: Ventilation Reversed</div>
                          <div className="text-yellow-400">[10:42:06] AUTO: Evacuation Alarm Broadcast</div>
                          <div className="text-blue-300">[10:42:15] COMMS: Team A ack receipt</div>
                          <div className="text-red-400">[10:43:00] SENSOR: High CO in Deep Sump</div>
                      </>
                  )}
              </div>
          </div>

      </div>

      {/* BOTTOM CONTROL BAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700 flex items-center gap-8 shadow-2xl">
              
              <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Scenario Control</span>
                  <button 
                    onClick={() => setSimStatus(simStatus === 'NORMAL' ? 'EMERGENCY' : 'NORMAL')}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shadow-[0_0_20px_currentColor]
                        ${simStatus === 'NORMAL' ? 'bg-red-600 border-red-800 text-white hover:bg-red-500' : 'bg-green-600 border-green-800 text-white hover:bg-green-500'}
                    `}
                  >
                      {simStatus === 'NORMAL' ? <AlertTriangle size={32} /> : <RotateCcw size={32} />}
                  </button>
              </div>

              <div className="h-12 w-px bg-slate-700"></div>

              <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 uppercase">Ventilation Mode</label>
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                          <Wind size={12}/> {simStatus === 'EMERGENCY' ? 'REVERSED (EMERGENCY)' : 'NORMAL (INTAKE)'}
                      </div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-400 uppercase">Pathfinding Algo</label>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                          <Activity size={12}/> DYNAMIC A*
                      </div>
                  </div>
              </div>

          </div>
      </div>

    </div>
  );
};
