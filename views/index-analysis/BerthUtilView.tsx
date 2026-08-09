
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-berth-util]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-berth-util';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  PieChart, Pie, Cell, Legend, BarChart, Bar, RadialBarChart, RadialBar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Anchor, Ship, Clock, TrendingUp, Calendar, 
  Map as MapIcon, Activity, Box, ArrowRight, Play, Pause, Settings
} from 'lucide-react';

// --- MOCK DATA ---

// Berth Status Data (4 Berths)
const BERTH_DATA = [
  { id: 1, name: 'B-01', ship: 'COSCO STAR', status: 'Occupied', progress: 85, type: 'Container' },
  { id: 2, name: 'B-02', ship: '-', status: 'Empty', progress: 0, type: '-' },
  { id: 3, name: 'B-03', ship: 'MSC IRIS', status: 'Occupied', progress: 30, type: 'Container' },
  { id: 4, name: 'B-04', ship: 'EVER GIVEN', status: 'Occupied', progress: 60, type: 'Bulk' },
];

// Efficiency Trend (Turnaround Time vs Throughput)
const EFF_TREND = Array.from({length: 12}, (_, i) => ({
    time: `${i*2}:00`,
    turnaround: 18 + Math.sin(i*0.5)*2 + Math.random()*2, // Hours
    occupancy: 75 + Math.sin(i*0.3)*15 // %
}));

// Gantt Schedule Mock (Simplified for visualization)
const SCHEDULE = [
    { berth: 'B-01', ship: 'V-101', start: 0, duration: 8, status: 'Done' },
    { berth: 'B-01', ship: 'V-105', start: 9, duration: 6, status: 'Active' },
    { berth: 'B-02', ship: 'V-102', start: 2, duration: 5, status: 'Done' },
    { berth: 'B-03', ship: 'V-103', start: 1, duration: 10, status: 'Active' },
    { berth: 'B-04', ship: 'V-104', start: 4, duration: 8, status: 'Active' },
];

