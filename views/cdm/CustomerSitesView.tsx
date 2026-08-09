
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Map as MapIcon, Globe, MapPin, Navigation, 
  Wind, CloudRain, Sun, Droplets, 
  Box, Anchor, Pickaxe, Zap,
  Search, Filter, Plus, MoreHorizontal,
  Users, FileText, CheckCircle2, AlertTriangle,
  LayoutGrid, List, TrendingUp, Shield,
  Layers, User, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Types ---

type IndustryType = 'Port' | 'Mine' | 'Energy' | 'Manufacturing';

interface SiteRecord {
  id: string;
  name: string;
  customerName: string;
  industry: IndustryType;
  type: string; // e.g., "Container Terminal", "Open Pit Mine"
  status: 'Operational' | 'Construction' | 'Maintenance' | 'Planning';
  location: string;
  coordinates: string;
  manager: string;
  assetCount: number;
  healthScore: number;
  lastVisit: string;
}

interface SiteStats {
  utilization: number;
  safetyDays: number;
  alertCount: number;
  personnel: number;
}

// --- Mock Data ---

const SITES_DATA: SiteRecord[] = [
  { id: 'SITE-SH-04', name: 'Yangshan Phase IV', customerName: 'Shanghai Port Group', industry: 'Port', type: 'Auto Terminal', status: 'Operational', location: 'Shanghai, CN', coordinates: '30.6°N, 122.0°E', manager: 'Li Wei', assetCount: 145, healthScore: 98, lastVisit: '2024-03-10' },
  { id: 'SITE-NM-02', name: 'Heidaigou Open Pit', customerName: 'Shenhua Group', industry: 'Mine', type: 'Coal Mine', status: 'Operational', location: 'Inner Mongolia, CN', coordinates: '39.8°N, 111.2°E', manager: 'Wang Da', assetCount: 82, healthScore: 92, lastVisit: '2024-02-25' },
  { id: 'SITE-YN-01', name: 'Baihetan Station', customerName: 'Three Gorges Corp', industry: 'Energy', type: 'Hydro Plant', status: 'Maintenance', location: 'Yunnan, CN', coordinates: '27.2°N, 102.9°E', manager: 'Chen Xi', assetCount: 16, healthScore: 88, lastVisit: '2024-03-18' },
  { id: 'SITE-GZ-08', name: 'Nansha Logistics Park', customerName: 'Guangzhou Port', industry: 'Port', type: 'Logistics Hub', status: 'Construction', location: 'Guangzhou, CN', coordinates: '22.6°N, 113.6°E', manager: 'Zhang Min', assetCount: 45, healthScore: 100, lastVisit: '2024-01-15' },
  { id: 'SITE-XJ-05', name: 'Hami Wind Farm', customerName: 'Goldwind Science', industry: 'Energy', type: 'Wind Farm', status: 'Operational', location: 'Xinjiang, CN', coordinates: '42.8°N, 93.5°E', manager: 'Liu Qiang', assetCount: 200, healthScore: 95, lastVisit: '2023-12-20' },
];

const SITE_DETAILS: Record<string, SiteStats> = {
  'SITE-SH-04': { utilization: 85, safetyDays: 1240, alertCount: 3, personnel: 125 },
  'SITE-NM-02': { utilization: 92, safetyDays: 450, alertCount: 8, personnel: 340 },
  'SITE-YN-01': { utilization: 60, safetyDays: 2800, alertCount: 1, personnel: 85 },
  // Default
  'default': { utilization: 75, safetyDays: 365, alertCount: 0, personnel: 50 },
};

const WEATHER_DATA = {
  temp: 18,
  condition: 'Cloudy',
  humidity: 65,
  wind: 12
};

// --- Components ---

