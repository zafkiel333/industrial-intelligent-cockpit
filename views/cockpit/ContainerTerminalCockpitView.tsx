
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Anchor, Box, Truck, Ship, Activity, 
  Clock, Zap, LayoutGrid, Layers, ArrowRight,
  ClipboardList, AlertTriangle, PlayCircle
} from 'lucide-react';

// --- MOCK DATA ---

// Work Instruction Stream
const WORK_QUEUE = [
  { id: 'JOB-8821', type: 'LOAD', loc: 'Bay 12-04-02', truck: 'AGV-42', status: 'Active' },
  { id: 'JOB-8822', type: 'DISCH', loc: 'Bay 08-02-05', truck: 'AGV-15', status: 'Active' },
  { id: 'JOB-8823', type: 'LOAD', loc: 'Bay 14-06-01', truck: 'AGV-33', status: 'Pending' },
  { id: 'JOB-8824', type: 'YARD', loc: 'Block A-05', truck: 'ITV-09', status: 'Pending' },
  { id: 'JOB-8825', type: 'DISCH', loc: 'Bay 02-01-08', truck: 'AGV-21', status: 'Queued' },
];

// Quay Crane Performance
const QC_PERFORMANCE = Array.from({length: 8}, (_, i) => ({
    id: `QC-0${i+1}`,
    mph: 25 + Math.random() * 10, // Moves Per Hour
    target: 30,
    status: Math.random() > 0.1 ? 'Running' : 'Idle'
}));

// Hourly Throughput Trend
const THROUGHPUT_DATA = Array.from({length: 12}, (_, i) => ({
    hour: `${8+i}:00`,
    teu: 350 + Math.sin(i * 0.5) * 100 + Math.random() * 50,
    trucks: 120 + Math.sin(i * 0.5) * 40
}));

// Yard Density Heatmap Data (Simplified for Pie)
const YARD_STATUS = [
    { name: 'Occupied', value: 65, color: '#f59e0b' },
    { name: 'Planned', value: 15, color: '#3b82f6' },
    { name: 'Empty', value: 20, color: '#334155' },
];

