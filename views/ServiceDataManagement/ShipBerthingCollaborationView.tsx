
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipBerthingThreeScene } from '../../components/ServiceDataManagement/ShipBerthing/ThreeScene';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Anchor, Navigation, Radio, Wind, Gauge, 
  ArrowRightLeft, Ship, MapPin, Share2, 
  Activity, ArrowDownToLine, Zap
} from 'lucide-react';

export const ShipBerthingCollaborationView: React.FC = () => {
  const [activeEntity, setActiveEntity] = useState<string>('tug-01');
  
  // Real-time Simulation State
  const [berthingState, setBerthingState] = useState({
    distBow: 125, // meters
    distStern: 132, // meters
    speedTrans: 8.5, // cm/s (transverse speed)
    speedLong: 2.1, // cm/s (longitudinal speed)
    rot: 0.05, // deg/min (Rate of Turn)
    angle: 2.5, // degrees to berth
  });

  const [tugs, setTugs] = useState([
    { id: 'tug-01', name: 'Harbor Tug A', force: 45, angle: 90, status: 'PUSH' },
    { id: 'tug-02', name: 'Harbor Tug B', force: 30, angle: 85, status: 'PULL' }
  ]);

  const [collabLog, setCollabLog] = useState<any[]>([]);
  const [approachTrend, setApproachTrend] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init Trend
    const initTrend = Array.from({length: 30}, (_, i) => ({ t: i, dist: 200 - i * 2 }));
    setApproachTrend(initTrend);

    const interval = setInterval(() => {
      const time = Date.now();
      
      // 1. Berthing Physics (Simplified)
      setBerthingState(prev => ({
          distBow: Math.max(0, prev.distBow - 0.1 - Math.random()*0.05),
          distStern: Math.max(0, prev.distStern - 0.08 - Math.random()*0.05),
          speedTrans: 8.0 + Math.sin(time/1000) * 0.5,
          speedLong: 2.0 + Math.cos(time/1500) * 0.2,
          rot: Math.sin(time/2000) * 0.1,
          angle: prev.angle * 0.99 // Slowly aligning
      }));

      // 2. Tug Updates
      setTugs(prev => prev.map(t => ({
          ...t,
          force: t.force + (Math.random() - 0.5) * 2
      })));

      // 3. Log Generation
      if (Math.random() > 0.7) {
          const sources = ['PILOT', 'TUG-A', 'TUG-B', 'VTS', 'WHARF'];
          const msgs = ['Confirm approach vector', 'Wind gust 12m/s', 'Line 1 tension high', 'Slow down < 5cm/s', 'Ready for lines'];
          const newLog = {
              time: new Date().toLocaleTimeString(),
              source: sources[Math.floor(Math.random() * sources.length)],
              msg: msgs[Math.floor(Math.random() * msgs.length)],
              type: 'info'
          };
          setCollabLog(prev => [newLog, ...prev.slice(0, 6)]);
      }

      // 4. Trend Update
      setApproachTrend(prev => {
          const last = prev[prev.length-1];
          return [...prev.slice(1), { t: last.t + 1, dist: Math.max(0, last.dist - 0.2) }];
      });

    }, 800);

    return () => clearInterval(interval);
  }, []);

  const berthSchedule = [
    { berth: 'B-01', ship: 'MSC GULSUN', status: 'Occupied', progress: 80 },
    { berth: 'B-02', ship: 'COSCO STAR', status: 'Berthing', progress: 15 },
    { berth: 'B-03', ship: '--', status: 'Vacant', progress: 0 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#020617] p-2 overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-transparent border-b border-cyan-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-cyan-600/20 border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Anchor className="text-cyan-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">船舶靠离泊与港口协同服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-400 tracking-[0.2em]">
                 <span className="text-cyan-400 font-bold flex items-center gap-2"><Radio size={12}/> VTS LINK: SECURE</span>
                 <span>|</span>
                 <span>PORT STATUS: YELLOW ALERT (WIND)</span>
                 <span>|</span>
                 <span className="text-orange-400 font-bold">COLLAB DELAY: 12ms</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">In-Port Vessels</div>
              <div className="text-xl font-mono font-black text-white">42</div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Berthing Efficiency</div>
              <div className="text-xl font-mono font-black text-emerald-400">94.5%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Laser & Tugs */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Laser Docking System */}
           <SciFiCard title="激光靠泊导航 (LDS)" subtitle="PRECISION: ±1cm" className="bg-[#081b2e]/60 border-cyan-900/50">
              <div className="flex flex-col gap-4 py-2">
                 <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border-l-4 border-cyan-500">
                    <div>
                       <div className="text-[10px] text-slate-400 uppercase">Bow Distance</div>
                       <div className="text-3xl font-mono font-bold text-white">{berthingState.distBow.toFixed(1)} <span className="text-sm text-slate-500">m</span></div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-400 uppercase">Speed (Trans)</div>
                       <div className="text-xl font-mono font-bold text-cyan-400">{berthingState.speedTrans.toFixed(1)} <span className="text-xs">cm/s</span></div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border-l-4 border-blue-500">
                    <div>
                       <div className="text-[10px] text-slate-400 uppercase">Stern Distance</div>
                       <div className="text-3xl font-mono font-bold text-white">{berthingState.distStern.toFixed(1)} <span className="text-sm text-slate-500">m</span></div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-400 uppercase">Angle</div>
                       <div className="text-xl font-mono font-bold text-orange-400">{berthingState.angle.toFixed(1)}°</div>
                    </div>
                 </div>
              </div>
              
              <div className="mt-2 h-32 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={approachTrend}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="t" hide />
                       <YAxis hide domain={[0, 200]} />
                       <Area type="monotone" dataKey="dist" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Tugboat Telemetry */}
           <SciFiCard title="拖轮作业协同" subtitle="ASSIST UNITS" className="flex-1 border-cyan-900/50">
              <div className="space-y-3">
                 {tugs.map(tug => (
                    <div key={tug.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-200">{tug.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                             tug.status === 'PUSH' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>{tug.status}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex-1">
                             <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Engine Load</span>
                                <span>{tug.force.toFixed(0)}%</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500" style={{width: `${tug.force}%`}}></div>
                             </div>
                          </div>
                          <div className="text-center w-12">
                             <div className="text-[10px] text-slate-500">Angle</div>
                             <div className="text-xs font-mono font-bold text-white">{tug.angle}°</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: 3D Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-cyan-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_50px_rgba(6,182,212,0.1)]">
              {/* HUD: PPU Stream */}
              <div className="absolute top-4 left-4 z-10 w-64 bg-black/70 backdrop-blur border border-cyan-500/30 rounded-lg p-3">
                 <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <Navigation className="text-cyan-400" size={16} />
                    <span className="text-xs font-bold text-white uppercase">Pilot Portable Unit (PPU)</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                    <div>ROT: <span className="text-white">{berthingState.rot.toFixed(3)} °/min</span></div>
                    <div>COG: <span className="text-white">270.5°</span></div>
                    <div>HDG: <span className="text-white">272.1°</span></div>
                    <div>UKC: <span className="text-red-400">1.5m</span></div>
                 </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-1">
                 <div className="bg-orange-600/90 text-white px-3 py-1 rounded text-xs font-bold shadow-lg animate-pulse">
                    APPROACHING BERTH
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">SHIP_ID: COSCO_STAR_992</div>
              </div>

              <ShipBerthingThreeScene 
                 shipDistance={berthingState.distBow / 10} // Scaling for visual
                 shipAngle={berthingState.angle}
                 tugForces={tugs.map(t => ({id: t.id, force: t.force}))}
                 activeEntityId={activeEntity}
                 onEntitySelect={setActiveEntity}
              />
           </div>

           {/* Collaboration Log */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Share2 size={14} /> Multi-Party Data Exchange Bus
                 </div>
                 <div className="text-[9px] text-slate-500 font-mono">PROTOCOL: NMEA-0183 / REST</div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                 {collabLog.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors">
                       <span className="text-slate-600 w-14">[{log.time}]</span>
                       <span className="text-cyan-500 font-bold w-12">{log.source}:</span>
                       <span className="text-slate-300 flex-1">{log.msg}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Planning & Resources */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Berth Schedule */}
           <SciFiCard title="泊位计划看板" subtitle="GANTT VIEW" className="border-cyan-900/50">
              <div className="space-y-4">
                 {berthSchedule.map((b, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-300">{b.berth}</span>
                          <span className="text-slate-500">{b.ship}</span>
                          <span className={`text-[9px] ${b.status === 'Occupied' ? 'text-orange-400' : b.status === 'Berthing' ? 'text-cyan-400' : 'text-green-400'}`}>{b.status}</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                          {b.status !== 'Vacant' && (
                             <div className={`h-full ${b.status === 'Occupied' ? 'bg-orange-600' : 'bg-cyan-600'} absolute left-0`} style={{width: `${b.progress}%`}}></div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           {/* Shore Services */}
           <SciFiCard title="岸基协同服务" className="flex-1 border-cyan-900/50">
              <div className="grid grid-cols-1 gap-3">
                 <div className="flex items-center gap-3 p-2 bg-slate-900 rounded border border-slate-800">
                    <Zap className="text-yellow-400" size={20} />
                    <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase">Shore Power (AMP)</div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-white">Connecting...</span>
                          <span className="text-[10px] text-yellow-500">Est. 15min</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-2 bg-slate-900 rounded border border-slate-800">
                    <ArrowDownToLine className="text-blue-400" size={20} />
                    <div className="flex-1">
                       <div className="text-[10px] text-slate-500 uppercase">Mooring Gang</div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-white">Ready at Bollard 4</span>
                          <span className="text-[10px] text-green-400">On Site</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-900/30 rounded text-center">
                 <div className="text-[10px] text-slate-500 uppercase mb-1">Collaboration Score</div>
                 <div className="text-2xl font-black text-cyan-400">92/100</div>
                 <div className="text-[9px] text-slate-400">Optimal Sync Level</div>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
