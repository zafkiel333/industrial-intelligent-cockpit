
import React, { useState, useEffect, useMemo } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Truck, Pickaxe, Map as MapIcon, AlertTriangle, 
  Activity, Signal, Clock, Zap, Target, 
  Navigation, Radio, Gauge, Users
} from 'lucide-react';

// --- Types ---
interface TruckNode {
  id: string;
  status: 'HAULING' | 'LOADING' | 'DUMPING' | 'EMPTY' | 'DELAY';
  load: number; // %
  speed: number; // km/h
  x: number; // Map coordinate %
  y: number; // Map coordinate %
  target: string; // Destination ID
  efficiency: number; // Score
}

interface ShovelNode {
  id: string;
  x: number;
  y: number;
  status: 'ACTIVE' | 'IDLE' | 'DOWN';
  queue: number;
  loadRate: number; // tons/h
}

interface Alert {
  id: number;
  time: string;
  type: 'safety' | 'dispatch' | 'maint';
  msg: string;
  level: 'high' | 'med' | 'low';
}

// --- Mock Data & Constants ---
const SHOVELS: ShovelNode[] = [
  { id: 'WK-01', x: 20, y: 30, status: 'ACTIVE', queue: 2, loadRate: 3500 },
  { id: 'WK-02', x: 75, y: 25, status: 'ACTIVE', queue: 1, loadRate: 3200 },
  { id: 'WK-03', x: 40, y: 60, status: 'IDLE', queue: 0, loadRate: 0 },
];

const DUMP_SITES = [
  { id: 'DUMP-A', x: 15, y: 85, label: '破碎站 A' },
  { id: 'DUMP-B', x: 85, y: 75, label: '排土场 B' },
];

// Production Trend Data
const PROD_DATA = Array.from({ length: 12 }, (_, i) => ({
  time: `${8 + i}:00`,
  plan: 4000 + Math.random() * 500,
  actual: 3800 + Math.random() * 800,
}));

// --- Helper Components ---
const TruckDot: React.FC<{ truck: TruckNode }> = ({ truck }) => (
  <div 
    className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
    style={{ left: `${truck.x}%`, top: `${truck.y}%` }}
  >
    <div className={`w-3 h-3 rounded-full border-2 shadow-[0_0_10px_currentColor] ${
      truck.status === 'HAULING' ? 'bg-green-500 border-green-300 text-green-500' :
      truck.status === 'LOADING' ? 'bg-blue-500 border-blue-300 text-blue-500' :
      truck.status === 'EMPTY' ? 'bg-slate-500 border-slate-300 text-slate-500' :
      'bg-yellow-500 border-yellow-300 text-yellow-500' // Dumping
    }`}></div>
    {/* Label */}
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white whitespace-nowrap bg-black/50 px-1 rounded">
      {truck.id}
    </div>
  </div>
);

