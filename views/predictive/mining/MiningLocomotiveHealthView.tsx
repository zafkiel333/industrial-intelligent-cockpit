
import React, { useState, useEffect } from 'react';
import { LocomotiveThreeScene } from '../../../components/predictive/mining-locomotive/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[pm-mining-16]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/pm-mining-16';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  Cell
} from 'recharts';
import { 
  Zap, Activity, Gauge, Thermometer, 
  MapPin, AlertTriangle, BatteryCharging, TrendingUp,
  Cpu, Disc, Radio, Eye, ScanLine, CloudFog
} from 'lucide-react';

// --- Mock Data ---

const CURRENT_SPECTRUM = Array.from({length: 40}, (_, i) => ({
    freq: i * 2.5,
    amp: Math.random() * 5 + (i===20 ? 45 : 0) + (i===10 ? 15 : 0) // 50Hz and harmonics
}));

const SPEED_PROFILE = Array.from({length: 30}, (_, i) => ({
    time: `-${30-i}s`,
    speed: 15 + Math.sin(i*0.2) * 5,
    limit: 25
}));

const WHEEL_WEAR = [
    { subject: '左前轮缘', A: 85, fullMark: 100 },
    { subject: '右前轮缘', A: 90, fullMark: 100 },
    { subject: '左后轮缘', A: 75, fullMark: 100 }, // Worn
    { subject: '右后轮缘', A: 88, fullMark: 100 },
    { subject: '踏面磨耗', A: 82, fullMark: 100 },
    { subject: '轮径差', A: 95, fullMark: 100 },
];

const BATTERY_CELLS = Array.from({length: 16}, (_, i) => ({
    id: i+1,
    volts: 3.2 + Math.random() * 0.1,
    temp: 35 + Math.random() * 5
}));

