
import React, { useState, useEffect } from 'react';
import { TransmissionThreeScene } from '../../../components/predictive/mining-transmission/ThreeScene';
import { ClutchStatus } from '../../../components/predictive/mining-transmission/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Settings, Activity, Thermometer, AlertTriangle, 
  TrendingUp, Gauge, Layers, 
  Binary, Zap, FileText, CheckCircle2,
  Disc, Crosshair, ArrowRight
} from 'lucide-react';

// --- Mock Data ---

// Shift Quality Curve (Pressure vs Time during a shift)
const SHIFT_CURVE = Array.from({length: 50}, (_, i) => {
    const t = i * 0.05; // seconds
    // Typical clutch fill -> hold -> ramp -> lock pattern
    let p = 0;
    if (t < 0.2) p = t * 10; // Fill
    else if (t < 0.5) p = 2; // Kiss point
    else if (t < 1.5) p = 2 + (t-0.5)*15; // Ramp up
    else p = 20; // Lock
    
    // Add anomaly (slip or spike)
    const anomaly = t > 0.8 && t < 1.2 ? Math.random() * 2 : 0;
    
    return { time: t.toFixed(2), pressure: p + anomaly, ideal: p };
});

const VIBRATION_SPECTRUM = [
    { freq: '1X', val: 2.5, label: 'Input' },
    { freq: '2X', val: 0.8, label: 'Harmonic' },
    { freq: 'GMF1', val: 5.2, label: 'Gear Mesh 1' }, // High -> Wear
    { freq: 'GMF2', val: 1.5, label: 'Gear Mesh 2' },
    { freq: 'Brg', val: 0.4, label: 'Bearing' },
];

const OIL_PARTICLES = Array.from({length: 12}, (_, i) => ({
    week: `W${i+1}`,
    fe: 20 + i * 5 + Math.random()*10,
    cu: 5 + i * 2,
    limit: 100
}));

const CLUTCH_HEALTH_RADAR = [
    { subject: 'K1 Fwd', A: 85, fullMark: 100 },
    { subject: 'K2 High', A: 62, fullMark: 100 },
    { subject: 'KR Rev', A: 95, fullMark: 100 },
    { subject: 'KL Lock', A: 45, fullMark: 100 },
    { subject: 'KV Var', A: 88, fullMark: 100 },
];

