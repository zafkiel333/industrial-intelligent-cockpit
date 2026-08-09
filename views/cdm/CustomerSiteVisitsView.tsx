
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  MapPin, Navigation, Clock, User, 
  Calendar, CheckCircle2, XCircle, AlertTriangle, 
  Camera, FileText, Footprints, Route, 
  LocateFixed, Smartphone, Briefcase, ChevronRight,
  Filter, Search, GripHorizontal
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';

// --- Types ---

type VisitStatus = 'Planned' | 'In Progress' | 'Completed' | 'Missed' | 'Late';
type ValidationStatus = 'Valid' | 'Offset' | 'Invalid'; // Geofence check

interface VisitRecord {
  id: string;
  agentName: string;
  customerName: string;
  planTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: string;
  location: string;
  coordinates: { x: number; y: number }; // Simulated map coordinates (0-100)
  targetCoordinates: { x: number; y: number };
  status: VisitStatus;
  validation: ValidationStatus;
  distance: number; // meters from target
  notes?: string;
  photos: number;
}

// --- Mock Data ---

const VISITS: VisitRecord[] = [
  { 
    id: 'VST-240320-01', agentName: 'Alex Zhang', customerName: 'Shanghai Heavy Ind.', 
    planTime: '09:00', checkInTime: '08:55', checkOutTime: '10:30', duration: '1h 35m',
    location: 'Pudong, Shanghai', coordinates: { x: 72, y: 45 }, targetCoordinates: { x: 70, y: 45 },
    status: 'Completed', validation: 'Valid', distance: 45, photos: 3
  },
  { 
    id: 'VST-240320-02', agentName: 'Sarah Li', customerName: 'Pacific Power HQ', 
    planTime: '10:30', checkInTime: '10:45', checkOutTime: '11:20', duration: '35m',
    location: 'Beijing CBD', coordinates: { x: 30, y: 20 }, targetCoordinates: { x: 30, y: 20 },
    status: 'Completed', validation: 'Valid', distance: 10, photos: 1
  },
  { 
    id: 'VST-240320-03', agentName: 'Mike Wang', customerName: 'AutoWorks Factory', 
    planTime: '11:00', checkInTime: '11:10', location: 'Wuhan Zone B', 
    coordinates: { x: 50, y: 60 }, targetCoordinates: { x: 52, y: 58 },
    status: 'In Progress', validation: 'Offset', distance: 350, photos: 2
  },
  { 
    id: 'VST-240320-04', agentName: 'Alex Zhang', customerName: 'Quantum Tech', 
    planTime: '14:00', location: 'Zhangjiang Hi-Tech', 
    coordinates: { x: 65, y: 55 }, targetCoordinates: { x: 65, y: 55 },
    status: 'Planned', validation: 'Valid', distance: 0, photos: 0
  },
  { 
    id: 'VST-240320-05', agentName: 'David Chen', customerName: 'North Star Logistics', 
    planTime: '09:30', checkInTime: '09:40', checkOutTime: '09:45', duration: '5m',
    location: 'Logistics Park A', coordinates: { x: 80, y: 80 }, targetCoordinates: { x: 20, y: 20 }, // Huge discrepancy
    status: 'Completed', validation: 'Invalid', distance: 5400, photos: 0, notes: 'System flagged: Location mismatch'
  },
];

const VISIT_STATS = [
  { label: 'Planned Visits', value: 42, color: '#94a3b8' },
  { label: 'Completed', value: 28, color: '#10b981' },
  { label: 'In Progress', value: 8, color: '#0ea5e9' },
  { label: 'Abnormal', value: 3, color: '#ef4444' },
];

const WEEKLY_TREND = [
  { day: 'Mon', visits: 45, distance: 320 },
  { day: 'Tue', visits: 52, distance: 410 },
  { day: 'Wed', visits: 48, distance: 380 },
  { day: 'Thu', visits: 60, distance: 520 },
  { day: 'Fri', visits: 35, distance: 290 },
  { day: 'Sat', visits: 12, distance: 80 },
  { day: 'Sun', visits: 5, distance: 30 },
];

// --- Sub-Components ---

