
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Truck, Ship, Plane, Package, MapPin, 
  Clock, CheckCircle2, AlertTriangle, 
  Navigation, Calendar, FileText, Search,
  ArrowRight, Thermometer, Activity, Box,
  MoreVertical, Globe, ShieldCheck, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';

// --- Types ---

type TransportMode = 'Sea' | 'Air' | 'Road' | 'Rail';
type Status = 'In Transit' | 'Customs' | 'Delivered' | 'Exception' | 'Pending';

interface Shipment {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  status: Status;
  eta: string;
  progress: number; // 0-100%
  carrier: string;
  coordinates: { x: number; y: number }; // Percentage on map
  temp?: number; // Cold chain monitoring
  shock?: number; // G-force monitoring
}

interface TimelineEvent {
  time: string;
  location: string;
  status: string;
  desc: string;
  icon: any;
}

// --- Mock Data ---

const SHIPMENTS: Shipment[] = [
  { id: 'SHP-2403-001', customer: 'Shanghai Heavy Ind.', origin: 'Shanghai, CN', destination: 'Rotterdam, NL', mode: 'Sea', status: 'In Transit', eta: '2024-04-15', progress: 45, carrier: 'Maersk', coordinates: { x: 60, y: 45 }, temp: 18, shock: 0.2 },
  { id: 'SHP-2403-005', customer: 'Pacific Power Group', origin: 'Beijing, CN', destination: 'Tokyo, JP', mode: 'Air', status: 'Customs', eta: '2024-03-22', progress: 80, carrier: 'Air China Cargo', coordinates: { x: 85, y: 35 }, temp: 22, shock: 0.1 },
  { id: 'SHP-2403-012', customer: 'AutoWorks GmbH', origin: 'Shenzhen, CN', destination: 'Munich, DE', mode: 'Rail', status: 'Exception', eta: '2024-03-30', progress: 30, carrier: 'CR Express', coordinates: { x: 40, y: 30 }, temp: -2, shock: 1.5 },
  { id: 'SHP-2403-018', customer: 'Quantum Tech', origin: 'Chengdu, CN', destination: 'San Francisco, US', mode: 'Air', status: 'In Transit', eta: '2024-03-24', progress: 60, carrier: 'FedEx', coordinates: { x: 20, y: 40 }, temp: 20, shock: 0.5 },
  { id: 'SHP-2403-022', customer: 'Domestic Retail Co.', origin: 'Wuhan, CN', destination: 'Guangzhou, CN', mode: 'Road', status: 'Delivered', eta: '2024-03-20', progress: 100, carrier: 'SF Express', coordinates: { x: 75, y: 60 }, temp: 24, shock: 0.8 },
];

const EVENTS_LOG: TimelineEvent[] = [
  { time: 'Mar 20, 14:30', location: 'Singapore Strait', status: 'In Transit', desc: 'Vessel passed waypoint SG-04. Speed 14kn.', icon: Navigation },
  { time: 'Mar 19, 08:00', location: 'Shanghai Port', status: 'Departed', desc: 'Container loaded onto vessel.', icon: Ship },
  { time: 'Mar 18, 16:45', location: 'Shanghai Warehouse', status: 'Picked Up', desc: 'Goods received from factory.', icon: Box },
  { time: 'Mar 18, 09:00', location: 'System', status: 'Created', desc: 'Shipping order generated.', icon: FileText },
];

const SENSOR_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 18 + Math.random() * 2,
  humidity: 45 + Math.random() * 10,
  shock: Math.random() * 0.5
}));

// --- Helper Components ---

