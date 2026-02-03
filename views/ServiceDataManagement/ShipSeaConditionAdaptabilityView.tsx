
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShipSeaConditionThreeScene } from '../../components/ServiceDataManagement/ShipSeaCondition/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import { 
  Waves, Anchor, Activity, AlertTriangle, Wind, 
  Compass, Gauge, ShieldCheck, Zap, Crosshair, ArrowDown, Database
} from 'lucide-react';

export const ShipSeaConditionAdaptabilityView: React.FC = () => {
  const [activeEquipment, setActiveEquipment] = useState<string>('radar-mast');
  
  // Real-time Simulation State
  const [seaState, setSeaState] = useState({
    hs: 4.2, // Significant Wave Height (m)
    tp: 8.5, // Peak Period (s)
    dir: 315, // Wave Direction
    ssLevel: 5 // Sea State Code
  });

  const [motion, setMotion] = useState({
    roll: 0,
    pitch: 0,
    heave: 0,
    surge: 0,
    sway: 0,
    yaw: 0
  });

  const [waveSpectrum, setWaveSpectrum] = useState<any[]>([]);
  const [responseHistory, setResponseHistory] = useState<any[]>([]);

  // Equipment Status Data
  const equipmentStatus: Record<string, any> = {
    'radar-mast': { name: '导航雷达桅杆', limitRoll: 15, limitAccel: 2.0, currentAccel: 0.8, health: 98 },
    'deck-crane': { name: '甲板克令吊', limitRoll: 8, limitAccel: 1.2, currentAccel: 0.4, health: 92 },
    'main-engine': { name: '主机底座', limitRoll: 25, limitAccel: 3.5, currentAccel: 0.2, health: 100 },
    'bow-thruster': { name: '艏侧推器', limitRoll: 30, limitAccel: 4.0, currentAccel: 1.1, health: 95 },
  };

  // Simulation Loop
  useEffect(() => {
    // Init Wave Spectrum (JONSWAP approx)
    const spectrum = [];
    for(let f=0.05; f<0.3; f+=0.01) {
        const s = 1 / Math.pow(f, 5) * Math.exp(-1.25 * Math.pow(0.1/f, 4));
        spectrum.push({ freq: f.toFixed(2), energy: s * 10 });
    }
    setWaveSpectrum(spectrum);

    // Init Response History
    const history = Array.from({length: 40}, (_, i) => ({ time: i, roll: 0, pitch: 0 }));
    setResponseHistory(history);

    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      
      // 1. Simulate Complex Motion (Superposition of sines)
      // Roll is typically larger period
      const newRoll = Math.sin(t * 0.8) * 8 + Math.sin(t * 0.3) * 2 + (Math.random()-0.5)*0.5;
      // Pitch is faster, smaller amplitude
      const newPitch = Math.sin(t * 1.2) * 3 + Math.cos(t * 0.5) * 1;
      // Heave vertical motion
      const newHeave = Math.sin(t * 1.0) * 1.5;

      setMotion({
          roll: newRoll,
          pitch: newPitch,
          heave: newHeave,
          surge: Math.sin(t * 0.5) * 0.5,
          sway: Math.cos(t * 0.4) * 0.8,
          yaw: Math.sin(t * 0.2) * 1.0
      });

      // 2. Update Sea State (Drifting)
      setSeaState(prev => ({
          ...prev,
          hs: 4.0 + Math.sin(t * 0.1) * 0.5 + (Math.random()-0.5)*0.1,
          tp: 8.5 + (Math.random()-0.5)*0.1
      }));

      // 3. Update Equipment Accelerations (Simplified Physics)
      // Tangential Accel = r * angular_accel + ... approx by amplitude
      Object.keys(equipmentStatus).forEach(key => {
          const item = equipmentStatus[key];
          // Rough approximation: more roll = more accel on mast/crane
          const baseAccel = (Math.abs(newRoll) / 10) * (key === 'radar-mast' ? 1.5 : 0.8);
          item.currentAccel = baseAccel + Math.random() * 0.1;
      });

      // 4. Update History
      setResponseHistory(prev => {
          const lastTime = prev[prev.length - 1].time;
          return [...prev.slice(1), { time: lastTime + 1, roll: Math.abs(newRoll), pitch: Math.abs(newPitch) }];
      });

    }, 100); // 60 FPS update logic ideally, using 100ms for React state safety

    return () => clearInterval(interval);
  }, []);

  const motionRadar = [
    { subject: '横摇 (Roll)', A: Math.abs(motion.roll), fullMark: 15 },
    { subject: '纵摇 (Pitch)', A: Math.abs(motion.pitch), fullMark: 10 },
    { subject: '垂荡 (Heave)', A: Math.abs(motion.heave) * 2, fullMark: 10 }, // Scale for vis
    { subject: '横荡 (Sway)', A: Math.abs(motion.sway) * 2, fullMark: 5 },
    { subject: '纵荡 (Surge)', A: Math.abs(motion.surge) * 2, fullMark: 5 },
    { subject: '首摇 (Yaw)', A: Math.abs(motion.yaw), fullMark: 5 },
  ];

  return (
    <div className="flex flex-col h-full gap-4 font-[Rajdhani] text-slate-100 bg-[#0b1121] p-2 overflow-hidden select-none">
      
      {/* HEADER: Storm Warning Style */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/40 via-slate-900/60 to-transparent border-b border-red-500/30 rounded-t-xl">
        <div className="flex items-center gap-5">
           <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
              <Waves className="text-red-400" size={30} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">船舶设备复杂海况适应性服务数据管理</h1>
              <div className="flex items-center gap-4 mt-1 text-[10px] font-mono text-slate-400 tracking-[0.2em]">
                 <span className="text-red-400 font-bold flex items-center gap-2"><AlertTriangle size={12}/> 海况等级: SS-{Math.round(seaState.ssLevel)} (ROUGH)</span>
                 <span>|</span>
                 <span>有义波高 (Hs): {seaState.hs.toFixed(2)} m</span>
                 <span>|</span>
                 <span>波浪周期 (Tp): {seaState.tp.toFixed(1)} s</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">综合适航指数</div>
              <div className="text-xl font-mono font-black text-amber-400">82.4 <span className="text-xs text-slate-600">/ 100</span></div>
           </div>
           <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-right min-w-[140px]">
              <div className="text-[9px] text-slate-500 uppercase font-bold">砰击概率 (Slamming)</div>
              <div className="text-xl font-mono font-black text-red-500">12.5%</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Environment & Response */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           {/* Wave Spectrum */}
           <SciFiCard title="实时波浪能量谱" subtitle="ENERGY DENSITY" className="bg-[#0f172a]/60 border-slate-700">
              <div className="h-44 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waveSpectrum}>
                       <defs>
                          <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 9}} interval={5} label={{ value: 'Freq (Hz)', position: 'insideBottom', offset: -5, fontSize: 9, fill: '#64748b' }} />
                       <YAxis hide />
                       <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #38bdf8', fontSize: '10px'}} />
                       <Area type="monotone" dataKey="energy" stroke="#38bdf8" fill="url(#colorWave)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono bg-slate-900/50 p-2 rounded">
                 <span>Dominant Dir: {seaState.dir}°</span>
                 <span>Spectral Width: 0.45</span>
              </div>
           </SciFiCard>

           {/* 6-DOF Motion */}
           <SciFiCard title="船体六自由度响应 (RAO)" subtitle="6-DOF MONITOR" className="flex-1">
              <div className="h-full flex flex-col items-center justify-center">
                 <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="75%" data={motionRadar}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Motion" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-3 gap-2 w-full mt-2">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500">Roll (Max)</div>
                       <div className="text-sm font-bold text-amber-400">12.5°</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500">Pitch (Max)</div>
                       <div className="text-sm font-bold text-white">4.2°</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[9px] text-slate-500">Heave (Max)</div>
                       <div className="text-sm font-bold text-blue-400">3.8m</div>
                    </div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
           <div className="flex-1 bg-gradient-to-b from-[#111827] to-[#020617] border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_50px_rgba(30,58,138,0.2)]">
              {/* Rain/Storm Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none z-0 opacity-20" 
                   style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/diagmonds-light.png")'}}></div>
              
              {/* HUD: Equipment Detail */}
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-64">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                       <Crosshair className="text-cyan-400" size={18} />
                       <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Target Equipment</div>
                          <div className="text-sm font-black text-white uppercase">{equipmentStatus[activeEquipment]?.name}</div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">G-Force Load</span>
                          <span className={`${equipmentStatus[activeEquipment]?.currentAccel > 1.0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'} font-mono font-bold`}>
                             {equipmentStatus[activeEquipment]?.currentAccel.toFixed(2)} g
                          </span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-red-500" 
                               style={{width: `${(equipmentStatus[activeEquipment]?.currentAccel / 2.0) * 100}%`}}></div>
                       </div>
                       <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                          <span>Limit: {equipmentStatus[activeEquipment]?.limitAccel}g</span>
                          <span>Health: {equipmentStatus[activeEquipment]?.health}%</span>
                       </div>
                    </div>
                 </div>
              </div>

              <ShipSeaConditionThreeScene 
                 waveHeight={seaState.hs} 
                 wavePeriod={seaState.tp} 
                 shipMotion={motion}
                 activeNodeId={activeEquipment}
                 onNodeSelect={setActiveEquipment}
              />

              <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/40 px-4 py-2 rounded-lg backdrop-blur">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                    <span className="text-xs font-bold text-red-100 uppercase">Storm Alert: Active</span>
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">SIMULATION_TIME: {(Date.now()/1000).toFixed(2)}</div>
              </div>
           </div>

           {/* Motion Trend */}
           <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Activity size={14} /> Motion Trend (Roll / Pitch)
                 </div>
              </div>
              <div className="flex-1 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseHistory}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis hide domain={[0, 15]} />
                       <Tooltip contentStyle={{backgroundColor: '#0c0a09', border: 'none', fontSize: '10px'}} />
                       <Line type="monotone" dataKey="roll" stroke="#f59e0b" strokeWidth={2} dot={false} />
                       <Line type="monotone" dataKey="pitch" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Adaptability & Control */}
        <div className="w-full lg:w-[26%] flex flex-col gap-4">
           <SciFiCard title="关键设备适航性矩阵" subtitle="ADAPTABILITY" className="flex-1">
              <div className="space-y-4">
                 {Object.entries(equipmentStatus).map(([key, item]) => (
                    <div 
                       key={key} 
                       onClick={() => setActiveEquipment(key)}
                       className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          activeEquipment === key ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                       }`}
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-200">{item.name}</span>
                          <span className={`text-[9px] px-1.5 rounded font-bold ${
                             item.currentAccel > item.limitAccel * 0.8 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>{item.currentAccel > item.limitAccel * 0.8 ? 'STRESS' : 'OK'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                             <div className={`h-full ${item.currentAccel > item.limitAccel * 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                  style={{width: `${Math.min(100, (item.currentAccel / item.limitAccel) * 100)}%`}}></div>
                          </div>
                          <span className="font-mono">{Math.round((item.currentAccel / item.limitAccel) * 100)}% Load</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="主动减摇补偿系统" subtitle="STABILIZERS">
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Fin Stabilizer</div>
                    <div className="text-green-400 font-bold text-xs mt-1">ACTIVE (85%)</div>
                 </div>
                 <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Anti-Roll Tank</div>
                    <div className="text-blue-400 font-bold text-xs mt-1">FILLING</div>
                 </div>
              </div>
              
              <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                 <div className="flex items-center gap-3">
                    <Zap className="text-yellow-500" size={18} />
                    <div>
                       <div className="text-[10px] font-bold text-slate-300 uppercase">减摇效能评估</div>
                       <div className="text-[9px] text-slate-500 mt-1">
                          当前海况下横摇幅度降低 <span className="text-emerald-400 font-bold">62%</span>，有效保障雷达锁定精度。
                       </div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="服务数据包快照" className="bg-slate-900/30 border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                 <div className="flex items-center gap-2">
                    <Database size={14} className="text-slate-500" /> 
                    <span>Log ID: #SEA-9902</span>
                 </div>
                 <button className="text-blue-400 hover:text-white transition-colors">
                    <ArrowDown size={14} /> Download
                 </button>
              </div>
           </SciFiCard>
        </div>

      </div>
    </div>
  );
};
