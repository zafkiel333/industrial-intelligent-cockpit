
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Box, Anchor, Activity, Clock, Zap, 
  ArrowRight, AlertTriangle, Layers, TrendingUp,
  Database, Gauge, Wind, Droplets
} from 'lucide-react';

// --- MOCK DATA ---

const FLOW_DATA = Array.from({length: 12}, (_, i) => ({
    hour: `${i+8}:00`,
    unloading: 2500 + Math.sin(i*0.5)*500 + Math.random()*200,
    stacking: 2400 + Math.sin(i*0.5)*500,
    reclaiming: 1200 + Math.cos(i*0.5)*300
}));

const STOCKPILE_STATUS = [
    { name: 'Iron Ore A', weight: 125000, capacity: 150000, grade: '62.5% Fe' },
    { name: 'Iron Ore B', weight: 85000, capacity: 120000, grade: '58.0% Fe' },
    { name: 'Thermal Coal', weight: 65000, capacity: 100000, grade: '5500 kcal' },
    { name: 'Coking Coal', weight: 42000, capacity: 80000, grade: 'High CSR' },
];

const BELT_HEALTH = [
    { id: 'C-101', status: 'Good', load: 85, temp: 42 },
    { id: 'C-102', status: 'Warning', load: 92, temp: 65 }, // Overheating
    { id: 'C-201', status: 'Good', load: 70, temp: 40 },
    { id: 'C-202', status: 'Good', load: 65, temp: 38 },
];

