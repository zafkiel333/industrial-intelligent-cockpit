import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, LineChart, Line, ComposedChart, ReferenceLine, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Shield, Navigation, Anchor, Siren, Radio, 
  MapPin, Wind, Ship, AlertOctagon, Scan, 
  Target, Globe, Bell, Activity, Waves, AlertTriangle
} from 'lucide-react';

// --- MOCK DATA ---

const AIS_TARGETS = [
  { mmsi: '413456789', name: 'HUAYUN 88', type: 'Cargo', speed: 12.5, status: 'Underway' },
  { mmsi: '412334455', name: 'DONG FANG 1', type: 'Tanker', speed: 0.0, status: 'Anchored' },
  { mmsi: '413998877', name: 'YUAN YANG', type: 'Fishing', speed: 8.2, status: 'Restricted' },
  { mmsi: '414556622', name: 'HAI XUN 01', type: 'Law Enf', speed: 22.0, status: 'Patrol' },
  { mmsi: '413112233', name: 'MSC IRIS', type: 'Container', speed: 14.8, status: 'Underway' },
];

const TRAFFIC_DENSITY = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    inbound: 15 + Math.floor(Math.random() * 10) + (i > 8 && i < 18 ? 10 : 0),
    outbound: 12 + Math.floor(Math.random() * 8) + (i > 9 && i < 19 ? 8 : 0)
}));

const VIOLATION_STATS = [
    { name: 'Overspeed', value: 45, fill: '#ef4444' },
    { name: 'Route Dev', value: 25, fill: '#f59e0b' },
    { name: 'Anchoring', value: 15, fill: '#3b82f6' },
    { name: 'No AIS', value: 15, fill: '#64748b' }
];

const PATROL_RESOURCES = [
    { id: 'P-01', name: '海巡01', status: 'Patrolling', zone: 'Zone A', fuel: 85 },
    { id: 'P-02', name: '海巡02', status: 'Standby', zone: 'Base', fuel: 98 },
    { id: 'H-01', name: 'Rescue Helo', status: 'Maintenance', zone: 'Hangar', fuel: 0 },
    { id: 'D-05', name: 'Drone Unit', status: 'Active', zone: 'Zone C', fuel: 42 },
];