const GeoMap = ({ visits, activeId, onSelect }: { visits: VisitRecord[], activeId: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#050810] rounded overflow-hidden border border-teal-900/30">
      {/* Grid Background */}
      <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#0f766e 1px, transparent 1px), linear-gradient(90deg, #0f766e 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15
      }}></div>
      
      {/* Map Content */}
      <svg className="w-full h-full absolute inset-0">
         {/* Render Connections (Routes) - Simplified as straight lines for active agent */}
         {/* In a real app, this would be polylines based on time */}
         
         {/* Visit Points */}
         {visits.map((visit) => {
            const isActive = activeId === visit.id;
            return (
              <g 
                key={visit.id} 
                onClick={() => onSelect(visit.id)}
                className="cursor-pointer transition-opacity duration-300 hover:opacity-100"
                style={{ opacity: isActive ? 1 : 0.6 }}
              >
                 {/* Target Zone (Geofence) */}
                 <circle 
                   cx={`${visit.targetCoordinates.x}%`} cy={`${visit.targetCoordinates.y}%`} 
                   r="15" fill="none" stroke="#0d9488" strokeWidth="1" strokeDasharray="4 2" 
                   className={isActive ? 'animate-spin-slow' : ''}
                   style={{ animationDuration: '10s' }}
                 />
                 
                 {/* Actual Check-in Point */}
                 {visit.status !== 'Planned' && (
                    <circle 
                      cx={`${visit.coordinates.x}%`} cy={`${visit.coordinates.y}%`} 
                      r="4" 
                      fill={visit.validation === 'Invalid' ? '#ef4444' : visit.validation === 'Offset' ? '#f59e0b' : '#10b981'} 
                      stroke="#fff" strokeWidth="1"
                    />
                 )}

                 {/* Label */}
                 {isActive && (
                   <g>
                     <rect x={`${visit.targetCoordinates.x + 2}%`} y={`${visit.targetCoordinates.y - 5}%`} width="120" height="40" fill="rgba(0,0,0,0.8)" rx="4" stroke="#0d9488" />
                     <text x={`${visit.targetCoordinates.x + 5}%`} y={`${visit.targetCoordinates.y - 2}%`} fill="white" fontSize="10" fontWeight="bold">
                       {visit.customerName}
                     </text>
                     <text x={`${visit.targetCoordinates.x + 5}%`} y={`${visit.targetCoordinates.y + 1}%`} fill="#ccc" fontSize="8">
                       Agent: {visit.agentName}
                     </text>
                   </g>
                 )}
              </g>
            );
         })}
      </svg>
      
      <div className="absolute bottom-4 left-4 p-2 bg-black/60 backdrop-blur rounded border border-teal-900/50 flex flex-col gap-1">
         <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Valid Check-in
         </div>
         <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Range Warning
         </div>
         <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> Location Mismatch
         </div>
      </div>
    </div>
  );
};

const ValidationRadar = ({ visit }: { visit: VisitRecord }) => {
  const maxDist = 500; // 500m geofence range visual
  const normalizedDist = Math.min(visit.distance, maxDist);
  const percent = (normalizedDist / maxDist) * 100;
  
  return (
    <div className="relative w-full h-32 flex items-center justify-center bg-[#0b1221] rounded border border-slate-800">
       {/* Radar Rings */}
       <div className="absolute w-24 h-24 rounded-full border border-slate-700/50"></div>
       <div className="absolute w-16 h-16 rounded-full border border-teal-500/30 bg-teal-500/5"></div>
       <div className="absolute w-1 h-1 bg-white rounded-full"></div>
       
       {/* User Dot */}
       {visit.status !== 'Planned' && (
         <div 
           className={`absolute w-3 h-3 rounded-full border-2 border-black shadow-lg transition-all duration-1000
             ${visit.validation === 'Valid' ? 'bg-green-500' : 'bg-red-500'}
           `}
           style={{ transform: `translate(${percent * 0.5}px, -${percent * 0.5}px)` }}
         ></div>
       )}
       
       <div className="absolute bottom-1 right-2 text-[10px] font-mono">
         <span className="text-slate-500">Dev:</span> 
         <span className={visit.distance > 100 ? 'text-red-400' : 'text-green-400'}> {visit.distance}m</span>
       </div>
       <div className="absolute top-1 left-2 text-[9px] text-slate-500 uppercase tracking-widest">Geofence Monitor</div>
    </div>
  );
};