const ModeIcon = ({ mode }: { mode: TransportMode }) => {
  switch (mode) {
    case 'Sea': return <Ship size={14} className="text-blue-400" />;
    case 'Air': return <Plane size={14} className="text-cyan-400" />;
    case 'Road': return <Truck size={14} className="text-green-400" />;
    case 'Rail': return <div className="text-amber-400 text-[10px] font-bold border border-amber-500 rounded px-1">RAIL</div>;
    default: return <Package size={14} />;
  }
};

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    'In Transit': 'bg-blue-900/40 text-blue-300 border-blue-500/50',
    'Customs': 'bg-purple-900/40 text-purple-300 border-purple-500/50',
    'Delivered': 'bg-green-900/40 text-green-300 border-green-500/50',
    'Exception': 'bg-red-900/40 text-red-300 border-red-500/50 animate-pulse',
    'Pending': 'bg-slate-800 text-slate-400 border-slate-600',
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${styles}`}>
      {status === 'Exception' && <AlertTriangle size={10} />}
      {status}
    </span>
  );
};

// --- Main View ---

export const CustomerDeliveryView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(SHIPMENTS[0].id);
  const [mapZoom, setMapZoom] = useState(1);
  const activeShipment = SHIPMENTS.find(s => s.id === selectedId) || SHIPMENTS[0];

  return (
    <div className="h-full flex flex-col font-[Rajdhani] text-slate-200 relative overflow-hidden bg-[#050810]">
      
      {/* 1. BACKGROUND MAP (Interactive Canvas) */}
      <div className="absolute inset-0 z-0">
         {/* Grid & World Stylized */}
         <div className="w-full h-full opacity-20" style={{
             backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px), linear-gradient(0deg, transparent 95%, #0ea5e9 100%), linear-gradient(90deg, transparent 95%, #0ea5e9 100%)',
             backgroundSize: '40px 40px, 200px 200px, 200px 200px'
         }}></div>
         
         {/* SVG Map Layer */}
         <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* Simple stylized continents outlines could go here, using paths */}
            <path d="M100,100 Q400,50 800,150 T1200,300" fill="none" stroke="#1e293b" strokeWidth="2" />
            <path d="M50,300 Q300,400 600,350 T900,100" fill="none" stroke="#1e293b" strokeWidth="2" />
            
            {/* Shipment Routes */}
            {SHIPMENTS.map(shp => {
               const isActive = shp.id === selectedId;
               return (
                 <g key={shp.id} className="transition-opacity duration-500" style={{opacity: isActive ? 1 : 0.3}}>
                    {/* Route Line (Curved) */}
                    <path 
                      d={`M${shp.coordinates.x * 12},${shp.coordinates.y * 6} Q${(shp.coordinates.x * 12 + 800)/2},${shp.coordinates.y * 6 - 100} 800,200`} 
                      fill="none" 
                      stroke={shp.status === 'Exception' ? '#ef4444' : '#0ea5e9'} 
                      strokeWidth={isActive ? 3 : 1}
                      strokeDasharray="5 5"
                      className="animate-[dash_20s_linear_infinite]"
                    />
                    {/* Current Position Marker */}
                    <circle 
                      cx={`${shp.coordinates.x}%`} 
                      cy={`${shp.coordinates.y}%`} 
                      r={isActive ? 8 : 4} 
                      fill={shp.status === 'Exception' ? '#ef4444' : '#0ea5e9'}
                      className="animate-pulse"
                    />
                    {isActive && (
                       <circle 
                         cx={`${shp.coordinates.x}%`} 
                         cy={`${shp.coordinates.y}%`} 
                         r={20} 
                         fill="none" 
                         stroke={shp.status === 'Exception' ? '#ef4444' : '#0ea5e9'} 
                         className="animate-ping"
                         opacity="0.5"
                       />
                    )}
                 </g>
               );
            })}
         </svg>
      </div>

      {/* 2. Top Header Overlay */}
      <div className="relative z-10 p-4 flex justify-between items-start pointer-events-none">
         <div className="pointer-events-auto">
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider bg-black/40 backdrop-blur px-2 py-1 rounded w-fit border border-cyan-900/50">
               <Globe size={14} /> Global Logistics Command
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
               交付与运输 <span className="text-cyan-500">追踪全景</span>
            </h1>
         </div>
         
         <div className="flex gap-4 pointer-events-auto">
             <div className="bg-black/60 backdrop-blur border border-slate-700 p-3 rounded flex flex-col items-center min-w-[100px]">
                 <span className="text-[10px] text-slate-400 uppercase">On-Time Rate</span>
                 <span className="text-xl font-bold text-green-400">98.2%</span>
             </div>
             <div className="bg-black/60 backdrop-blur border border-slate-700 p-3 rounded flex flex-col items-center min-w-[100px]">
                 <span className="text-[10px] text-slate-400 uppercase">Active Shipments</span>
                 <span className="text-xl font-bold text-white">1,240</span>
             </div>
             <div className="bg-black/60 backdrop-blur border border-red-900/50 p-3 rounded flex flex-col items-center min-w-[100px] animate-pulse-slow">
                 <span className="text-[10px] text-red-300 uppercase">Exceptions</span>
                 <span className="text-xl font-bold text-red-500">3</span>
             </div>
         </div>
      </div>

      {/* 3. Main Content Layer (Floating Panels) */}
      <div className="relative z-10 flex flex-1 p-4 gap-6 overflow-hidden pointer-events-none">
         
         {/* LEFT: Shipment Selector (Floating Sidebar) */}
         <div className="w-[320px] flex flex-col gap-4 pointer-events-auto h-full">
            
            {/* Search Box */}
            <div className="bg-black/70 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Track ID / Container No..." 
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 backdrop-blur border border-slate-800/50 rounded-lg p-2 shadow-2xl">
               <div className="flex flex-col gap-2">
                  {SHIPMENTS.map(shp => (
                     <div 
                       key={shp.id}
                       onClick={() => setSelectedId(shp.id)}
                       className={`p-3 rounded border cursor-pointer transition-all duration-300 group
                          ${selectedId === shp.id 
                              ? 'bg-cyan-950/80 border-cyan-500 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]' 
                              : 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-800 hover:border-slate-500'}
                       `}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-white">{shp.id}</span>
                           <StatusBadge status={shp.status} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                           <span className="truncate max-w-[100px]">{shp.origin}</span>
                           <ArrowRight size={10} className="text-slate-600"/>
                           <span className="truncate max-w-[100px] text-slate-200">{shp.destination}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                           <div className="flex items-center gap-2">
                              <ModeIcon mode={shp.mode} />
                              <span className="text-[10px] text-slate-500">{shp.carrier}</span>
                           </div>
                           <div className="text-[10px] text-slate-400">ETA: {shp.eta}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* CENTER SPACER (Leaves map visible) */}
         <div className="flex-1"></div>

         {/* RIGHT: Detail Inspector (Floating Panel) */}
         <div className="w-[380px] flex flex-col gap-4 pointer-events-auto h-full overflow-y-auto custom-scrollbar">
            
            {/* Primary Status Card */}
            <SciFiCard className="bg-black/70 backdrop-blur border-cyan-900/50 shadow-2xl" noPadding>
               <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <div className="text-[10px] text-cyan-500 uppercase tracking-widest mb-1 font-bold">Active Shipment</div>
                        <h2 className="text-2xl font-bold text-white leading-none">{activeShipment.id}</h2>
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-slate-400">Completion</div>
                        <div className="text-xl font-bold text-cyan-400">{activeShipment.progress}%</div>
                     </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                     <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${activeShipment.status === 'Exception' ? 'bg-red-500' : 'bg-cyan-500'}`} 
                        style={{width: `${activeShipment.progress}%`}}
                     ></div>
                     {/* Checkpoints */}
                     <div className="absolute top-0 left-[25%] w-0.5 h-full bg-black/50"></div>
                     <div className="absolute top-0 left-[50%] w-0.5 h-full bg-black/50"></div>
                     <div className="absolute top-0 left-[75%] w-0.5 h-full bg-black/50"></div>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Customer</div>
                        <div className="text-sm font-bold text-white truncate">{activeShipment.customer}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Carrier</div>
                        <div className="text-sm font-bold text-white truncate">{activeShipment.carrier}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Origin</div>
                        <div className="text-sm font-mono text-slate-300 truncate">{activeShipment.origin}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Destination</div>
                        <div className="text-sm font-mono text-slate-300 truncate">{activeShipment.destination}</div>
                     </div>
                  </div>
               </div>
            </SciFiCard>

            {/* Live Telemetry (Cold Chain / Shock) */}
            <SciFiCard title="货物状态遥测 (Telemetry)" subtitle="LIVE SENSORS" className="bg-black/70 backdrop-blur border-slate-800">
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${activeShipment.temp && activeShipment.temp > 25 ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                        <Thermometer size={18} />
                     </div>
                     <div>
                        <div className="text-[10px] text-slate-500">Temperature</div>
                        <div className="text-lg font-bold text-white">{activeShipment.temp}°C</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${activeShipment.shock && activeShipment.shock > 1.0 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                        <Activity size={18} />
                     </div>
                     <div>
                        <div className="text-[10px] text-slate-500">Shock/G-Force</div>
                        <div className="text-lg font-bold text-white">{activeShipment.shock} g</div>
                     </div>
                  </div>
               </div>
               
               <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={SENSOR_DATA}>
                        <defs>
                           <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3b82f6', fontSize: '12px'}} />
                        <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#colorTemp)" strokeWidth={2} />
                        <Line type="monotone" dataKey="shock" stroke="#ef4444" strokeWidth={1} dot={false} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </SciFiCard>

            {/* Timeline Events */}
            <SciFiCard title="物流轨迹详情 (Timeline)" className="flex-1 bg-black/70 backdrop-blur border-slate-800">
               <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {EVENTS_LOG.map((evt, i) => (
                     <div key={i} className="relative">
                        <div className="absolute -left-[19px] top-1 w-3 h-3 bg-slate-900 border-2 border-cyan-500 rounded-full z-10"></div>
                        <div className="flex flex-col">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-slate-200">{evt.location}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                           </div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] bg-slate-800 px-1.5 rounded text-cyan-400 border border-slate-600">{evt.status}</span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">{evt.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </SciFiCard>

            {/* Document Actions */}
            <div className="flex gap-2">
               <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                  <FileText size={14} /> Waybill
               </button>
               <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> POD
               </button>
            </div>

         </div>

      </div>

      {/* 4. Bottom Ticker (Overlay) */}
      <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur border-t border-slate-800 h-10 flex items-center px-4 overflow-hidden z-20 pointer-events-none">
          <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
              <span className="text-xs text-slate-400 flex items-center gap-2"><Activity size={12} className="text-green-500"/> SYSTEM OPTIMAL</span>
              <span className="text-xs text-slate-400 flex items-center gap-2"><Zap size={12} className="text-yellow-500"/> WEATHER ALERT: TYPHOON IN SOUTH CHINA SEA - DELAYS EXPECTED</span>
              <span className="text-xs text-slate-400 flex items-center gap-2"><Truck size={12} className="text-blue-500"/> ROAD CONGESTION: G4 EXPRESSWAY +2HRS</span>
              <span className="text-xs text-slate-400 flex items-center gap-2"><Ship size={12} className="text-cyan-500"/> PORT CONGESTION: ROTTERDAM +3 DAYS WAIT</span>
          </div>
      </div>

    </div>
  );
};