export const MaritimeSafetyView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    activeVessels: 142,
    safetyIndex: 96.5,
    alertsToday: 5,
    weatherRisk: 'Low',
    vtsLoad: 45 // %
  });

  const [alerts, setAlerts] = useState([
      { time: '10:45', msg: 'Vessel 413... entered restricted zone', type: 'Warn' },
      { time: '09:30', msg: 'Overspeed detected in Channel A', type: 'Alert' },
      { time: '08:15', msg: 'Low visibility warning issued', type: 'Info' }
  ]);

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            ...prev,
            activeVessels: 140 + Math.floor(Math.random() * 10),
            vtsLoad: 45 + Math.floor(Math.random() * 10)
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020617] text-blue-50 relative overflow-hidden">
      
      {/* Radar Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-blue-800/50 pb-4 px-2 bg-gradient-to-r from-blue-950/90 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Shield size={14} className="animate-pulse" /> Maritime Safety Administration (MSA)
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             水上交通安全 <span className="text-blue-500">监管驾驶舱</span>
          </h1>
        </div>
        
        {/* Top Stats */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Ship size={10}/> Active Targets</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.activeVessels}</div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Safety Index</div>
                <div className={`text-2xl font-mono font-bold ${metrics.safetyIndex > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {metrics.safetyIndex}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><AlertOctagon size={10}/> Alerts Today</div>
                <div className="text-2xl font-mono font-bold text-red-400">{metrics.alertsToday}</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Surveillance List & Patrol */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="AIS 实时目标列表" subtitle="VESSEL TRACKING" className="flex-1 border-blue-900/50">
                  <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                      {AIS_TARGETS.map((v, i) => (
                          <div key={i} className="bg-slate-900/40 border border-slate-800 p-2 rounded hover:border-blue-500/30 transition-colors cursor-pointer group">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white flex items-center gap-2">
                                      <Ship size={12} className="text-blue-400" />
                                      {v.name}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold
                                      ${v.status === 'Patrol' ? 'bg-blue-600 text-white' : 
                                        v.status === 'Restricted' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}
                                  `}>
                                      {v.status}
                                  </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                  <div className="font-mono">MMSI: {v.mmsi}</div>
                                  <div className="text-right"><span className="text-white">{v.speed.toFixed(1)}</span> kn</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

              <SciFiCard title="巡航执法力量" subtitle="RESOURCES" className="h-[200px] border-blue-900/50">
                  <div className="space-y-3 h-full overflow-y-auto pr-1">
                      {PATROL_RESOURCES.map((res, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-slate-900/30 border border-slate-800 rounded">
                              <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-full ${res.status === 'Patrol' || res.status === 'Active' ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                      <Navigation size={12} />
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-white">{res.name}</div>
                                      <div className="text-[9px] text-slate-500">{res.zone}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] text-slate-400">{res.status}</div>
                                  <div className="w-12 h-1 bg-slate-800 rounded-full mt-1">
                                      <div className="h-full bg-blue-500" style={{width: `${res.fuel}%`}}></div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D VTS Radar */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#02040a] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] group">
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Scan size={16} className="text-blue-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Radar Coverage</div>
                              <div className="text-sm font-bold text-white">100% / 24nm</div>
                          </div>
                      </div>
                  </div>

                  {/* Weather Status */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-slate-700">
                          <Wind size={12} className="text-blue-300"/> 12.5 m/s NE
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-slate-700">
                          <Waves size={12} className="text-blue-300"/> Sig. Wave: 1.2m
                      </div>
                  </div>

                  {/* 3D Scene */}
                  <ThreeScene type="maritime-safety-cockpit" color="#3b82f6" />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-blue-900 text-[10px] text-slate-300 flex gap-3">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Target</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Patrol</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Restricted</div>
                  </div>
              </div>

              {/* Traffic Analysis Chart */}
              <SciFiCard title="航道交通流量分析" subtitle="24H TREND" className="h-[240px] border-blue-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={TRAFFIC_DENSITY}>
                              <defs>
                                  <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  </linearGradient>
                                  <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', color: '#fff'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              <Bar dataKey="inbound" name="Inbound (进港)" fill="url(#gradIn)" stackId="a" />
                              <Bar dataKey="outbound" name="Outbound (出港)" fill="url(#gradOut)" stackId="a" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Risks & Alerts */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Risk/Violation Breakdown */}
              <SciFiCard title="违章行为分析" subtitle="VIOLATIONS" className="h-[250px] border-blue-900/50">
                  <div className="flex items-center h-full">
                      <div className="w-1/2 h-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={VIOLATION_STATS}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    {VIOLATION_STATS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <AlertTriangle size={24} className="text-yellow-500 opacity-50" />
                          </div>
                      </div>
                      <div className="w-1/2 flex flex-col justify-center gap-2 text-xs">
                          {VIOLATION_STATS.map((s, i) => (
                              <div key={i} className="flex justify-between items-center pr-2">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.fill}}></div>
                                      <span className="text-slate-300">{s.name}</span>
                                  </div>
                                  <span className="font-mono text-white">{s.value}%</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

              {/* Alert Log */}
              <SciFiCard title="预警日志" subtitle="LOGS" className="flex-1 border-blue-900/50">
                  <div className="flex flex-col gap-2 h-full">
                      {alerts.map((alert, i) => (
                          <div key={i} className="p-2 border-l-2 border-slate-700 bg-slate-900/30 rounded flex flex-col gap-1 hover:bg-slate-900/60 transition-colors">
                              <div className="flex justify-between items-center">
                                  <span className={`text-[10px] font-bold px-1.5 rounded uppercase
                                      ${alert.type === 'Alert' ? 'bg-red-900/40 text-red-400' : 
                                        alert.type === 'Warn' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'}
                                  `}>{alert.type}</span>
                                  <span className="text-[10px] text-slate-500">{alert.time}</span>
                              </div>
                              <div className="text-xs text-slate-300 line-clamp-2">{alert.msg}</div>
                          </div>
                      ))}
                      <div className="mt-auto pt-2 border-t border-slate-800">
                          <button className="w-full py-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 text-xs rounded border border-blue-900/50 flex items-center justify-center gap-2 transition-colors">
                              <Bell size={12} /> View All Events
                          </button>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};