export const MiningTransmissionHealthView: React.FC = () => {
  // --- State ---
  const [gear, setGear] = useState(1);
  const [rpm, setRpm] = useState(1200);
  const [outputRpm, setOutputRpm] = useState(0);
  const [viewMode, setViewMode] = useState<'solid' | 'transparent' | 'thermal'>('transparent');
  const [clutches, setClutches] = useState<ClutchStatus[]>([
      { id: 'K1', name: 'Low Range', pressure: 0, isEngaged: false, wear: 15, temp: 85 },
      { id: 'K2', name: 'High Range', pressure: 0, isEngaged: false, wear: 38, temp: 82 },
      { id: 'KL', name: 'Lockup', pressure: 0, isEngaged: false, wear: 55, temp: 95 },
  ]);

  const [shiftQuality, setShiftQuality] = useState(92.5);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 2000;
        
        // Sim Engine RPM
        const targetRpm = 1800 + Math.sin(t) * 200;
        setRpm(prev => prev + (targetRpm - prev) * 0.1);

        // Gear Logic (Auto Shift Sim)
        const gearRatio = [3.5, 2.8, 2.0, 1.5, 1.0, 0.8]; // 1st to 6th
        const currentRatio = gearRatio[gear - 1];
        setOutputRpm(rpm / currentRatio);

        // Clutch Logic
        setClutches(prev => prev.map((c, i) => {
            // Simplified: Gear 1 uses K1, Gear 2 uses K2, etc.
            // Just for visual effect
            const isActive = (i === 0 && gear <= 2) || (i === 1 && gear > 2) || (i === 2 && rpm > 1600);
            
            return {
                ...c,
                isEngaged: isActive,
                pressure: isActive ? 22 + Math.random() : 0.5,
                temp: c.temp + (isActive ? 0.1 : -0.05) + (Math.random()-0.5)*0.2
            };
        }));
        
        // Random shift event
        if (Math.random() > 0.98) {
            setGear(prev => prev >= 6 ? 1 : prev + 1);
            setShiftQuality(85 + Math.random() * 10);
        }

    }, 100);
    return () => clearInterval(interval);
  }, [gear, rpm]);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#0c0500] text-amber-50 p-2 overflow-y-auto custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-amber-900/40 pb-4 bg-gradient-to-r from-[#291b00] to-transparent px-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Settings size={14} className="animate-spin-slow" />
             Powertrain Prognostics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             矿卡变速箱 <span className="text-amber-500">与传动系统劣化预测</span>
          </h1>
        </div>
        
        <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Current Gear</div>
                <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                    {gear} <span className="text-sm text-slate-500 font-normal bg-slate-800 px-1 rounded">FWD</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase">Shift Quality Index</div>
                <div className={`text-2xl font-mono font-bold ${shiftQuality < 90 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {shiftQuality.toFixed(1)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-6">
                <div className="text-[10px] text-slate-500 uppercase">Torque Conv. Eff</div>
                <div className="text-2xl font-mono font-bold text-amber-400">
                    {clutches[2].isEngaged ? 'LOCKED' : '88.2%'}
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Control Logic & Shift Analysis */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Solenoid/Clutch Status Matrix */}
           <SciFiCard title="离合器与电磁阀状态" subtitle="ECMV STATUS" className="border-amber-900/50 bg-[#160b00]/80">
               <div className="flex flex-col gap-3 py-2">
                   {clutches.map((c, i) => (
                       <div key={i} className={`p-2 rounded border flex justify-between items-center transition-all ${c.isEngaged ? 'bg-amber-900/30 border-amber-500' : 'bg-slate-900/40 border-slate-800'}`}>
                           <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-200">{c.name}</span>
                               <span className="text-[9px] text-slate-500">ID: {c.id}</span>
                           </div>
                           <div className="text-right">
                               <div className="text-sm font-mono font-bold text-white">{c.pressure.toFixed(1)} <span className="text-[9px] text-slate-500">bar</span></div>
                               <div className={`text-[9px] ${c.temp > 100 ? 'text-red-500' : 'text-green-400'}`}>{c.temp.toFixed(1)}°C</div>
                           </div>
                           <div className={`w-2 h-full absolute left-0 top-0 bottom-0 ${c.isEngaged ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                       </div>
                   ))}
               </div>
           </SciFiCard>

           {/* Shift Profile Chart */}
           <SciFiCard title="换挡压力响应曲线" subtitle="SHIFT QUALITY" className="flex-1 border-amber-900/50">
               <div className="w-full h-full p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SHIFT_CURVE}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="time" stroke="#78350f" tick={{fontSize: 9}} hide />
                           <YAxis stroke="#78350f" tick={{fontSize: 9}} label={{value: 'Pressure', angle: -90, position: 'insideLeft', fontSize: 9}}/>
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Area type="monotone" dataKey="pressure" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} name="Actual" />
                           <Line type="monotone" dataKey="ideal" stroke="#78350f" strokeDasharray="3 3" dot={false} name="Ideal" />
                       </AreaChart>
                   </ResponsiveContainer>
                   <div className="mt-2 p-2 bg-amber-900/10 border border-amber-900/30 rounded text-[10px] text-amber-200">
                       <Activity size={10} className="inline mr-1"/>
                       检测到 K2 离合器结合末端压力超调，可能导致换挡冲击。
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Viewport */}
           <div className="flex-1 min-h-[400px] bg-[#050200] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.1)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button 
                     onClick={() => setViewMode('solid')} 
                     className={`px-3 py-1 text-xs border rounded transition-colors ${viewMode === 'solid' ? 'bg-amber-600 text-white' : 'bg-black/50 text-slate-400'}`}
                   >
                       SOLID
                   </button>
                   <button 
                     onClick={() => setViewMode('transparent')} 
                     className={`px-3 py-1 text-xs border rounded transition-colors ${viewMode === 'transparent' ? 'bg-amber-600 text-white' : 'bg-black/50 text-slate-400'}`}
                   >
                       X-RAY
                   </button>
                   <button 
                     onClick={() => setViewMode('thermal')} 
                     className={`px-3 py-1 text-xs border rounded transition-colors ${viewMode === 'thermal' ? 'bg-amber-600 text-white' : 'bg-black/50 text-slate-400'}`}
                   >
                       THERMAL
                   </button>
               </div>

               {/* Speed HUD */}
               <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                   <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-700">
                       <span className="text-[10px] text-slate-400">INPUT RPM</span>
                       <span className="font-mono font-bold text-white">{rpm.toFixed(0)}</span>
                   </div>
                   <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-slate-700">
                       <span className="text-[10px] text-slate-400">OUTPUT RPM</span>
                       <span className="font-mono font-bold text-amber-400">{outputRpm.toFixed(0)}</span>
                   </div>
               </div>

               <TransmissionThreeScene 
                   inputRpm={rpm}
                   outputRpm={outputRpm}
                   currentGear={gear}
                   clutches={clutches}
                   oilTemp={85}
                   vibrationLevel={0.2}
                   viewMode={viewMode}
               />
           </div>

           {/* Vibration Spectrum */}
           <SciFiCard title="齿轮啮合频率分析 (GMF FFT)" subtitle="VIBRATION" className="h-[250px] border-amber-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={VIBRATION_SPECTRUM}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" vertical={false} />
                           <XAxis dataKey="freq" stroke="#78350f" tick={{fontSize: 10}} />
                           <YAxis stroke="#78350f" tick={{fontSize: 10}} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                           <Bar dataKey="val" fill="#f59e0b" barSize={30} radius={[4, 4, 0, 0]}>
                               {VIBRATION_SPECTRUM.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.val > 4 ? '#ef4444' : '#f59e0b'} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-center text-slate-500 mt-1">
                       Alert: High GMF1 amplitude indicating potential tooth pitting on Sun Gear 1.
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Oil & Lifespan */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Oil Degradation */}
           <SciFiCard title="传动油液劣化趋势" subtitle="Fe & Cu CONTENT" className="h-[280px] border-amber-900/50">
               <div className="w-full h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={OIL_PARTICLES}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c0a" />
                               <XAxis dataKey="week" stroke="#78350f" tick={{fontSize: 10}} />
                               <YAxis stroke="#78350f" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Line type="monotone" dataKey="fe" stroke="#ef4444" strokeWidth={2} dot={false} name="Iron (ppm)" />
                               <Line type="monotone" dataKey="cu" stroke="#f59e0b" strokeWidth={2} dot={false} name="Copper (ppm)" />
                               <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" label="Limit" />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </SciFiCard>

           {/* Clutch Pack RUL (Radar) */}
           <SciFiCard title="离合器片剩余寿命 (RUL)" className="flex-1 border-amber-900/50">
               <div className="w-full h-full min-h-[150px]">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="65%" data={CLUTCH_HEALTH_RADAR}>
                           <PolarGrid stroke="#331c0a" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#d97706', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Health" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.4} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   
                   <div className="mt-2 p-3 bg-red-900/20 border border-red-900/40 rounded flex items-start gap-2">
                       <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                       <div>
                           <div className="text-xs font-bold text-red-300">Lockup Clutch Worn</div>
                           <p className="text-[10px] text-slate-400 mt-1">
                               KL 摩擦片磨损严重 (45%)，预计剩余寿命 &lt; 500h。建议下次保养时更换。
                           </p>
                       </div>
                   </div>
                   
                   <button className="w-full mt-2 py-2 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-500/50 rounded text-xs text-amber-100 font-bold transition-all flex items-center justify-center gap-2">
                       <FileText size={14} /> 生成维修建议书
                   </button>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