export const MiningLocomotiveHealthView: React.FC = () => {
  // --- State ---
  const [speed, setSpeed] = useState(15);
  const [motorTemp, setMotorTemp] = useState(65);
  const [brakeTemp, setBrakeTemp] = useState(40);
  const [isSparking, setIsSparking] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'thermal' | 'xray'>('standard');
  const [pantoHeight, setPantoHeight] = useState(0.8);
  const [healthScore, setHealthScore] = useState(92.5);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        const t = Date.now() / 2000;
        const newSpeed = 15 + Math.sin(t) * 5;
        setSpeed(newSpeed);
        
        // Random sparking event
        setIsSparking(Math.random() > 0.9);
        
        // Temp fluctuates with speed/load
        setMotorTemp(65 + (newSpeed/20)*10 + Math.random()*2);
        
        // Brake temp spikes if speed drops fast (simulated)
        const decel = Math.cos(t);
        setBrakeTemp(prev => decel < -0.5 ? Math.min(300, prev + 5) : Math.max(40, prev - 1));

        setPantoHeight(0.8 + Math.sin(t*2)*0.05); // Wire sag

    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] bg-[#020409] text-cyan-50 p-2 overflow-y-auto custom-scrollbar selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-cyan-900/40 pb-4 bg-gradient-to-r from-[#0c1a2e] to-transparent px-4">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <Zap size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-widest font-bold">
                    <Activity size={14} /> Underground Traction Monitoring
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
                    矿用电机车 <span className="text-cyan-500 font-extrabold">整车健康状态评估</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-10 items-center">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">车辆编号 (Fleet ID)</div>
                <div className="text-2xl font-mono font-bold text-white">LOC-804</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">综合健康指数 (GHI)</div>
                <div className={`text-4xl font-mono font-bold ${healthScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {healthScore.toFixed(1)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-8">
                <div className="text-[10px] text-slate-500 uppercase font-bold text-orange-400">当前位置</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white font-mono">
                    <MapPin size={20} className="text-orange-500" /> K12+450
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Power & Traction */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Traction Motor FFT */}
           <SciFiCard title="牵引电机电流频谱 (MCSA)" subtitle="ROTOR HEALTH" className="flex-1 border-cyan-900/50 bg-[#060810]/80">
               <div className="h-full flex flex-col">
                   <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={CURRENT_SPECTRUM}>
                               <defs>
                                   <linearGradient id="colorAmp" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="freq" stroke="#64748b" tick={{fontSize: 9}} />
                               <YAxis hide />
                               <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                               <Area type="monotone" dataKey="amp" stroke="#0ea5e9" fill="url(#colorAmp)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-400">
                       检测到 <span className="text-cyan-400 font-bold">50Hz</span> 基频边带正常，无断条特征。
                   </div>
               </div>
           </SciFiCard>

           {/* Battery/Pantograph Status */}
           <SciFiCard title="动力源状态监测" subtitle="BATTERY / PANTO" className="h-[280px] border-cyan-900/50">
               <div className="flex flex-col gap-4 h-full">
                   {/* Pantograph Status */}
                   <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Zap size={16} className={isSparking ? "text-yellow-400 animate-pulse" : "text-slate-500"} />
                           <div>
                               <div className="text-xs text-slate-300 font-bold">受电弓接触</div>
                               <div className="text-[10px] text-slate-500">{isSparking ? 'Arcing Detected' : 'Stable'}</div>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-lg font-mono text-white">560 <span className="text-xs">V</span></div>
                       </div>
                   </div>

                   {/* Battery Cells Heatmap */}
                   <div className="flex-1">
                       <div className="text-[10px] text-slate-500 mb-1">电池模组电压/温度分布</div>
                       <div className="grid grid-cols-4 gap-1">
                           {BATTERY_CELLS.map(cell => (
                               <div key={cell.id} className="bg-slate-800 p-1 rounded text-center" title={`Cell ${cell.id}`}>
                                   <div className={`text-[9px] font-bold ${cell.volts < 3.1 ? 'text-red-400' : 'text-green-400'}`}>
                                       {cell.volts.toFixed(1)}V
                                   </div>
                                   <div className="w-full h-1 bg-slate-700 mt-1 rounded-full overflow-hidden">
                                       <div 
                                         className="h-full bg-cyan-500" 
                                         style={{width: `${Math.min(100, (cell.temp-20)/40*100)}%`}}
                                       ></div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

        {/* CENTER: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* 3D Container */}
           <div className="flex-1 min-h-[450px] bg-[#010205] border border-cyan-800/40 relative rounded-xl overflow-hidden shadow-[inset_0_0_100px_rgba(56,189,248,0.15)] group">
               
               {/* Controls */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <button onClick={() => setViewMode('standard')} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${viewMode === 'standard' ? 'bg-cyan-600 text-black' : 'bg-black/50 text-cyan-400 border-cyan-800'}`}>
                       Standard
                   </button>
                   <button onClick={() => setViewMode('thermal')} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${viewMode === 'thermal' ? 'bg-orange-600 text-black' : 'bg-black/50 text-orange-400 border-orange-800'}`}>
                       Thermal
                   </button>
                   <button onClick={() => setViewMode('xray')} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${viewMode === 'xray' ? 'bg-purple-600 text-white' : 'bg-black/50 text-purple-400 border-purple-800'}`}>
                       X-Ray
                   </button>
               </div>

               {/* Right HUD */}
               <div className="absolute top-4 right-4 z-10 text-right space-y-2">
                   <div className="bg-black/60 backdrop-blur px-3 py-2 rounded border border-cyan-500/20">
                       <div className="text-[10px] text-slate-400 uppercase">Speed</div>
                       <div className="text-3xl font-mono font-bold text-white">{speed.toFixed(1)} <span className="text-xs">km/h</span></div>
                   </div>
                   {isSparking && (
                       <div className="bg-red-900/80 backdrop-blur px-3 py-1 rounded border border-red-500 text-white text-xs font-bold animate-pulse flex items-center gap-2">
                           <AlertTriangle size={14} /> ARCING ALERT
                       </div>
                   )}
               </div>

               {/* Bottom HUD */}
               <div className="absolute bottom-6 left-6 z-10 flex gap-4 text-[10px] font-mono text-cyan-300">
                    <div>MOTOR_TEMP: {motorTemp.toFixed(1)}°C</div>
                    <div>BRAKE_TEMP: {brakeTemp.toFixed(1)}°C</div>
               </div>

               <LocomotiveThreeScene 
                   speed={speed}
                   pantographHeight={pantoHeight}
                   isSparking={isSparking}
                   brakeTemp={brakeTemp}
                   motorTemp={motorTemp}
                   viewMode={viewMode}
                   trackCurvature={0}
               />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Speed Profile */}
           <SciFiCard title="运行速度曲线" subtitle="REAL-TIME" className="h-[220px] border-cyan-900/50" noPadding>
               <div className="w-full h-full p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SPEED_PROFILE}>
                           <defs>
                               <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                           <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 9}} />
                           <YAxis stroke="#64748b" tick={{fontSize: 9}} domain={[0, 40]} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#0ea5e9'}} />
                           <ReferenceLine y={25} stroke="red" strokeDasharray="3 3" label={{value:'Limit', fill:'red', fontSize:10}} />
                           <Area type="monotone" dataKey="speed" stroke="#0ea5e9" fill="url(#speedGrad)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </SciFiCard>

        </div>

        {/* RIGHT: Running Gear & Safety */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Wheel Wear Radar */}
           <SciFiCard title="轮对磨损画像" subtitle="WHEEL PROFILE" className="h-[320px] border-cyan-900/50">
               <div className="w-full h-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={WHEEL_WEAR}>
                           <PolarGrid stroke="#1e293b" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Wear Health" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                           <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#f59e0b'}} />
                       </RadarChart>
                   </ResponsiveContainer>
                   <div className="text-center text-[10px] text-slate-500 -mt-4">
                       需关注: <span className="text-yellow-400 font-bold">左后轮缘</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Environment & Gas */}
           <SciFiCard title="车载环境感知" subtitle="SENSORS" className="flex-1 border-cyan-900/50">
               <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <CloudFog size={16} className="text-green-400" />
                           <span className="text-xs text-slate-300">瓦斯浓度 (CH4)</span>
                       </div>
                       <span className="font-mono text-white font-bold">0.12 %</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                       <div className="flex items-center gap-2">
                           <Thermometer size={16} className="text-orange-400" />
                           <span className="text-xs text-slate-300">环境温度</span>
                       </div>
                       <span className="font-mono text-white font-bold">28.5 °C</span>
                   </div>
                   
                   <div className="mt-2 pt-2 border-t border-slate-800">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                           <ScanLine size={12} /> 前方障碍物检测
                       </div>
                       <div className="w-full bg-green-900/20 border border-green-500/30 p-2 rounded text-center text-green-400 text-xs font-mono">
                           PATH CLEAR
                       </div>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
