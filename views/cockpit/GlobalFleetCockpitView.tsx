
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cp-global-fleet]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cp-global-fleet';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Ship, Anchor, Navigation, Wind, MapPin, 
  Globe, Package, Clock, Zap, Activity, 
  Search, Filter, AlertTriangle, Radio
} from 'lucide-react';

// --- MOCK DATA ---

const FLEET_LIST = [
  { id: 'V-101', name: 'COSCO STAR', type: 'Container', status: 'Underway', dest: 'Rotterdam', eta: '2d 4h', load: 85 },
  { id: 'V-102', name: 'PACIFIC GEM', type: 'Bulk', status: 'Anchored', dest: 'Singapore', eta: 'Arrived', load: 92 },
  { id: 'V-103', name: 'ARCTIC WIND', type: 'LNG', status: 'Underway', dest: 'Shanghai', eta: '5d 12h', load: 60 },
  { id: 'V-104', name: 'ATLANTIC KING', type: 'Container', status: 'Underway', dest: 'New York', eta: '8d 2h', load: 78 },
  { id: 'V-105', name: 'OCEAN PRIDE', type: 'Ro-Ro', status: 'Drifting', dest: 'Yokohama', eta: '1d 6h', load: 45 },
];

const FUEL_EFFICIENCY = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    actual: 120 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
    optimal: 115
}));

const ROUTE_EVENTS = [
    { time: '08:00', event: 'Dep. Shanghai', status: 'Done' },
    { time: '14:00', event: 'Change Heading', status: 'Done' },
    { time: '22:00', event: 'Storm Avoidance', status: 'Active' },
    { time: 'Tomorrow', event: 'Arr. Singapore', status: 'Pending' },
];

const CARGO_DIST = [
    { name: 'Electronics', value: 35, fill: '#0ea5e9' },
    { name: 'Machinery', value: 25, fill: '#6366f1' },
    { name: 'Textiles', value: 20, fill: '#8b5cf6' },
    { name: 'Chemicals', value: 20, fill: '#ef4444' },
];