export const ContainerTerminalCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    movesPerHour: 145,
    gateTurnaround: 24.5, // min
    vesselRate: 88.2, // moves/h
    agvActive: 42,
    yardDensity: 65.4
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            movesPerHour: 140 + Math.random() * 10,
            gateTurnaround: 24 + Math.sin(Date.now()/5000),
            vesselRate: 88 + Math.random() * 5
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0b1121] text-blue-50 relative overflow-hidden">
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-orange-600/30 pb-4 px-2 bg-gradient-to-r from-slate-900/90 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Anchor size={14} className="animate-pulse" /> Automated Terminal Operating System (TOS)
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             集装箱码头 <span className="text-orange-500">生产作业驾驶舱</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Terminal Efficiency</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.movesPerHour.toFixed(0)} <span className="text-sm text-slate-500">MPH</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-700 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Truck size={10}/> Gate Turnaround</div>
                <div className="text-2xl font-mono font-bold text-blue-400">{metrics.gateTurnaround.toFixed(1)} <span className="text-sm text-slate-500">min</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-slate-700 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><LayoutGrid size={10}/> Yard Density</div>
                <div className={`text-2xl font-mono font-bold ${metrics.yardDensity > 80 ? 'text-red-500' : 'text-orange-400'}`}>
                    {metrics.yardDensity.toFixed(1)} <span className="text-sm text-slate-500">%</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Quayside & Vessel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="岸桥实时效率 (QC MPH)" subtitle="QUAYSIDE" className="flex-1 border-orange-900/50">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {QC_PERFORMANCE.map((qc) => (
                          <div key={qc.id} className="flex flex-col p-2 bg-slate-900/40 border border-slate-800 rounded hover:border-orange-500/30 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white">{qc.id}</span>
                                  <span className={`text-[9px] px-1.5 rounded ${qc.status === 'Running' ? 'bg-green-900/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                      {qc.status}
                                  </span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${qc.mph >= qc.target ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${(qc.mph/45)*100}%`}}></div>
                                  </div>
                                  <span className="text-xs font-mono w-10 text-right text-slate-300">{qc.mph.toFixed(1)}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="泊位作业计划" subtitle="BERTH PLAN" className="h-[200px] border-orange-900/50">
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 p-2 border-l-2 border-green-500 bg-slate-900/30">
                          <Ship size={16} className="text-green-400" />
                          <div className="flex-1">
                              <div className="text-xs font-bold text-white">EVER GIVEN</div>
                              <div className="text-[10px] text-slate-500">ETD: 14:00 (Rem: 450 moves)</div>
                          </div>
                          <span className="text-xs font-mono text-green-400">Work</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border-l-2 border-yellow-500 bg-slate-900/30">
                          <Ship size={16} className="text-yellow-400" />
                          <div className="flex-1">
                              <div className="text-xs font-bold text-white">COSCO STAR</div>
                              <div className="text-[10px] text-slate-500">ETA: 15:30 (Pilot on board)</div>
                          </div>
                          <span className="text-xs font-mono text-yellow-400">Appr</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 border-l-2 border-slate-500 bg-slate-900/30 opacity-60">
                          <Ship size={16} className="text-slate-400" />
                          <div className="flex-1">
                              <div className="text-xs font-bold text-white">MSC OSCAR</div>
                              <div className="text-[10px] text-slate-500">ETA: 22:00</div>
                          </div>
                          <span className="text-xs font-mono text-slate-400">Wait</span>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Twin & Throughput */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050810] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(249,115,22,0.15)] group">
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 p-2 rounded flex items-center gap-3">
                          <Zap size={16} className="text-orange-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Automation Mode</div>
                              <div className="text-sm font-bold text-white">SEMI-AUTO</div>
                          </div>
                      </div>
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 p-2 rounded flex items-center gap-3">
                          <Truck size={16} className="text-blue-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">AGV Fleet</div>
                              <div className="text-sm font-bold text-white">{metrics.agvActive} / 50 Active</div>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="container-terminal" color="#f97316" />
              </div>

              {/* Throughput Chart */}
              <SciFiCard title="吞吐量与集卡流量 (Throughput)" subtitle="HOURLY" className="h-[240px] border-orange-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={THROUGHPUT_DATA}>
                              <defs>
                                  <linearGradient id="colorTeu" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis yAxisId="left" stroke="#f97316" tick={{fontSize: 10}} label={{ value: 'TEU', angle: -90, position: 'insideLeft', fontSize: 10, fill:'#f97316' }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Trucks', angle: 90, position: 'insideRight', fontSize: 10, fill:'#3b82f6' }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#f97316'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Area yAxisId="left" type="monotone" dataKey="teu" fill="url(#colorTeu)" stroke="#f97316" name="TEU Throughput" />
                              <Line yAxisId="right" type="monotone" dataKey="trucks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Gate Trucks" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Yard & Jobs */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Yard Density */}
              <SciFiCard title="堆场库存密度" subtitle="YARD UTILIZATION" className="h-[220px] border-orange-900/50">
                  <div className="flex items-center h-full">
                      <div className="w-1/2 h-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={YARD_STATUS}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {YARD_STATUS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                              <span className="text-xl font-bold text-white">65%</span>
                              <span className="text-[8px] text-slate-500">UTIL</span>
                          </div>
                      </div>
                      <div className="w-1/2 flex flex-col justify-center gap-2 text-xs">
                          {YARD_STATUS.map((s, i) => (
                              <div key={i} className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                                      <span className="text-slate-300">{s.name}</span>
                                  </div>
                                  <span className="font-mono text-white">{s.value}%</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

              {/* TOS Job Dispatch */}
              <SciFiCard title="作业指令队列 (TOS)" subtitle="LIVE DISPATCH" className="flex-1 border-orange-900/50">
                  <div className="flex flex-col h-full gap-2">
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-2 border-b border-slate-800 pb-1">
                          <span>Job ID / Loc</span>
                          <span>Vehicle / Status</span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                          {WORK_QUEUE.map((job, i) => (
                              <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 border border-slate-800 rounded hover:bg-slate-800 transition-colors">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white flex items-center gap-1">
                                          {job.type === 'LOAD' ? <ArrowRight size={10} className="text-red-400 rotate-[-45deg]"/> : <ArrowRight size={10} className="text-green-400 rotate-[45deg]"/>}
                                          {job.id}
                                      </span>
                                      <span className="text-[10px] text-slate-500">{job.loc}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                      <span className="text-[10px] text-orange-300 bg-orange-900/20 px-1 rounded">{job.truck}</span>
                                      <span className={`text-[9px] ${job.status === 'Active' ? 'text-green-400' : 'text-slate-500'}`}>{job.status}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      {/* Alert Ticker */}
                      <div className="mt-auto bg-red-900/10 border border-red-900/30 p-2 rounded flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500 shrink-0" />
                          <div className="text-[10px] text-red-200 truncate">
                              Block B-02: Reefer temperature alarm active. Tech dispatched.
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
