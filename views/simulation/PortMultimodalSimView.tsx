
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Truck, Train, Box, Activity, 
  Settings, Play, Pause, BarChart2, 
  ArrowRightLeft, Layers, MapPin, 
  Share2, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

// --- MOCK DATA ---
const THROUGHPUT_DATA = [
  { name: 'Road (公路)', value: 65, fill: '#10b981' },
  { name: 'Rail (铁路)', value: 35, fill: '#eab308' },
];

const DWELL_TIME_DATA = Array.from({length: 12}, (_, i) => ({
    hour: `${8+i}:00`,
    truck: 25 + Math.random() * 10,
    rail: 45 + Math.random() * 5
}));

const GATE_LOGS = [
    { id: 'T-1024', type: 'Truck', action: 'Entry', gate: 'G1', time: '10:45:02' },
    { id: 'R-5501', type: 'Rail', action: 'Arrive', gate: 'R-North', time: '10:42:15' },
    { id: 'T-1023', type: 'Truck', action: 'Exit', gate: 'G2', time: '10:40:30' },
    { id: 'T-1022', type: 'Truck', action: 'Load', gate: 'Yard-A', time: '10:38:10' },
];

export const PortMultimodalSimView: React.FC = () => {
  const [truckRate, setTruckRate] = useState(50); // %
  const [trainActive, setTrainActive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [metrics, setMetrics] = useState({
    teuHourly: 320,
    railShare: 35.2, // %
    gateQueue: 4,
    yardOccupancy: 78
  });

  // Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            teuHourly: 300 + (truckRate/100)*50 + (trainActive ? 50 : 0) + Math.random()*20,
            gateQueue: Math.floor((truckRate/100) * 8 + Math.random() * 2),
            yardOccupancy: Math.min(100, prev.yardOccupancy + (Math.random()-0.5)*0.5)
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, truckRate, trainActive]);

  return (
    <div className="h-full w-full relative bg-[#0f172a] text-slate-200 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="port-multimodal" 
            simData={{ 
                truckRate: isPlaying ? truckRate : 0,
                trainActive: isPlaying && trainActive
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0f172a_100%)] pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#1e293b]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <ArrowRightLeft size={14} /> INTERMODAL HUB
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 港区集疏运 <span className="text-blue-500">(公路+铁路) 多式联运仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Throughput</div>
                   <div className="text-3xl font-mono font-bold text-white">{metrics.teuHourly.toFixed(0)} <span className="text-sm text-slate-500">TEU/h</span></div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Yard Occ.</div>
                   <div className={`text-3xl font-mono font-bold ${metrics.yardOccupancy > 90 ? 'text-red-500' : 'text-green-400'}`}>
                       {metrics.yardOccupancy.toFixed(1)}%
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT: Controls */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <div className="bg-[#0b1120]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Settings size={16} className="text-blue-500"/> 调度参数配置
              </h3>
              
              <div className="space-y-6">
                  {/* Truck Rate */}
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-2"><Truck size={12}/> Truck Arrival Rate</span>
                          <span className="font-mono text-green-400">{truckRate}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="10" 
                        value={truckRate} onChange={(e) => setTruckRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                  </div>

                  {/* Train Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Train size={16} className="text-yellow-500"/>
                          <span>Rail Operations</span>
                      </div>
                      <button 
                         onClick={() => setTrainActive(!trainActive)}
                         className={`w-10 h-5 rounded-full p-0.5 transition-colors ${trainActive ? 'bg-yellow-600' : 'bg-slate-600'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${trainActive ? 'translate-x-5' : ''}`}></div>
                      </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border
                            ${isPlaying ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'bg-green-600/30 border-green-500 text-green-200'}
                        `}
                      >
                          {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                          {isPlaying ? 'PAUSE' : 'START'}
                      </button>
                  </div>
              </div>
          </div>

          <SciFiCard title="集疏运分担率 (Modal Split)" subtitle="SHARE" className="h-[250px] border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={THROUGHPUT_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {THROUGHPUT_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#fff'}} />
                          <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                      <span className="text-xl font-bold text-white">{metrics.railShare.toFixed(1)}%</span>
                  </div>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT: Analytics */}
      <div className="absolute right-6 top-32 bottom-6 w-96 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="平均在港时间 (Dwell Time)" subtitle="MINUTES" className="h-[280px] border-blue-900/50 bg-[#0b1120]/90 pointer-events-auto">
              <div className="w-full h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DWELL_TIME_DATA} margin={{left: -20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                          <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Bar dataKey="truck" name="Road" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="rail" name="Rail" fill="#eab308" radius={[2, 2, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          <div className="flex-1 bg-[#0b1120]/90 backdrop-blur-md border border-blue-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-blue-900/30 pb-2">
                  <Activity size={16} className="text-blue-500"/> 实时作业日志
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {GATE_LOGS.map((log, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-900/50 border border-slate-800">
                          <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${log.type === 'Truck' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                  {log.type === 'Truck' ? <Truck size={12}/> : <Train size={12}/>}
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-200">{log.id}</div>
                                  <div className="text-[9px] text-slate-500">{log.action} @ {log.gate}</div>
                              </div>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{log.time}</div>
                      </div>
                  ))}
              </div>
              
              <div className="mt-auto p-2 border border-slate-700 rounded bg-slate-900/30 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Gate Queue</span>
                  <span className={`font-bold ${metrics.gateQueue > 5 ? 'text-red-400' : 'text-green-400'}`}>{metrics.gateQueue} Trucks</span>
              </div>
          </div>

      </div>

    </div>
  );
};