export const MiningDispatchView: React.FC = () => {
  // --- State ---
  const [trucks, setTrucks] = useState<TruckNode[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kpi, setKpi] = useState({
    totalTons: 42580,
    oee: 88.5,
    matchRate: 96.2,
    safetyDays: 145
  });

  // --- Simulation Engine ---
  useEffect(() => {
    // Initialize Fleet
    const initTrucks: TruckNode[] = Array.from({ length: 12 }, (_, i) => ({
      id: `TRK-${100 + i}`,
      status: Math.random() > 0.5 ? 'HAULING' : 'EMPTY',
      load: 0,
      speed: 0,
      x: 50,
      y: 50,
      target: 'WK-01',
      efficiency: 90 + Math.random() * 10
    }));
    setTrucks(initTrucks);

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // 1. Move Trucks (Simulated Dispatch Logic)
      setTrucks(prev => prev.map(t => {
        let targetX = 50, targetY = 50;
        let nextStatus = t.status;
        let nextLoad = t.load;
        
        // Simple State Machine
        if (t.status === 'EMPTY') {
           // Go to Shovel
           const targetShovel = SHOVELS.find(s => s.id === t.target) || SHOVELS[0];
           targetX = targetShovel.x;
           targetY = targetShovel.y;
           
           // Arrived at Shovel?
           if (Math.abs(t.x - targetX) < 2 && Math.abs(t.y - targetY) < 2) {
             nextStatus = 'LOADING';
           } else {
             nextStatus = 'EMPTY';
           }
        } else if (t.status === 'LOADING') {
           // Loading Process
           nextLoad += 5;
           if (nextLoad >= 100) {
             nextStatus = 'HAULING';
             nextLoad = 100;
             // Assign Dump Site
             t.target = Math.random() > 0.5 ? 'DUMP-A' : 'DUMP-B';
           }
        } else if (t.status === 'HAULING') {
           // Go to Dump
           const targetDump = DUMP_SITES.find(d => d.id === t.target) || DUMP_SITES[0];
           targetX = targetDump.x;
           targetY = targetDump.y;

           // Arrived at Dump?
           if (Math.abs(t.x - targetX) < 2 && Math.abs(t.y - targetY) < 2) {
             nextStatus = 'DUMPING';
           }
        } else if (t.status === 'DUMPING') {
           nextLoad -= 10;
           if (nextLoad <= 0) {
             nextStatus = 'EMPTY';
             nextLoad = 0;
             // Assign Shovel (Dispatch Logic)
             const bestShovel = SHOVELS.reduce((prev, curr) => curr.queue < prev.queue ? curr : prev);
             t.target = bestShovel.id;
           }
        }

        // Move towards target
        const dx = targetX - t.x;
        const dy = targetY - t.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = t.status === 'LOADING' || t.status === 'DUMPING' ? 0 : (dist > 0.5 ? 0.8 : 0); // Movement step
        
        return {
          ...t,
          status: nextStatus,
          load: nextLoad,
          speed: speed * 40, // Scale to km/h visual
          x: t.x + (dist > 0 ? (dx/dist)*speed : 0),
          y: t.y + (dist > 0 ? (dy/dist)*speed : 0),
        };
      }));

      // 2. Update KPIs
      setKpi(prev => ({
        totalTons: prev.totalTons + (Math.random() > 0.8 ? 220 : 0), // Random dump event
        oee: 88 + Math.sin(Date.now() / 5000) * 1,
        matchRate: 96 + Math.random() * 0.5,
        safetyDays: 145
      }));

      // 3. Random Alerts
      if (Math.random() > 0.95) {
        const types = ['safety', 'dispatch', 'maint'] as const;
        const msgs = [
          'TRK-105 轮胎温压异常', 
          'WK-02 排队超时预警', 
          '边坡雷达检测到微小位移',
          'TRK-109 司机疲劳监测触发'
        ];
        const newAlert: Alert = {
          id: Date.now(),
          time: timeStr,
          type: types[Math.floor(Math.random()*3)],
          msg: msgs[Math.floor(Math.random()*msgs.length)],
          level: Math.random() > 0.7 ? 'high' : 'med'
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 6));
      }

    }, 200); // Animation Frame Rate

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* HEADER: Mining Theme */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-orange-700/40 pb-4 bg-gradient-to-r from-[#1c1209] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Pickaxe size={14} /> Open-Pit Mining Operations
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             露天矿车 <span className="text-orange-500">智能调度驾驶舱</span>
          </h1>
        </div>
        
        {/* Global KPIs */}
        <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Shift Production</div>
                <div className="text-2xl font-mono font-bold text-orange-400">{kpi.totalTons.toLocaleString()} <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="text-right pl-6 border-l border-orange-900/30">
                <div className="text-[10px] text-slate-500 uppercase">Fleet OEE</div>
                <div className="text-2xl font-mono font-bold text-blue-400">{kpi.oee.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="text-right pl-6 border-l border-orange-900/30">
                <div className="text-[10px] text-slate-500 uppercase">Dispatch Compliance</div>
                <div className="text-2xl font-mono font-bold text-green-400">{kpi.matchRate.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Fleet Status */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5 overflow-y-auto pr-1">
           
           {/* Fleet Composition */}
           <SciFiCard title="车队运行状态" subtitle="REAL-TIME" className="border-orange-900/50">
              <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={[
                                  { name: 'Run', value: trucks.filter(t => t.status !== 'DELAY').length, fill: '#f97316' },
                                  { name: 'Idle', value: 2, fill: '#334155' },
                                  { name: 'Maint', value: 1, fill: '#ef4444' }
                                ]}
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-lg font-bold text-white">15</span>
                          <span className="text-[8px] text-slate-500 uppercase">Total</span>
                      </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                      <div className="flex justify-between">
                          <span className="text-orange-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Active</span>
                          <span className="font-bold">12</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Standby</span>
                          <span className="font-bold">2</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-red-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Maint</span>
                          <span className="font-bold">1</span>
                      </div>
                  </div>
              </div>
           </SciFiCard>

           {/* Active Truck List */}
           <SciFiCard title="实时车辆监控" subtitle="TELEMETRY" className="flex-1 border-orange-900/50">
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {trucks.map(truck => (
                      <div key={truck.id} className="bg-slate-900/40 border border-slate-800 p-2 rounded flex flex-col gap-1 hover:border-orange-500/30 transition-colors">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                  <Truck size={12} className={truck.status === 'HAULING' ? 'text-green-400' : 'text-slate-500'} />
                                  {truck.id}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                                  ${truck.status === 'HAULING' ? 'bg-green-900/30 text-green-400' : 
                                    truck.status === 'LOADING' ? 'bg-blue-900/30 text-blue-400' :
                                    truck.status === 'DUMPING' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}
                              `}>
                                  {truck.status}
                              </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 mt-1">
                              <div>Spd: <span className="text-white font-mono">{truck.speed.toFixed(0)}</span></div>
                              <div>Load: <span className={truck.load > 95 ? 'text-orange-400' : 'text-white'}>{truck.load.toFixed(0)}%</span></div>
                              <div>Eff: <span className="text-green-400">{truck.efficiency.toFixed(0)}</span></div>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                              <div className="bg-orange-500 h-full" style={{width: `${truck.load}%`}}></div>
                          </div>
                      </div>
                  ))}
              </div>
           </SciFiCard>

        </div>

        {/* CENTER COLUMN: Digital Twin Map */}
        <div className="flex-1 flex flex-col gap-5 relative">
           
           {/* Main Map Container */}
           <div className="flex-1 bg-[#0c0a09] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(249,115,22,0.1)] group">
              
              {/* Map Background (Contour Simulation) */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%">
                      <pattern id="contour" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                          <path d="M0 100 Q 25 50 50 100 T 100 100" stroke="#44403c" fill="none"/>
                          <path d="M0 50 Q 25 0 50 50 T 100 50" stroke="#44403c" fill="none"/>
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#contour)" />
                      {/* Roads */}
                      <path d="M20% 30% L50% 50% L85% 75%" stroke="#292524" strokeWidth="20" fill="none" strokeLinecap="round" />
                      <path d="M50% 50% L40% 60% L15% 85%" stroke="#292524" strokeWidth="20" fill="none" strokeLinecap="round" />
                      <path d="M50% 50% L75% 25%" stroke="#292524" strokeWidth="20" fill="none" strokeLinecap="round" />
                  </svg>
              </div>

              {/* Elements on Map */}
              <div className="relative w-full h-full">
                  
                  {/* Shovels */}
                  {SHOVELS.map(shovel => (
                      <div key={shovel.id} className="absolute flex flex-col items-center" style={{ left: `${shovel.x}%`, top: `${shovel.y}%`, transform: 'translate(-50%, -50%)' }}>
                          <div className="w-8 h-8 bg-blue-900/50 border border-blue-500 rounded flex items-center justify-center text-blue-300 animate-pulse">
                              <Pickaxe size={16} />
                          </div>
                          <div className="mt-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-blue-200 border border-blue-900/50 whitespace-nowrap">
                              {shovel.id} <span className="text-slate-400">| Q:{shovel.queue}</span>
                          </div>
                      </div>
                  ))}

                  {/* Dump Sites */}
                  {DUMP_SITES.map(dump => (
                      <div key={dump.id} className="absolute flex flex-col items-center" style={{ left: `${dump.x}%`, top: `${dump.y}%`, transform: 'translate(-50%, -50%)' }}>
                          <div className="w-10 h-10 border-2 border-dashed border-yellow-500 rounded-full flex items-center justify-center text-yellow-500 bg-yellow-900/20">
                              <MapIcon size={16} />
                          </div>
                          <div className="mt-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-yellow-200 border border-yellow-900/50 whitespace-nowrap">
                              {dump.label}
                          </div>
                      </div>
                  ))}

                  {/* Trucks */}
                  {trucks.map(truck => <TruckDot key={truck.id} truck={truck} />)}

              </div>

              {/* HUD Overlays */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur border border-orange-500/30 p-3 rounded">
                  <div className="text-xs text-orange-400 font-bold mb-2 flex items-center gap-2">
                      <Signal size={12} className="animate-ping" /> DISPATCH OPTIMIZER
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                      <div className="flex justify-between gap-4"><span>Algorithm:</span> <span className="text-white font-mono">Dynamic LP</span></div>
                      <div className="flex justify-between gap-4"><span>Solver Latency:</span> <span className="text-green-400 font-mono">12ms</span></div>
                      <div className="flex justify-between gap-4"><span>Est. Cycle:</span> <span className="text-white font-mono">24.5 min</span></div>
                  </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-black/60 p-2 rounded text-[10px] text-slate-400 border border-slate-800">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Hauling</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Loading</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Dumping</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Empty</div>
              </div>
           </div>

           {/* Bottom Charts: Production & Cycle */}
           <div className="h-[220px] grid grid-cols-2 gap-5">
               <SciFiCard title="实时产量趋势" subtitle="TONS/HOUR" className="border-orange-900/50">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={PROD_DATA}>
                               <defs>
                                   <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                               <XAxis dataKey="time" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis stroke="#666" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316', color: '#fff'}} />
                               <Area type="monotone" dataKey="actual" stroke="#f97316" fill="url(#colorActual)" strokeWidth={2} name="Actual" />
                               <Area type="monotone" dataKey="plan" stroke="#94a3b8" fill="none" strokeDasharray="5 5" strokeWidth={1} name="Plan" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="铲装效率分析 (Shovel KPIs)" subtitle="CYCLE TIME" className="border-orange-900/50">
                   <div className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={SHOVELS} layout="vertical" margin={{left: 10}}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#331c09" horizontal={false} />
                               <XAxis type="number" stroke="#666" tick={{fontSize: 10}} />
                               <YAxis dataKey="id" type="category" stroke="#94a3b8" width={40} tick={{fontSize: 12}} />
                               <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#3b82f6', color: '#fff'}} />
                               <Bar dataKey="loadRate" name="Load Rate (t/h)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>
           </div>

        </div>

        {/* RIGHT COLUMN: Safety & Alerts */}
        <div className="w-full lg:w-1/4 flex flex-col gap-5">
           
           {/* Safety Dashboard */}
           <SciFiCard title="安全与环境监测" subtitle="HSE" className="border-orange-900/50">
               <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Safe Days</div>
                       <div className="text-xl font-bold text-green-400">{kpi.safetyDays}</div>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                       <div className="text-[10px] text-slate-500 uppercase">Fatigue Alerts</div>
                       <div className="text-xl font-bold text-yellow-400">2</div>
                   </div>
               </div>
               
               <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs p-2 bg-red-900/10 border border-red-900/30 rounded">
                       <div className="flex items-center gap-2 text-red-300">
                           <Activity size={14} /> <span>Slope Stability</span>
                       </div>
                       <span className="font-bold">Warning (Zone C)</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/30 border border-slate-700 rounded">
                       <div className="flex items-center gap-2 text-slate-300">
                           <Radio size={14} /> <span>V2V Comms</span>
                       </div>
                       <span className="text-green-400">Online</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-slate-900/30 border border-slate-700 rounded">
                       <div className="flex items-center gap-2 text-slate-300">
                           <Gauge size={14} /> <span>Dust Level</span>
                       </div>
                       <span className="text-yellow-400">Moderate</span>
                   </div>
               </div>
           </SciFiCard>

           {/* Intelligent Dispatch Console */}
           <SciFiCard title="智能调度指令" subtitle="ACTIONS" className="flex-1 border-orange-900/50">
               <div className="flex flex-col h-full">
                   <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                       <span>Active Instructions</span>
                       <span className="text-orange-400 animate-pulse">Live Updating...</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                       {/* Mock Algorithm Suggestions */}
                       <div className="p-2 border-l-2 border-green-500 bg-slate-900/40 rounded">
                           <div className="flex justify-between items-start">
                               <span className="text-xs font-bold text-white">Reroute: TRK-102</span>
                               <span className="text-[10px] text-slate-500">Just now</span>
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1">
                               Queue at WK-01 &gt; 3. Redirect to WK-02 to optimize cycle time.
                           </p>
                       </div>
                       
                       <div className="p-2 border-l-2 border-blue-500 bg-slate-900/40 rounded">
                           <div className="flex justify-between items-start">
                               <span className="text-xs font-bold text-white">Fuel: TRK-110</span>
                               <span className="text-[10px] text-slate-500">2m ago</span>
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1">
                               Fuel level &lt; 15%. Schedule refueling after current dump.
                           </p>
                       </div>

                       {alerts.map(alert => (
                           <div key={alert.id} className={`p-2 border-l-2 ${alert.level === 'high' ? 'border-red-500 bg-red-900/10' : 'border-yellow-500 bg-yellow-900/10'} rounded`}>
                               <div className="flex justify-between items-start">
                                   <span className={`text-xs font-bold ${alert.level === 'high' ? 'text-red-300' : 'text-yellow-300'}`}>
                                       {alert.type.toUpperCase()} ALERT
                                   </span>
                                   <span className="text-[10px] text-slate-500">{alert.time}</span>
                               </div>
                               <p className="text-[10px] text-slate-300 mt-1">{alert.msg}</p>
                           </div>
                       ))}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-800">
                       <button className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2">
                           <Target size={14} /> MANUAL INTERVENTION
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