const IndustryIcon = ({ type }: { type: IndustryType }) => {
  switch (type) {
    case 'Port': return <Anchor size={14} className="text-blue-400" />;
    case 'Mine': return <Pickaxe size={14} className="text-amber-400" />;
    case 'Energy': return <Zap size={14} className="text-green-400" />;
    default: return <Box size={14} className="text-slate-400" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    'Operational': 'bg-green-900/30 text-green-400 border-green-800/50',
    'Construction': 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    'Maintenance': 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    'Planning': 'bg-slate-800 text-slate-400 border-slate-700',
  }[status] || 'bg-slate-800 text-slate-400';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors}`}>
      {status}
    </span>
  );
};

const StylizedMap = ({ type }: { type: IndustryType }) => {
  // A simplified SVG map representation based on industry
  return (
    <div className="w-full h-full relative bg-[#080c14] overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15
      }}></div>
      
      {/* Dynamic Map Content */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" style={{stroke:'#1e293b', strokeWidth:1}} />
          </pattern>
        </defs>

        {type === 'Port' && (
          <>
            {/* Coastline */}
            <path d="M0,150 Q100,140 200,180 T400,200 T600,150 T800,180 V400 H0 Z" fill="#0c1220" stroke="#1e3a8a" strokeWidth="2" />
            {/* Water */}
            <rect x="0" y="0" width="100%" height="200" fill="#0ea5e9" fillOpacity="0.05" />
            {/* Piers */}
            <rect x="150" y="100" width="40" height="100" fill="#1e293b" stroke="#334155" />
            <rect x="250" y="100" width="40" height="120" fill="#1e293b" stroke="#334155" />
            <rect x="350" y="100" width="40" height="100" fill="#1e293b" stroke="#334155" />
            {/* Cranes (Dots) */}
            <circle cx="170" cy="110" r="4" fill="#f59e0b" className="animate-pulse" />
            <circle cx="270" cy="110" r="4" fill="#f59e0b" />
            <circle cx="370" cy="110" r="4" fill="#f59e0b" />
            {/* Yard Area */}
            <rect x="500" y="250" width="200" height="100" fill="url(#diagonalHatch)" stroke="#334155" />
            <text x="600" y="300" fill="#64748b" textAnchor="middle" fontSize="12">CONTAINER YARD A</text>
          </>
        )}

        {type === 'Mine' && (
          <>
            {/* Pit outline */}
            <path d="M100,50 L700,50 L650,350 L150,350 Z" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="10 5" />
            {/* Terraces */}
            <path d="M150,100 L650,100 L610,300 L190,300 Z" fill="none" stroke="#78350f" strokeWidth="1" />
            <path d="M200,150 L600,150 L570,250 L230,250 Z" fill="#2a1b0a" stroke="#78350f" strokeWidth="1" />
            {/* Roads */}
            <path d="M50,350 Q300,200 650,50" fill="none" stroke="#44403c" strokeWidth="8" />
            {/* Trucks */}
            <circle cx="200" cy="280" r="6" fill="#ef4444" />
            <circle cx="450" cy="180" r="6" fill="#ef4444" />
            <text x="400" y="200" fill="#92400e" textAnchor="middle" fontSize="12">OPEN PIT ZONE 1</text>
          </>
        )}

        {(type === 'Energy' || type === 'Manufacturing') && (
          <>
             {/* Plant Layout */}
             <rect x="200" y="100" width="400" height="200" fill="#0f172a" stroke="#334155" strokeWidth="2" />
             <rect x="220" y="120" width="100" height="80" fill="url(#diagonalHatch)" stroke="#10b981" />
             <rect x="480" y="120" width="100" height="160" fill="url(#diagonalHatch)" stroke="#10b981" />
             <circle cx="380" cy="220" r="30" fill="#0c1220" stroke="#f59e0b" strokeWidth="2" />
             <text x="400" y="350" fill="#64748b" textAnchor="middle" fontSize="12">MAIN PLANT AREA</text>
          </>
        )}
      </svg>

      {/* Map Overlay UI */}
      <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-black/60 backdrop-blur border border-slate-700 rounded px-3 py-1 text-xs text-slate-300 flex items-center gap-2">
              <Globe size={12} /> Satellite
          </div>
          <div className="bg-black/60 backdrop-blur border border-slate-700 rounded px-3 py-1 text-xs text-slate-300 flex items-center gap-2">
              <Layers size={12} /> Layers
          </div>
      </div>
      
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-slate-700 rounded p-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online Asset</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Alarm</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Maintenance</div>
      </div>
    </div>
  );
};

export const CustomerSitesView: React.FC = () => {
  const [selectedSiteId, setSelectedSiteId] = useState('SITE-SH-04');
  const [filterIndustry, setFilterIndustry] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'Map' | 'List'>('Map');

  const selectedSite = SITES_DATA.find(s => s.id === selectedSiteId) || SITES_DATA[0];
  const siteStats = SITE_DETAILS[selectedSiteId] || SITE_DETAILS['default'];

  const filteredSites = SITES_DATA.filter(s => filterIndustry === 'All' || s.industry === filterIndustry);

  // Radar Data for Risk/Health
  const riskData = [
    { subject: 'Safety', A: 95, fullMark: 100 },
    { subject: 'Environment', A: 88, fullMark: 100 },
    { subject: 'Security', A: 92, fullMark: 100 },
    { subject: 'Compliance', A: 100, fullMark: 100 },
    { subject: 'Efficiency', A: siteStats.utilization, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#08182b] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <MapPin size={14} /> Site Archive & Operations
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             项目站点 <span className="text-cyan-500">数字指挥中心</span>
          </h1>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
            <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                <button 
                  onClick={() => setViewMode('Map')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'Map' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('List')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'List' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <List size={16} />
                </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors shadow-lg">
               <Plus size={14} /> 新增站点
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Site Portfolio */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-1 border-r border-slate-800/50">
           
           {/* Filters */}
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {['All', 'Port', 'Mine', 'Energy'].map(type => (
                   <button 
                     key={type}
                     onClick={() => setFilterIndustry(type)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap
                        ${filterIndustry === type 
                            ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50' 
                            : 'bg-slate-900/50 text-slate-500 border-slate-700 hover:border-slate-500'}
                     `}
                   >
                       {type}
                   </button>
               ))}
           </div>

           {/* Search */}
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search sites or projects..." 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-sm py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
              />
           </div>

           {/* Site List */}
           <div className="flex flex-col gap-3">
               {filteredSites.map(site => (
                   <div 
                     key={site.id}
                     onClick={() => setSelectedSiteId(site.id)}
                     className={`p-3 rounded border cursor-pointer transition-all duration-300 relative overflow-hidden group
                        ${selectedSiteId === site.id 
                            ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[inset_4px_0_0_#0ea5e9]' 
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex flex-col">
                               <h3 className={`font-bold text-sm ${selectedSiteId === site.id ? 'text-white' : 'text-slate-300'}`}>{site.name}</h3>
                               <span className="text-[10px] text-slate-500">{site.customerName}</span>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                               <StatusBadge status={site.status} />
                               <IndustryIcon type={site.industry} />
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-400">
                           <div className="flex items-center gap-1"><MapPin size={10}/> {site.location}</div>
                           <div className="flex items-center gap-1 justify-end"><Box size={10}/> {site.assetCount} Assets</div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* CENTER COLUMN: Site Command Center */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Row 1: Map & Vital Stats */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[400px]">
               
               {/* Interactive Map Visualizer */}
               <div className="xl:col-span-2 flex flex-col bg-[#0b1221] border border-cyan-900/30 rounded overflow-hidden relative">
                   {/* Map Header Overlay */}
                   <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <h2 className="text-2xl font-bold text-white tracking-tight">{selectedSite.name}</h2>
                               <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{selectedSite.type}</span>
                           </div>
                           <div className="flex items-center gap-4 text-xs text-cyan-400 font-mono">
                               <span className="flex items-center gap-1"><Navigation size={12}/> {selectedSite.coordinates}</span>
                               <span className="flex items-center gap-1"><User size={12}/> Mgr: {selectedSite.manager}</span>
                           </div>
                       </div>
                       <div className="text-right">
                           <div className="text-[10px] text-slate-500 uppercase">Site Health</div>
                           <div className="text-2xl font-bold text-green-400">{selectedSite.healthScore}%</div>
                       </div>
                   </div>

                   {/* The Map Component */}
                   <div className="flex-1 relative">
                       <StylizedMap type={selectedSite.industry} />
                   </div>
               </div>

               {/* Right Side: Site Analytics */}
               <div className="flex flex-col gap-4">
                   {/* Key Metrics */}
                   <SciFiCard title="运营关键指标" subtitle="KPIs" className="flex-1 border-cyan-900/50">
                       <div className="space-y-4">
                           <div>
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span>Capacity Utilization</span>
                                   <span className="text-white font-bold">{siteStats.utilization}%</span>
                               </div>
                               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                   <div className="bg-cyan-500 h-full" style={{width: `${siteStats.utilization}%`}}></div>
                               </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3">
                               <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                                   <div className="text-[10px] text-slate-500 uppercase">Safety Run</div>
                                   <div className="text-lg font-bold text-green-400">{siteStats.safetyDays} <span className="text-xs text-slate-600">days</span></div>
                               </div>
                               <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                                   <div className="text-[10px] text-slate-500 uppercase">Active Alerts</div>
                                   <div className={`text-lg font-bold ${siteStats.alertCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                       {siteStats.alertCount}
                                   </div>
                               </div>
                           </div>

                           <div className="p-3 bg-slate-900/50 rounded border border-slate-700 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <Users className="text-indigo-400" size={18} />
                                   <div>
                                       <div className="text-xs text-slate-400">On-Site Staff</div>
                                       <div className="text-sm font-bold text-white">{siteStats.personnel} Active</div>
                                   </div>
                               </div>
                               <div className="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded">Normal</div>
                           </div>
                       </div>
                   </SciFiCard>

                   {/* Risk Radar */}
                   <SciFiCard title="综合风险评估" className="h-48 border-cyan-900/50" noPadding>
                       <div className="w-full h-full p-2">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
                                   <PolarGrid stroke="#334155" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <Radar name="Score" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.3} />
                                   <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#e2e8f0'}} />
                               </RadarChart>
                           </ResponsiveContainer>
                       </div>
                   </SciFiCard>
               </div>
           </div>

           {/* Row 2: Environment & Details */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Environment Monitor */}
               <SciFiCard title="现场环境监测" subtitle="REAL-TIME" className="border-cyan-900/50">
                   <div className="flex items-center justify-between h-full px-2">
                       <div className="flex flex-col items-center gap-1">
                           {WEATHER_DATA.condition === 'Cloudy' ? <CloudRain size={24} className="text-slate-400"/> : <Sun size={24} className="text-yellow-400"/>}
                           <span className="text-2xl font-bold text-white">{WEATHER_DATA.temp}°C</span>
                           <span className="text-xs text-slate-500">{WEATHER_DATA.condition}</span>
                       </div>
                       <div className="h-12 w-px bg-slate-800"></div>
                       <div className="space-y-2">
                           <div className="flex items-center gap-2 text-xs text-slate-400">
                               <Wind size={14} className="text-cyan-400" />
                               <span>Wind: {WEATHER_DATA.wind} m/s</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-slate-400">
                               <Droplets size={14} className="text-blue-400" />
                               <span>Hum: {WEATHER_DATA.humidity}%</span>
                           </div>
                       </div>
                   </div>
               </SciFiCard>

               {/* Asset Distribution */}
               <SciFiCard title="资产分布概览" subtitle="ASSETS" className="md:col-span-2 border-slate-800">
                   <div className="flex gap-4 items-center">
                       <div className="flex-1 grid grid-cols-3 gap-2">
                           <div className="bg-slate-900/40 p-2 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors cursor-pointer">
                               <div className="text-[10px] text-slate-500 uppercase">Heavy Mach.</div>
                               <div className="text-lg font-bold text-white">24</div>
                           </div>
                           <div className="bg-slate-900/40 p-2 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors cursor-pointer">
                               <div className="text-[10px] text-slate-500 uppercase">Sensors</div>
                               <div className="text-lg font-bold text-white">1,205</div>
                           </div>
                           <div className="bg-slate-900/40 p-2 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors cursor-pointer">
                               <div className="text-[10px] text-slate-500 uppercase">IT Infra</div>
                               <div className="text-lg font-bold text-white">45</div>
                           </div>
                       </div>
                       <div className="w-px h-16 bg-slate-800"></div>
                       <div className="w-1/3 flex flex-col gap-2">
                           <button className="flex items-center justify-between px-3 py-2 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 text-xs rounded border border-cyan-900/50 transition-colors">
                               <span>View Asset Ledger</span>
                               <ArrowRight size={12} />
                           </button>
                           <button className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors">
                               <span>Maintenance Logs</span>
                               <FileText size={12} />
                           </button>
                       </div>
                   </div>
               </SciFiCard>

           </div>

        </div>

      </div>
    </div>
  );
};
