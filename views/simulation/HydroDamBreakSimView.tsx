
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[sim-hydro-emer]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/sim-hydro-emer';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AlertOctagon, Siren, Timer, Users, 
  MapPin, ShieldAlert, Activity, Play, 
  RotateCcw, Volume2, Waves, ArrowRight,
  Pause
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

// --- MOCK DATA ---
const FLOOD_HYDROGRAPH = Array.from({length: 50}, (_, i) => {
    const t = i;
    // Impulse response curve (Breach discharge)
    // Q_peak approx at t=5
    let q = 0;
    if (t > 0) {
       q = 25000 * Math.pow(t, 2) * Math.exp(-t/3);
    }
    return { time: `T+${t}h`, flow: Math.max(0, q) };
});

const TOWN_RISK = [
    { name: '下游村庄 A', dist: '5km', pop: 1200, eta: '15min', status: 'Evacuating' },
    { name: '工业园区 B', dist: '12km', pop: 500, eta: '45min', status: 'Alerted' },
    { name: '县城 C', dist: '25km', pop: 15000, eta: '2h', status: 'Monitoring' },
];

export const HydroDamBreakSimView: React.FC = () => {
  // --- STATE ---
  const [simState, setSimState] = useState<'READY' | 'BREACHED' | 'RECOVERY'>('READY');
  const [progress, setProgress] = useState(0); // 0-100 timeline
  const [isPlaying, setIsPlaying] = useState(false);
  const [alertLevel, setAlertLevel] = useState('NORMAL');
  
  const [metrics, setMetrics] = useState({
    discharge: 0, // m3/s
    floodDepth: 0, // m (at breach)
    evacuated: 0, // %
    casualties: 0
  });

  // Simulation Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setProgress(p => {
            if (p >= 100) {
                setIsPlaying(false);
                setSimState('RECOVERY');
                return 100;
            }
            return p + 0.5; // Advance time
        });

        // Update Physics Metrics based on progress
        setMetrics(prev => {
            const t = progress / 2; // Map progress to hydrograph time index
            const flow = 25000 * Math.pow(t, 2) * Math.exp(-t/3);
            
            // Evacuation S-Curve
            const evac = 100 / (1 + Math.exp(-0.1 * (progress - 30)));
            
            return {
                discharge: Math.max(0, flow),
                floodDepth: Math.max(0, flow / 2000), // Rough relation
                evacuated: evac,
                casualties: prev.casualties // Static for drill unless fail
            };
        });

    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const triggerBreach = () => {
      setSimState('BREACHED');
      setAlertLevel('RED');
      setIsPlaying(true);
      setProgress(0);
  };

  const resetSim = () => {
      setSimState('READY');
      setAlertLevel('NORMAL');
      setIsPlaying(false);
      setProgress(0);
      setMetrics({ discharge: 0, floodDepth: 0, evacuated: 0, casualties: 0 });
  };

  return (
    <div className="h-full w-full relative bg-[#050000] text-red-50 overflow-hidden font-[Rajdhani]">
      
      {/* 1. 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="hydro-dam-break" 
            simData={{ 
                progress: progress,
                breached: simState === 'BREACHED' || simState === 'RECOVERY'
            }} 
          />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050000_90%)] pointer-events-none"></div>
          {/* Red Alert Strobe Overlay */}
          {alertLevel === 'RED' && (
              <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse z-0 mix-blend-overlay"></div>
          )}
      </div>

      {/* 2. TOP HEADER */}
      <div className={`absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start transition-all duration-500 ${alertLevel === 'RED' ? 'bg-gradient-to-b from-red-950/90' : 'bg-gradient-to-b from-black/80'} to-transparent pointer-events-none`}>
          <div>
              <div className="flex items-center gap-2 text-xs text-red-500 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ShieldAlert size={14} /> EMERGENCY RESPONSE DRILL
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 高坝溃坝 <span className="text-red-600">极端工况应急演练</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Alert Level</span>
                  <div className={`text-3xl font-black ${alertLevel === 'RED' ? 'text-red-500 animate-bounce' : 'text-green-500'}`}>
                      {alertLevel}
                  </div>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase">Time Elapsed</span>
                  <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                      <Timer size={24} className="text-red-500"/> T+{progress.toFixed(1)}h
                  </div>
              </div>
          </div>
      </div>

      {/* 3. CENTER BUTTON (Start) */}
      {simState === 'READY' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
              <button 
                onClick={triggerBreach}
                className="w-48 h-48 rounded-full bg-red-600/20 border-4 border-red-500 hover:bg-red-600/40 text-red-100 font-black text-2xl tracking-widest shadow-[0_0_50px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
              >
                  <AlertOctagon size={48} />
                  INITIATE
                  <span className="text-xs font-normal opacity-70">Simulation Sequence</span>
              </button>
          </div>
      )}

      {/* 4. BOTTOM TIMELINE CONTROL */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/80 border-t border-red-900/50 z-20 px-8 flex items-center gap-6 pointer-events-auto">
          <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="w-12 h-12 rounded-full border border-red-500 flex items-center justify-center hover:bg-red-900/30 text-red-400"
          >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1"/>}
          </button>
          
          <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Pre-Failure</span>
                  <span>Breach Initiation</span>
                  <span>Peak Discharge</span>
                  <span>Flood Recession</span>
                  <span>Recovery</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                  <div className="absolute h-full bg-red-600 transition-all duration-100 ease-linear" style={{width: `${progress}%`}}></div>
                  {/* Markers */}
                  <div className="absolute left-[20%] w-0.5 h-full bg-white/30"></div>
                  <div className="absolute left-[40%] w-0.5 h-full bg-white/30"></div>
                  <div className="absolute left-[80%] w-0.5 h-full bg-white/30"></div>
              </div>
          </div>

          <button 
             onClick={resetSim}
             className="px-4 py-2 border border-slate-600 rounded text-slate-400 hover:text-white hover:border-white transition-colors flex items-center gap-2 text-xs"
          >
              <RotateCcw size={14}/> RESET
          </button>
      </div>

      {/* 5. LEFT PANEL: Physics Data */}
      <div className={`absolute left-6 top-32 bottom-32 w-80 flex flex-col gap-4 z-20 pointer-events-none transition-transform duration-500 ${simState === 'READY' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
          
          {/* Discharge Hydrograph */}
          <SciFiCard title="溃坝流量过程线" subtitle="HYDROGRAPH" className="h-[280px] border-red-900/50 bg-[#1a0505]/80 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={FLOOD_HYDROGRAPH}>
                          <defs>
                              <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#331c1c" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} width={35} />
                          <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#ef4444'}} />
                          <ReferenceLine x={`T+${Math.floor(progress/2)}h`} stroke="white" strokeDasharray="3 3" />
                          <Area type="monotone" dataKey="flow" stroke="#ef4444" fill="url(#gradFlow)" strokeWidth={2} name="Discharge Q" />
                      </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-between text-xs text-slate-400 mt-1 px-2">
                      <span>Peak Q: 28,500 m³/s</span>
                      <span className="text-red-400 font-bold">Current: {metrics.discharge.toFixed(0)}</span>
                  </div>
              </div>
          </SciFiCard>

          {/* Impact Parameters */}
          <div className="flex-1 bg-[#1a0505]/80 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <Activity size={16} className="text-red-500"/> 灾害强度指标
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Breach Width</div>
                      <div className="text-2xl font-bold text-white">{(progress * 0.8).toFixed(1)} m</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Velocity Max</div>
                      <div className="text-2xl font-bold text-yellow-400">18.5 m/s</div>
                  </div>
                  <div className="col-span-2 bg-red-900/20 p-3 rounded border border-red-900/50 flex items-center justify-between">
                      <div className="text-xs text-red-200">Flood Wave Height</div>
                      <div className="text-xl font-bold text-white">{metrics.floodDepth.toFixed(1)} m</div>
                  </div>
              </div>
          </div>

      </div>

      {/* 6. RIGHT PANEL: Evacuation Status */}
      <div className={`absolute right-6 top-32 bottom-32 w-96 flex flex-col gap-4 z-20 pointer-events-none transition-transform duration-500 ${simState === 'READY' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
          
          {/* Evacuation Progress */}
          <SciFiCard title="下游疏散进度" subtitle="HUMAN SAFETY" className="border-red-900/50 bg-[#1a0505]/80 pointer-events-auto">
              <div className="flex flex-col gap-4 p-2">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                          <Users size={18} />
                          <span className="text-sm font-bold">Total Evacuated</span>
                      </div>
                      <span className="text-2xl font-mono text-green-400">{metrics.evacuated.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                      <div className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 transition-all duration-300" style={{width: `${metrics.evacuated}%`}}></div>
                  </div>
              </div>
          </SciFiCard>

          {/* Town Status List */}
          <div className="flex-1 bg-[#1a0505]/80 backdrop-blur-md border border-red-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-red-900/30 pb-2">
                  <MapPin size={16} className="text-orange-500"/> 重点区域风险态势
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {TOWN_RISK.map((town, i) => (
                      <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-white">{town.name}</span>
                              <span className="text-xs text-slate-400">{town.dist}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Pop: {town.pop}</span>
                              <span className={`font-bold px-2 py-0.5 rounded ${town.status === 'Evacuating' ? 'bg-yellow-900/40 text-yellow-400 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
                                  {town.status}
                              </span>
                          </div>

                          <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded">
                              <Waves size={12} className="text-blue-400"/>
                              <span className="text-[10px] text-blue-200">Flood Arrival ETA: <span className="font-mono text-white">{town.eta}</span></span>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Broadcast Button */}
              <button className="w-full mt-4 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded flex items-center justify-center gap-2 shadow-lg animate-pulse">
                  <Volume2 size={16}/> BROADCAST EVACUATION ORDER
              </button>
          </div>

      </div>

    </div>
  );
};