export const BulkTerminalCockpitView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    throughputShift: 24500, // tons
    turnoverRate: 4.2, // days
    ecoIndex: 88.5,
    activeBelts: 12,
    shipEfficiency: 1450 // t/h
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            throughputShift: prev.throughputShift + 50 + Math.random() * 20,
            shipEfficiency: 1450 + Math.sin(Date.now()/2000) * 100,
            ecoIndex: 88 + Math.random()
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#1c1917] text-amber-50 relative overflow-hidden">
      
      {/* Texture Overlay for Gritty Feel */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-amber-700/40 pb-4 px-2 bg-gradient-to-r from-amber-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1 uppercase tracking-wider">
             <Layers size={14} className="animate-pulse" /> Bulk Material Logistics
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             散货码头 <span className="text-amber-500">物流驾驶舱</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Box size={10}/> Shift Throughput</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{metrics.throughputShift.toLocaleString()} <span className="text-sm text-slate-500">t</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-800/50 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Stock Turnover</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.turnoverRate} <span className="text-sm text-slate-500">days</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-amber-800/50 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Eco Index</div>
                <div className="text-2xl font-mono font-bold text-green-400">{metrics.ecoIndex.toFixed(1)}</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Unloading & Conveying */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="卸船与输送效率" subtitle="FLOW RATE" className="h-[280px] border-amber-900/50 bg-[#0f0b08]/80" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={FLOW_DATA}>
                              <defs>
                                  <linearGradient id="flowAmber" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#44403c" vertical={false} />
                              <XAxis dataKey="hour" stroke="#78716c" tick={{fontSize: 10}} />
                              <YAxis stroke="#78716c" tick={{fontSize: 10}} label={{ value: 't/h', angle: -90, position: 'insideLeft', fill: '#78716c' }} />
                              <Tooltip contentStyle={{backgroundColor: '#1c1917', borderColor: '#d97706'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Area type="monotone" dataKey="unloading" name="Unloading" stroke="#d97706" fill="url(#flowAmber)" />
                              <Line type="monotone" dataKey="reclaiming" name="Reclaiming" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              <SciFiCard title="皮带机健康状态" subtitle="CONVEYORS" className="flex-1 border-amber-900/50">
                  <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {BELT_HEALTH.map((belt, i) => (
                          <div key={i} className="flex flex-col p-2 bg-slate-900/40 border border-slate-800 rounded hover:border-amber-600/30 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-amber-100">{belt.id}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${belt.status === 'Warning' ? 'bg-red-900/40 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
                                      {belt.status}
                                  </span>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                  <div className="flex-1 flex flex-col gap-1">
                                      <div className="flex justify-between">
                                          <span>Load</span>
                                          <span className="text-white">{belt.load}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="bg-amber-600 h-full" style={{width: `${belt.load}%`}}></div>
                                      </div>
                                  </div>
                                  <div className="w-px h-6 bg-slate-700"></div>
                                  <div className="flex flex-col items-center w-12">
                                      <span>Temp</span>
                                      <span className={`font-bold ${belt.temp > 60 ? 'text-red-400' : 'text-slate-200'}`}>{belt.temp}°C</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Stockyard & Operation */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#0c0a09] border border-amber-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(217,119,6,0.15)] group">
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-amber-600/30 p-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-amber-500 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Operation Mode</div>
                              <div className="text-sm font-bold text-white">STACKING: PILE B-02</div>
                          </div>
                      </div>
                  </div>

                  {/* Machine Status Overlay */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/70 p-3 rounded border border-slate-700 w-64">
                      <div className="text-xs font-bold text-amber-400 mb-2">SR-01 (Stacker/Reclaimer)</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                          <div>Slew Angle: <span className="text-white">45°</span></div>
                          <div>Boom Pitch: <span className="text-white">+12°</span></div>
                          <div>Travel Pos: <span className="text-white">1245m</span></div>
                          <div>Wheel Amps: <span className="text-green-400">180A</span></div>
                      </div>
                  </div>

                  <ThreeScene type="bulk-terminal" color="#d97706" />
              </div>

              {/* Bottom: Eco Panel */}
              <SciFiCard title="环保与安全监测" subtitle="HSE" className="h-[180px] border-amber-900/50">
                  <div className="grid grid-cols-3 gap-4 h-full items-center">
                      <div className="text-center p-3 bg-amber-900/10 border border-amber-800/30 rounded">
                          <Wind size={24} className="mx-auto text-slate-400 mb-2" />
                          <div className="text-xs text-slate-500 uppercase">Dust Level (PM10)</div>
                          <div className="text-xl font-bold text-yellow-200">45 <span className="text-xs font-normal">µg/m³</span></div>
                      </div>
                      <div className="text-center p-3 bg-amber-900/10 border border-amber-800/30 rounded">
                          <Droplets size={24} className="mx-auto text-blue-400 mb-2" />
                          <div className="text-xs text-slate-500 uppercase">Sprinklers</div>
                          <div className="text-xl font-bold text-blue-200">ACTIVE <span className="text-xs font-normal">(Zone 2)</span></div>
                      </div>
                      <div className="text-center p-3 bg-red-900/10 border border-red-900/30 rounded">
                          <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
                          <div className="text-xs text-slate-500 uppercase">Belt Tear Risk</div>
                          <div className="text-xl font-bold text-green-400">LOW</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Inventory & Stacking */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Stockpile Inventory */}
              <SciFiCard title="堆场库存实时状态" subtitle="INVENTORY" className="flex-1 border-amber-900/50">
                  <div className="flex flex-col gap-4">
                      {STOCKPILE_STATUS.map((pile, i) => (
                          <div key={i} className="bg-slate-900/40 p-3 rounded border border-slate-800">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white">{pile.name}</span>
                                  <span className="text-[10px] text-amber-400">{pile.grade}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                  <span>{(pile.weight/1000).toFixed(0)}k t</span>
                                  <span className="text-[9px]">/ {(pile.capacity/1000).toFixed(0)}k t</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-amber-600 h-full" style={{width: `${(pile.weight/pile.capacity)*100}%`}}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              {/* Blending Control */}
              <SciFiCard title="混矿配比控制" subtitle="BLENDING" className="h-[200px] border-amber-900/50">
                  <div className="flex items-center gap-4 h-full">
                      <div className="relative w-24 h-24">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={[
                                        { name: 'Ore A', value: 60, fill: '#d97706' },
                                        { name: 'Ore B', value: 40, fill: '#78350f' }
                                    ]}
                                    innerRadius={25}
                                    outerRadius={40}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                              60:40
                          </div>
                      </div>
                      <div className="flex-1 space-y-2 text-xs">
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                              <span className="text-slate-400">Target Fe</span>
                              <span className="text-white font-bold">61.0%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                              <span className="text-slate-400">Current Fe</span>
                              <span className="text-green-400 font-bold">60.8%</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-slate-400">Flow</span>
                              <span className="text-white">3200 t/h</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
