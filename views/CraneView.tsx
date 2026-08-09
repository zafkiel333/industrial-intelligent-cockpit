import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[eq-9]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/eq-9';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  ArrowUp, Move, Wind, Anchor, Box, Settings, 
  AlertTriangle, Crosshair, Scale 
} from 'lucide-react';

export const CraneView: React.FC = () => {
  // --- STATE ---
  const [loadMetrics, setLoadMetrics] = useState({
    currentLoad: 32.5, // tons
    maxLoad: 40.0, // tons (SWL)
    loadPercent: 81.2, // %
    moment: 85, // %
    windSpeed: 4.5, // m/s
    hoistSpeed: 0.8, // m/s
  });

  const [position, setPosition] = useState({
    x: 12.4, // Trolley
    y: 15.2, // Hoist Height
    z: 45.1, // Gantry Travel
  });

  const [motorHealth, setMotorHealth] = useState([
    { id: 'Hoist', temp: 65, vib: 1.2, status: 'normal' },
    { id: 'Trolley', temp: 58, vib: 0.8, status: 'normal' },
    { id: 'Gantry', temp: 62, vib: 0.9, status: 'normal' },
  ]);

  const [loadHistory, setLoadHistory] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    // Init History
    const initHist = Array.from({length: 20}, (_, i) => ({
        time: i,
        load: 20 + Math.random() * 15
    }));
    setLoadHistory(initHist);

    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      
      // 1. Load Dynamics
      setLoadMetrics(prev => ({
        currentLoad: 30 + Math.sin(time * 0.2) * 5 + (Math.random() - 0.5),
        maxLoad: 40.0,
        loadPercent: ((30 + Math.sin(time * 0.2) * 5) / 40) * 100,
        moment: 80 + Math.sin(time * 0.2) * 10,
        windSpeed: Math.max(0, 4.5 + (Math.random() - 0.5) * 2),
        hoistSpeed: Math.abs(Math.sin(time)) * 1.5
      }));

      // 2. Position Updates
      setPosition(prev => ({
        x: 10 + Math.sin(time * 0.5) * 5,
        y: 15 + Math.cos(time * 0.3) * 5,
        z: prev.z + 0.1
      }));

      // 3. Motor Health
      setMotorHealth(prev => prev.map(m => ({
          ...m,
          temp: m.temp + (Math.random() - 0.5) * 0.5,
          vib: m.vib + (Math.random() - 0.5) * 0.05
      })));

      // 4. Update History
      setLoadHistory(prev => {
         const lastTime = prev[prev.length - 1].time;
         const newLoad = 30 + Math.sin(time * 0.2) * 5 + (Math.random() - 0.5);
         return [...prev.slice(1), { time: lastTime + 1, load: newLoad }];
      });

    }, 800);

    return () => clearInterval(interval);
  }, []);

  const radialData = [
    { name: 'Safety Margin', uv: 100 - loadMetrics.moment, fill: '#10b981' },
    { name: 'Used Capacity', uv: loadMetrics.moment, fill: '#facc15' }
  ];

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani] text-yellow-50 selection:bg-yellow-500/30">
      
      {/* HEADER: Industrial Theme */}
      <div className="flex items-end justify-between border-b border-yellow-600/30 pb-4 bg-gradient-to-r from-yellow-950/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-1 uppercase tracking-wider">
             <Box size={12} className="animate-pulse" />
             HEAVY LIFTING OPERATIONS
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="text-yellow-500 text-shadow-glow">起重设备</span> 智能运维平台
             <span className="text-xl text-slate-500 font-light border border-slate-700 px-2 rounded">CRANE-X09</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Current Load</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{loadMetrics.currentLoad.toFixed(1)} <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-yellow-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Load Moment</div>
                <div className={`text-2xl font-mono font-bold ${loadMetrics.moment > 90 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {loadMetrics.moment.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-yellow-900/40 pl-6">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">Wind Speed</div>
                <div className="text-2xl font-mono font-bold text-cyan-300">{loadMetrics.windSpeed.toFixed(1)} <span className="text-sm text-slate-500">m/s</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Load Safety */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* LMI (Load Moment Indicator) */}
           <SciFiCard title="力矩限制器 (LMI)" subtitle="SAFETY MONITOR" className="border-yellow-900/50 bg-[#161202]/60">
              <div className="flex flex-col items-center justify-center p-4">
                  <div className="h-40 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" 
                          barSize={20} data={radialData} startAngle={180} endAngle={0}
                        >
                          <RadialBar background dataKey="uv" cornerRadius={5} />
                          <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-bold font-mono">
                            {loadMetrics.moment.toFixed(0)}%
                          </text>
                          <text x="50%" y="90%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-xs uppercase">
                            Rated Capacity
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full mt-4 flex justify-between px-2 text-xs">
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">Radius</span>
                          <span className="text-white font-bold font-mono">{position.x.toFixed(1)}m</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">Angle</span>
                          <span className="text-white font-bold font-mono">0°</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-slate-500">SWL</span>
                          <span className="text-green-400 font-bold font-mono">{loadMetrics.maxLoad}t</span>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Wind & Anti-Collision */}
           <SciFiCard title="环境与防撞系统" className="flex-1 border-yellow-900/50">
              <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-slate-700">
                      <Wind size={24} className={loadMetrics.windSpeed > 10 ? 'text-red-500' : 'text-cyan-400'} />
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400 font-bold">ANEMOMETER</span>
                              <span className="text-xs text-slate-500">Limit: 15m/s</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${loadMetrics.windSpeed > 10 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${(loadMetrics.windSpeed/20)*100}%`}}></div>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-slate-700">
                      <div className="flex items-center gap-2">
                          <AlertTriangle className="text-yellow-500" />
                          <span className="text-xs text-slate-300">Anti-Collision Radar</span>
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded">CLEAR</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Trolley Limit</div>
                          <div className="text-green-400 text-xs">OK</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 text-center rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500">Hoist Limit</div>
                          <div className="text-green-400 text-xs">OK</div>
                      </div>
                  </div>
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5 relative">
           
           {/* Main 3D Container */}
           <div className="flex-1 min-h-[350px] bg-[#0c0a02] border border-yellow-800/40 relative rounded overflow-hidden shadow-[inset_0_0_60px_rgba(250,204,21,0.1)]">
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 z-10 p-2 bg-black/60 rounded border border-yellow-500/30">
                 <div className="flex items-center gap-2 mb-2">
                     <Crosshair className="text-yellow-500" size={16} />
                     <span className="text-xs text-yellow-100 font-bold tracking-wider">HOOK POSITION</span>
                 </div>
                 <div className="grid grid-cols-3 gap-4 text-center font-mono text-sm">
                     <div>
                         <div className="text-[10px] text-slate-500">X (Trly)</div>
                         <div className="text-white">{position.x.toFixed(1)}m</div>
                     </div>
                     <div>
                         <div className="text-[10px] text-slate-500">Y (Hoist)</div>
                         <div className="text-white">{position.y.toFixed(1)}m</div>
                     </div>
                     <div>
                         <div className="text-[10px] text-slate-500">Z (Gntr)</div>
                         <div className="text-white">{position.z.toFixed(1)}m</div>
                     </div>
                 </div>
              </div>

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                 <div className="px-3 py-1 bg-yellow-600 rounded text-xs text-black font-bold">
                    STATUS: LIFTING
                 </div>
              </div>

              <ThreeScene type="crane" color="#facc15" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
           </div>

           {/* Load History Curve */}
           <SciFiCard title="吊载重量曲线 (1min)" subtitle="LOAD TREND" className="h-[250px] border-yellow-900/50" noPadding>
              <div className="w-full h-full p-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadHistory}>
                       <defs>
                          <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#332200" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#9a6e05" tick={{fontSize: 10}} domain={[0, 45]} />
                       <Tooltip contentStyle={{backgroundColor: '#1a1402', borderColor: '#facc15', color: '#fff'}} />
                       <Area type="monotone" dataKey="load" stroke="#facc15" strokeWidth={2} fill="url(#colorLoad)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>

        </div>

        {/* RIGHT COLUMN: Health & Components */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Drive System Health */}
           <SciFiCard title="驱动系统监测" subtitle="MOTORS & DRIVES" className="flex-1 border-yellow-900/50">
              <div className="flex flex-col gap-3">
                  {motorHealth.map(m => (
                      <div key={m.id} className="bg-slate-900/40 p-3 rounded border border-slate-800">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-white uppercase">{m.id} Drive</span>
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <div className="text-[10px] text-slate-500">Temp</div>
                                  <div className="text-sm font-mono text-orange-300">{m.temp.toFixed(1)}°C</div>
                              </div>
                              <div>
                                  <div className="text-[10px] text-slate-500">Vibration</div>
                                  <div className="text-sm font-mono text-blue-300">{m.vib.toFixed(2)}mm/s</div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

           {/* Wire Rope Status */}
           <SciFiCard title="钢丝绳状态" className="border-yellow-900/50">
               <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400">Main Hoist Rope</span>
                       <span className="text-white font-bold">Cycle: 12,450</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500" style={{width: '65%'}}></div>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                       <span>Installed: 2023-01</span>
                       <span>Est. Replace: 6mo</span>
                   </div>
                   
                   <div className="mt-2 p-2 bg-red-900/20 border border-red-900/50 rounded text-[10px] text-red-300 flex items-center gap-2">
                       <AlertTriangle size={12} />
                       Visual Inspection: Minor wear detected at drum end.
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};