export const BerthUtilView: React.FC = () => {
  // --- STATE ---
  const [arrivalRate, setArrivalRate] = useState(1.0); // Multiplier
  const [craneSpeed, setCraneSpeed] = useState(30); // Moves per hour
  const [selectedBerth, setSelectedBerth] = useState<number | null>(null);

  const [metrics, setMetrics] = useState({
    avgOccupancy: 72.5, // %
    avgTurnaround: 18.5, // Hours
    waitingRatio: 12.0, // % (Time waiting / Total Port Time)
    throughput: 4200 // TEU/Day
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            avgOccupancy: 72 + Math.sin(Date.now()/5000) * 5 * arrivalRate,
            avgTurnaround: Math.max(12, 25 - (craneSpeed/5)),
            waitingRatio: 10 + (arrivalRate - 1) * 5,
            throughput: prev.throughput + (craneSpeed / 30) * 5
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, [arrivalRate, craneSpeed]);

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] bg-[#020617] text-blue-50 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* 1. TOP COMMAND BAR (KPIs) */}
      <div className="h-20 flex items-center justify-between px-6 bg-slate-900/80 border-b border-blue-900/50 backdrop-blur-md z-20">
          <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
                 <Anchor size={14} /> Port Operations Center
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                 泊位利用率 <span className="text-blue-500">& 周转效率全景分析</span>
              </h1>
          </div>

          <div className="flex gap-8">
             <div className="flex flex-col items-center">
                 <span className="text-xs text-slate-400">BOR (Occupancy)</span>
                 <span className="text-2xl font-mono font-bold text-blue-300">{metrics.avgOccupancy.toFixed(1)}%</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-700"></div>
             <div className="flex flex-col items-center">
                 <span className="text-xs text-slate-400">Avg Turnaround</span>
                 <span className="text-2xl font-mono font-bold text-white">{metrics.avgTurnaround.toFixed(1)} h</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-700"></div>
             <div className="flex flex-col items-center">
                 <span className="text-xs text-slate-400">Waiting Ratio</span>
                 <span className={`text-2xl font-mono font-bold ${metrics.waitingRatio > 15 ? 'text-red-400' : 'text-green-400'}`}>
                     {metrics.waitingRatio.toFixed(1)}%
                 </span>
             </div>
          </div>
      </div>

      {/* 2. MAIN VISUAL AREA (3D Digital Twin) - Takes 60% Height */}
      <div className="flex-1 relative min-h-[350px] mx-4 border border-blue-800/40 rounded-lg overflow-hidden bg-[#050810] shadow-[0_0_50px_rgba(14,165,233,0.1)] group">
          
          {/* 3D Scene */}
          <ThreeScene type="berth-utilization-analysis" color="#0ea5e9" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

          {/* HUD Overlays (Floating Labels on Ships) */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
              <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                  <Activity size={16} className="text-blue-400 animate-pulse" />
                  <div>
                      <div className="text-[10px] text-slate-400 uppercase">Live Operations</div>
                      <div className="text-sm font-bold text-white">3 Berths Active</div>
                  </div>
              </div>
          </div>

          {/* Simulation Control Overlay (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-20 w-64 bg-slate-900/90 backdrop-blur border border-blue-700/50 p-3 rounded-lg shadow-xl">
              <div className="text-xs font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <Settings size={12} /> SCENARIO SIMULATION
              </div>
              
              <div className="space-y-3">
                  <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-300">
                          <span>Vessel Arrival Rate</span>
                          <span>{arrivalRate.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.1" 
                        value={arrivalRate} onChange={(e) => setArrivalRate(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>
                  <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-300">
                          <span>Crane Productivity</span>
                          <span>{craneSpeed} mph</span>
                      </div>
                      <input 
                        type="range" min="20" max="45" step="1" 
                        value={craneSpeed} onChange={(e) => setCraneSpeed(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                  </div>
              </div>
          </div>

          {/* Berth Status Cards (Bottom Left Overlay) */}
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              {BERTH_DATA.map(berth => (
                  <div 
                    key={berth.id}
                    onClick={() => setSelectedBerth(selectedBerth === berth.id ? null : berth.id)}
                    className={`
                        w-24 p-2 rounded cursor-pointer transition-all border
                        ${selectedBerth === berth.id 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                            : 'bg-black/60 border-slate-700 text-slate-400 hover:bg-slate-800'}
                    `}
                  >
                      <div className="text-[10px] font-bold mb-1">{berth.name}</div>
                      <div className="text-[9px] truncate">{berth.ship}</div>
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                          <div 
                             className={`h-full ${berth.status === 'Occupied' ? 'bg-green-500' : 'bg-slate-500'}`} 
                             style={{width: `${berth.progress}%`}}
                          ></div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. BOTTOM ANALYTICS DECK (3 Panels) */}
      <div className="h-[280px] grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-4">
          
          {/* Panel 1: Operations Schedule (Gantt-like) */}
          <SciFiCard title="泊位作业计划 (24H Gantt)" subtitle="SCHEDULE" className="border-blue-900/50">
              <div className="flex flex-col h-full gap-2 pt-2">
                  {['B-01', 'B-02', 'B-03', 'B-04'].map((berthId, i) => (
                      <div key={i} className="flex items-center gap-2 h-8">
                          <span className="text-[10px] text-slate-400 w-8">{berthId}</span>
                          <div className="flex-1 bg-slate-900/50 rounded relative h-6 overflow-hidden border border-slate-800">
                              {SCHEDULE.filter(s => s.berth === berthId).map((job, idx) => (
                                  <div 
                                    key={idx}
                                    className={`absolute top-1 bottom-1 rounded text-[8px] flex items-center justify-center text-black font-bold
                                        ${job.status === 'Done' ? 'bg-slate-600 opacity-50' : job.status === 'Active' ? 'bg-green-400' : 'bg-blue-400'}
                                    `}
                                    style={{
                                        left: `${(job.start / 24) * 100}%`,
                                        width: `${(job.duration / 24) * 100}%`
                                    }}
                                  >
                                      {job.ship}
                                  </div>
                              ))}
                              {/* Current Time Line */}
                              <div className="absolute top-0 bottom-0 w-[1px] bg-red-500 left-[40%] z-10"></div>
                          </div>
                      </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-slate-500 px-10">
                      <span>00:00</span><span>12:00</span><span>24:00</span>
                  </div>
              </div>
          </SciFiCard>

          {/* Panel 2: Efficiency Trend */}
          <SciFiCard title="周转效率与占用率趋势" subtitle="TREND" className="border-blue-900/50">
              <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={EFF_TREND}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
                          <YAxis yAxisId="left" stroke="#3b82f6" tick={{fontSize: 10}} label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft', fontSize: 10, fill:'#3b82f6' }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{fontSize: 10}} label={{ value: 'Turnaround (h)', angle: 90, position: 'insideRight', fontSize: 10, fill:'#f97316' }} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6'}} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                          <Area yAxisId="left" type="monotone" dataKey="occupancy" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" name="Occupancy" />
                          <Line yAxisId="right" type="monotone" dataKey="turnaround" stroke="#f97316" strokeWidth={2} dot={false} name="Turnaround Time" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

          {/* Panel 3: Performance Radar */}
          <SciFiCard title="综合效能评估" subtitle="INDEX" className="border-blue-900/50">
              <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: 'Turnover', A: 85, fullMark: 100 },
                          { subject: 'Crane Prod.', A: (craneSpeed/45)*100, fullMark: 100 },
                          { subject: 'Wait Time', A: 100 - metrics.waitingRatio, fullMark: 100 },
                          { subject: 'Safety', A: 98, fullMark: 100 },
                          { subject: 'Planning', A: 92, fullMark: 100 },
                      ]}>
                          <PolarGrid stroke="#1e3a8a" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#93c5fd', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Performance" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.4} />
                          <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#0ea5e9', color: '#fff'}} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

    </div>
  );
};
