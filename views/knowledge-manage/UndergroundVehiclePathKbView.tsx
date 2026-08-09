
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[km-vehicle-path]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/km-vehicle-path';
import { 
  Route, Navigation, Map as MapIcon, 
  Activity, AlertTriangle, Truck, 
  Search, Database, Share2, 
  Compass, Timer, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell
} from 'recharts';

// Mock Data
const PATH_NODES = [
  { id: 'N-01', x: 10, y: 20, status: 'Clear' },
  { id: 'N-02', x: 40, y: 50, status: 'Congested' },
  { id: 'N-03', x: 70, y: 30, status: 'Clear' },
];

const TRAFFIC_STATS = [
  { name: 'Main Haulage', value: 85, color: '#10b981' },
  { name: 'Ramp A', value: 92, color: '#f59e0b' },
  { name: 'Face 1204', value: 45, color: '#3b82f6' },
  { name: 'Workshop', value: 20, color: '#64748b' },
];

export const UndergroundVehiclePathKbView: React.FC = () => {
  const [activePath, setActivePath] = useState('P-104');

  return (
    <div className="h-full flex flex-col gap-4 font-[Rajdhani] text-slate-200 bg-[#0c0a09] p-2 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-stone-900/60 border border-amber-900/40 p-4 rounded-lg backdrop-blur-xl z-10 shadow-2xl">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-600/20 border-2 border-amber-500 rounded-lg flex items-center justify-center relative">
                    <Route size={30} className="text-amber-400" />
                </div>
                <div>
                    <div className="flex items-center gap-2 text-[10px] text-amber-500 mb-0.5 uppercase tracking-[0.3em] font-black">
                        <Navigation size={12} /> Underground Logistics
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">
                        无轨胶轮车 <span className="text-amber-500 italic">井下路径规划图谱</span>
                    </h1>
                </div>
            </div>
            
             <div className="flex gap-10 items-center pr-4">
                 <div className="text-right">
                    <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Active Vehicles</div>
                    <div className="text-2xl font-mono font-black text-white">24</div>
                 </div>
                 <div className="h-10 w-[1px] bg-stone-700"></div>
                 <div className="text-right">
                    <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Traffic Efficiency</div>
                    <div className="text-2xl font-mono font-black text-emerald-400">92%</div>
                 </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 z-10">
            {/* Left */}
            <div className="w-[300px] flex flex-col gap-4">
                <SciFiCard title="路径库 (Path Library)" subtitle="ARCHIVE" className="flex-1 border-amber-900/30">
                    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {['P-104: Main -> Face 3', 'P-105: Ramp -> Workshop', 'P-108: Face 2 -> Dump'].map((p, i) => (
                            <div key={i} className="p-3 bg-stone-900/40 border border-stone-800 rounded cursor-pointer hover:border-amber-500/50 transition-all group">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">{p.split(':')[0]}</span>
                                    <span className="text-[10px] bg-stone-800 px-1.5 rounded text-stone-500">Optimized</span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-1">{p.split(':')[1]}</div>
                            </div>
                        ))}
                    </div>
                </SciFiCard>
                
                <SciFiCard title="路段拥堵指数" subtitle="CONGESTION" className="h-[240px] border-stone-800">
                    <div className="w-full h-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TRAFFIC_STATS} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155"/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#78716c" width={70} tick={{fontSize: 10}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1c1917', border: 'none'}} />
                                <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                    {TRAFFIC_STATS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SciFiCard>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col gap-4 relative">
                <div className="flex-1 bg-black border border-amber-900/20 rounded-lg overflow-hidden relative shadow-2xl group">
                    <ThreeScene type="mine-tunnel" color="#f59e0b" />
                    <div className="absolute top-4 right-4 z-20">
                      <ModelLibraryLink url={MODEL_LIB_URL} />
                    </div>

                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                       <div className="bg-stone-950/80 backdrop-blur border-l-4 border-amber-500 p-4 rounded-sm shadow-xl flex flex-col">
                           <div className="text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                               <MapIcon size={12}/> Topological Map
                           </div>
                           <div className="text-xl font-black text-white">Zone 12-B</div>
                       </div>
                   </div>
                </div>
            </div>

            {/* Right */}
            <div className="w-[300px] flex flex-col gap-4">
                 <SciFiCard title="车辆实时遥测" subtitle="V-LINK" className="border-stone-800">
                     <div className="grid grid-cols-2 gap-3">
                         <div className="p-2 bg-stone-900/50 rounded border border-stone-800 text-center">
                             <div className="text-[10px] text-stone-500 uppercase">Speed</div>
                             <div className="text-lg font-bold text-white font-mono">18 km/h</div>
                         </div>
                         <div className="p-2 bg-stone-900/50 rounded border border-stone-800 text-center">
                             <div className="text-[10px] text-stone-500 uppercase">Battery</div>
                             <div className="text-lg font-bold text-green-400 font-mono">82%</div>
                         </div>
                     </div>
                 </SciFiCard>

                 <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                     <div className="flex items-center gap-2 mb-2 text-amber-500">
                         <AlertTriangle size={16} />
                         <span className="text-xs font-bold">Collision Warning</span>
                     </div>
                     <p className="text-[10px] text-amber-200/70 leading-relaxed">
                         Approaching Intersection Node-05. Detected cross traffic. Recommend speed reduction to 10 km/h.
                     </p>
                 </div>
            </div>
        </div>
    </div>
  );
};