export const CustomerSiteVisitsView: React.FC = () => {
  const [selectedVisitId, setSelectedVisitId] = useState(VISITS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeVisit = VISITS.find(v => v.id === selectedVisitId) || VISITS[0];

  const filteredVisits = VISITS.filter(v => 
    v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-teal-900/50 pb-4 bg-gradient-to-r from-[#031c1a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
             <MapPin size={14} /> Field Operations
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             客户现场拜访 <span className="text-teal-500">与签到记录</span>
          </h1>
        </div>
        
        <div className="flex gap-6 items-center">
             {VISIT_STATS.map((stat, i) => (
               <div key={i} className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
                  <div className="text-xl font-mono font-bold" style={{color: stat.color}}>{stat.value}</div>
               </div>
             ))}
             <div className="h-8 w-px bg-slate-700 mx-2"></div>
             <button className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <Navigation size={14} /> 实时调度
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Visit Feed */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Search & Filter */}
           <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search agent, customer..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-teal-500 text-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-400">
                  <Filter size={14} />
               </button>
           </div>

           {/* Timeline Feed */}
           <div className="flex flex-col gap-0 relative">
               {/* Timeline Line */}
               <div className="absolute left-3 top-4 bottom-4 w-px bg-slate-800"></div>

               {filteredVisits.map((visit) => (
                   <div 
                     key={visit.id}
                     onClick={() => setSelectedVisitId(visit.id)}
                     className={`relative pl-8 py-3 cursor-pointer group transition-all duration-300
                        ${selectedVisitId === visit.id ? 'bg-teal-900/10' : 'hover:bg-slate-900/30'}
                     `}
                   >
                       {/* Timeline Node */}
                       <div className={`absolute left-[7px] top-4 w-2.5 h-2.5 rounded-full border-2 z-10 bg-[#020617]
                          ${visit.status === 'Completed' ? 'border-green-500' : 
                            visit.status === 'In Progress' ? 'border-blue-500 animate-pulse' : 
                            visit.status === 'Missed' ? 'border-red-500' : 'border-slate-500'}
                       `}></div>

                       <div className={`p-3 rounded border transition-all
                          ${selectedVisitId === visit.id 
                              ? 'border-teal-500/50 bg-teal-950/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                              : 'border-slate-800 bg-slate-900/40 group-hover:border-slate-600'}
                       `}>
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex flex-col">
                                   <span className="text-[10px] font-mono text-slate-500">{visit.planTime}</span>
                                   <h4 className="text-sm font-bold text-slate-200 group-hover:text-white">{visit.customerName}</h4>
                               </div>
                               <div className="flex flex-col items-end">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                                        ${visit.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 
                                          visit.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400' : 
                                          'bg-slate-800 text-slate-400'}
                                    `}>
                                        {visit.status}
                                    </span>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-2 mb-2">
                               <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                   {visit.agentName.charAt(0)}
                               </div>
                               <span className="text-xs text-slate-400">{visit.agentName}</span>
                           </div>

                           <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                               <span className="flex items-center gap-1"><MapPin size={10}/> {visit.location}</span>
                               {visit.checkInTime && <span className="flex items-center gap-1 text-teal-400"><CheckCircle2 size={10}/> {visit.checkInTime}</span>}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Map & Analytics */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Geo-Spatial Map */}
           <SciFiCard title="外勤轨迹监控 (Geo-Tracking)" subtitle="LIVE MAP" className="h-[400px] border-teal-900/50 bg-[#020408]" noPadding>
               <div className="w-full h-full p-2 relative">
                   <GeoMap visits={filteredVisits} activeId={selectedVisitId} onSelect={setSelectedVisitId} />
                   
                   {/* Map Controls */}
                   <div className="absolute top-4 right-4 flex flex-col gap-2">
                       <button className="p-2 bg-slate-800/80 hover:bg-teal-900/80 rounded border border-slate-600 text-slate-300 transition-colors">
                           <LocateFixed size={16} />
                       </button>
                       <button className="p-2 bg-slate-800/80 hover:bg-teal-900/80 rounded border border-slate-600 text-slate-300 transition-colors">
                           <Route size={16} />
                       </button>
                   </div>
               </div>
           </SciFiCard>

           {/* Stats & Trends */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
               
               <SciFiCard title="周拜访效能趋势" subtitle="EFFICIENCY" className="border-slate-800">
                   <div className="w-full h-full p-2">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={WEEKLY_TREND} margin={{top:10, right:10, left:0, bottom:0}}>
                               <defs>
                                   <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="day" stroke="#64748b" tick={{fontSize: 10}} />
                               <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0d9488', fontSize: '12px'}} />
                               <Area type="monotone" dataKey="visits" stroke="#0d9488" strokeWidth={2} fill="url(#colorVisits)" name="Visits" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </SciFiCard>

               <SciFiCard title="签到异常分析" subtitle="VALIDATION" className="border-slate-800">
                   <div className="flex items-center h-full gap-4 px-2">
                       <div className="flex-1 space-y-3">
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-400">Valid Check-ins</span>
                               <span className="text-green-400 font-bold">85%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-green-500 h-full" style={{width: '85%'}}></div>
                           </div>
                           
                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-400">Range Offset</span>
                               <span className="text-yellow-400 font-bold">12%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-yellow-500 h-full" style={{width: '12%'}}></div>
                           </div>

                           <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-400">Fake Location</span>
                               <span className="text-red-400 font-bold">3%</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-red-500 h-full" style={{width: '3%'}}></div>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

        {/* RIGHT COLUMN: Visit Details */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6 overflow-y-auto pr-1">
           
           {/* Detailed Card */}
           <SciFiCard title="拜访详情档案" subtitle="DETAILS" className="flex-1 border-teal-900/50">
               <div className="flex flex-col gap-4">
                   
                   {/* Identity */}
                   <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
                       <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                           <Briefcase size={20} className="text-teal-500" />
                       </div>
                       <div>
                           <h3 className="text-sm font-bold text-white">{activeVisit.customerName}</h3>
                           <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                               <User size={10} /> Agent: {activeVisit.agentName}
                           </div>
                       </div>
                   </div>

                   {/* Validation Status */}
                   <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-slate-400 font-bold uppercase">Check-in Validation</span>
                           {activeVisit.validation === 'Valid' ? <CheckCircle2 size={14} className="text-green-500"/> : <AlertTriangle size={14} className="text-red-500"/>}
                       </div>
                       <ValidationRadar visit={activeVisit} />
                   </div>

                   {/* Time & Metrics */}
                   <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 bg-slate-900/30 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Check In</div>
                           <div className="text-sm font-mono text-white">{activeVisit.checkInTime || '--:--'}</div>
                       </div>
                       <div className="p-2 bg-slate-900/30 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Check Out</div>
                           <div className="text-sm font-mono text-white">{activeVisit.checkOutTime || '--:--'}</div>
                       </div>
                       <div className="p-2 bg-slate-900/30 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Duration</div>
                           <div className="text-sm font-mono text-teal-400">{activeVisit.duration || '-'}</div>
                       </div>
                       <div className="p-2 bg-slate-900/30 rounded border border-slate-800">
                           <div className="text-[10px] text-slate-500">Photos</div>
                           <div className="text-sm font-mono text-white flex items-center gap-1">
                               <Camera size={12} /> {activeVisit.photos}
                           </div>
                       </div>
                   </div>

                   {/* Notes Area */}
                   <div className="flex-1 bg-slate-950/50 rounded border border-slate-800 p-3 min-h-[100px]">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Visit Notes / Feedback</div>
                       <p className="text-xs text-slate-300 leading-relaxed">
                           {activeVisit.notes || 'No specific notes recorded for this visit. Standard check-in procedure followed.'}
                       </p>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-2 mt-auto">
                       <button className="flex-1 py-2 bg-teal-900/20 hover:bg-teal-900/40 text-teal-300 border border-teal-500/30 rounded text-xs transition-colors">
                           View Report
                       </button>
                       <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs transition-colors">
                           Verify Loc
                       </button>
                   </div>
               </div>
           </SciFiCard>

        </div>

      </div>
    </div>
  );
};