export const GlobalFleetCockpitView: React.FC = () => {
  const [selectedShip, setSelectedShip] = useState(FLEET_LIST[0]);
  const [metrics, setMetrics] = useState({
    activeShips: 142,
    totalTEU: 452000,
    onTimeRate: 94.2,
    carbonSaved: 1250, // tons
    globalAlerts: 3
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            carbonSaved: prev.carbonSaved + 0.5,
            onTimeRate: 94 + Math.random() * 0.5
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col font-[Rajdhani] bg-[#020408] text-slate-200 relative overflow-hidden">
      
      {/* Background Deep Ocean Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020408] to-black pointer-events-none"></div>
      
      {/* 3D GLOBE LAYER (Absolute Centered) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          {/* We make the 3D container full screen but behind UI */}
          <div className="w-full h-full opacity-80">
             <ThreeScene type="globe-fleet" color="#3b82f6" />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </div>
      </div>

      {/* HEADER (Floating) */}
      <div className="relative z-10 flex items-start justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Globe size={14} className="animate-spin-slow" /> Global Logistics Command
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 text-shadow-glow">
             全球远洋船队 <span className="text-blue-500">监控驾驶舱</span>
          </h1>
        </div>
        
        {/* Global KPIs Panel */}
        <div className="flex gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-3 rounded-lg shadow-lg">
            <div className="text-center px-4 border-r border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Active Vessels</div>
                <div className="text-2xl font-bold text-white">{metrics.activeShips}</div>
            </div>
            <div className="text-center px-4 border-r border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Capacity (TEU)</div>
                <div className="text-2xl font-bold text-blue-400">{(metrics.totalTEU/1000).toFixed(1)}k</div>
            </div>
            <div className="text-center px-4 border-r border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">On-Time %</div>
                <div className="text-2xl font-bold text-green-400">{metrics.onTimeRate.toFixed(1)}%</div>
            </div>
            <div className="text-center px-4">
                <div className="text-[10px] text-slate-400 uppercase">CO₂ Saved</div>
                <div className="text-2xl font-bold text-green-500">{metrics.carbonSaved.toFixed(0)} t</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT LAYER (Floating Panels) */}
      <div className="relative flex-1 flex gap-6 p-4 min-h-0 z-10 pointer-events-none">
          
          {/* LEFT: Fleet List & Search (Pointer events enabled) */}
          <div className="w-[320px] flex flex-col gap-4 pointer-events-auto">
              
              <SciFiCard title="船队列表" subtitle="FLEET INDEX" className="h-full border-blue-900/50 bg-[#0b1121]/80 backdrop-blur-md">
                  <div className="flex flex-col h-full">
                      {/* Search Bar */}
                      <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input 
                            type="text" 
                            placeholder="Search vessel by name or IMO..." 
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                          />
                      </div>

                      {/* List */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                          {FLEET_LIST.map(ship => (
                              <div 
                                key={ship.id}
                                onClick={() => setSelectedShip(ship)}
                                className={`p-3 rounded border cursor-pointer transition-all hover:translate-x-1
                                    ${selectedShip.id === ship.id 
                                        ? 'bg-blue-900/40 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'}
                                `}
                              >
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-sm flex items-center gap-2">
                                          <Ship size={12} className={selectedShip.id === ship.id ? 'text-blue-400' : 'text-slate-500'} />
                                          {ship.name}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                          ${ship.status === 'Underway' ? 'bg-green-900/30 text-green-400' : 
                                            ship.status === 'Anchored' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}
                                      `}>{ship.status}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] opacity-80">
                                      <span>To: {ship.dest}</span>
                                      <span>ETA: {ship.eta}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Spacer for Globe Visibility */}
          <div className="flex-1"></div>

          {/* RIGHT: Vessel Detail & Analytics (Pointer events enabled) */}
          <div className="w-[360px] flex flex-col gap-4 pointer-events-auto">
              
              {/* Selected Ship Detail */}
              <SciFiCard title="单船实时详情" subtitle={selectedShip.id} subtitleIsCode className="border-blue-900/50 bg-[#0b1121]/80 backdrop-blur-md">
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                          <div>
                              <div className="text-xl font-bold text-white">{selectedShip.name}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1"><Navigation size={10}/> 34.54°N, 135.45°E</div>
                          </div>
                          <div className="text-right">
                              <div className="text-2xl font-mono font-bold text-blue-400">18.5 <span className="text-sm text-slate-500">kn</span></div>
                              <div className="text-[10px] text-slate-500">SOG Speed</div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                              <div className="text-[10px] text-slate-500 uppercase">Heading</div>
                              <div className="text-lg font-mono text-white flex items-center gap-2">
                                  <Navigation size={14} className="rotate-45 text-blue-500" /> 245°
                              </div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                              <div className="text-[10px] text-slate-500 uppercase">Load Factor</div>
                              <div className="text-lg font-mono text-white flex items-center gap-2">
                                  <Package size={14} className="text-blue-500" /> {selectedShip.load}%
                              </div>
                          </div>
                      </div>

                      <div className="h-32 w-full">
                          <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                              <span>Cargo Composition</span>
                              <span>Total: 8,400 TEU</span>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={CARGO_DIST}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={40}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {CARGO_DIST.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px'}} />
                                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '9px'}} iconSize={8} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </SciFiCard>

              {/* Voyage Analytics */}
              <SciFiCard title="航程能效分析" subtitle="EEXI / CII" className="flex-1 border-blue-900/50 bg-[#0b1121]/80 backdrop-blur-md">
                  <div className="flex flex-col h-full gap-4">
                      <div className="flex-1 min-h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={FUEL_EFFICIENCY}>
                                  <defs>
                                      <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis dataKey="hour" hide />
                                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6'}} />
                                  <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#colorFuel)" name="Fuel Consumption" />
                                  <Line type="monotone" dataKey="optimal" stroke="#10b981" strokeDasharray="5 5" dot={false} name="Optimal" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
                              <span className="text-yellow-200 flex items-center gap-2"><AlertTriangle size={12}/> Weather Alert</span>
                              <span>Typhoon "Khanun" nearby</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2 bg-green-900/10 border border-green-900/30 rounded">
                              <span className="text-green-200 flex items-center gap-2"><Zap size={12}/> Carbon Rating</span>
                              <span>Grade B+ (Compliant)</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>

      {/* BOTTOM DOCK (Timeline & Alerts) */}
      <div className="relative z-10 px-4 pb-4 pointer-events-auto">
          <div className="bg-[#0b1121]/90 backdrop-blur-md border border-slate-700 rounded-lg p-3 flex gap-6 items-center">
              
              {/* Timeline Graphic */}
              <div className="flex-1 flex items-center gap-2">
                  <div className="text-xs font-bold text-slate-400 w-16">VOYAGE<br/>TIMELINE</div>
                  <div className="flex-1 relative h-12 flex items-center">
                      <div className="absolute left-0 right-0 h-1 bg-slate-700 rounded"></div>
                      <div className="absolute left-0 w-[60%] h-1 bg-blue-500 rounded shadow-[0_0_10px_blue]"></div>
                      
                      {ROUTE_EVENTS.map((evt, i) => (
                          <div key={i} className="absolute flex flex-col items-center" style={{left: `${20 + i*25}%`}}>
                              <div className={`w-3 h-3 rounded-full border-2 bg-[#0b1121] z-10 
                                  ${evt.status === 'Done' ? 'border-green-500 bg-green-500' : 
                                    evt.status === 'Active' ? 'border-blue-400 animate-ping' : 'border-slate-500'}
                              `}></div>
                              <div className="mt-2 text-[10px] text-slate-300 whitespace-nowrap">{evt.event}</div>
                              <div className="text-[8px] text-slate-500">{evt.time}</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 border-l border-slate-700 pl-6">
                  <button className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
                      <div className="p-2 rounded-full bg-slate-800 mb-1"><Radio size={16}/></div>
                      Sat-Com
                  </button>
                  <button className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
                      <div className="p-2 rounded-full bg-slate-800 mb-1"><Activity size={16}/></div>
                      Diagnostics
                  </button>
              </div>

          </div>
      </div>

    </div>
  );
};
