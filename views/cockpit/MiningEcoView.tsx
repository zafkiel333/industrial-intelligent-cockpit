
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { 
  Leaf, Wind, Droplets, Mountain, 
  Sprout, Globe, Activity, Sun, CloudRain,
  Bird, Recycle, Trees
} from 'lucide-react';

// --- MOCK DATA ---
const AQI_DATA = [
  { subject: 'PM2.5', A: 85, fullMark: 100 },
  { subject: 'PM10', A: 70, fullMark: 100 },
  { subject: 'NO2', A: 45, fullMark: 100 },
  { subject: 'SO2', A: 30, fullMark: 100 },
  { subject: 'O3', A: 60, fullMark: 100 },
  { subject: 'CO', A: 25, fullMark: 100 },
];

const VEGETATION_TREND = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    ndvi: 0.3 + (i/12) * 0.4 + Math.random() * 0.05, // Increasing trend
    area: 120 + i * 15
}));

const CARBON_STATS = [
    { name: 'Total Emission', value: 4500, fill: '#ef4444' },
    { name: 'Sequestration', value: 3200, fill: '#22c55e' } // Green
];

export const MiningEcoView: React.FC = () => {
  const [envData, setEnvData] = useState({
    temp: 22.5,
    humidity: 65,
    noise: 45,
    waterPh: 7.2,
    turbidity: 4.5
  });

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setEnvData(prev => ({
            temp: 22 + Math.sin(Date.now()/5000),
            humidity: 65 + Math.cos(Date.now()/4000) * 5,
            noise: 45 + Math.random() * 5,
            waterPh: 7.2 + (Math.random() - 0.5) * 0.1,
            turbidity: 4.5 + (Math.random() - 0.5) * 0.5
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#051a10] text-emerald-50 relative overflow-hidden">
      
      {/* Background Ambience: Organic Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
               backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', 
               backgroundSize: '30px 30px'
           }}>
      </div>

      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-emerald-500/30 pb-4 bg-gradient-to-r from-emerald-950/80 to-transparent z-10 px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Sprout size={14} className="animate-pulse" /> Ecological Restoration Command
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             矿山生态修复 <span className="text-emerald-500">与环保驾驶舱</span>
          </h1>
        </div>
        
        {/* Top Stats */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Trees size={12}/> Reclaimed Area</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">1,245 <span className="text-sm text-slate-500">ha</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Bird size={12}/> Biodiversity</div>
                <div className="text-2xl font-mono font-bold text-white">342 <span className="text-sm text-slate-500">Species</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase">Green Index</div>
                <div className="text-2xl font-bold text-green-400 bg-emerald-900/30 px-3 rounded border border-emerald-500/30">
                    A+
                </div>
            </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Environmental Sensing */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="环境质量雷达 (AQI+)" subtitle="REAL-TIME" className="h-[300px] border-emerald-900/50 bg-[#022c22]/60" noPadding>
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={AQI_DATA}>
                              <PolarGrid stroke="#064e3b" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="AQI" dataKey="A" stroke="#34d399" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#064e3b', borderColor: '#34d399', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-xs text-emerald-300 font-bold bg-emerald-900/50 px-2 py-1 rounded">
                          Air Quality: GOOD
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="感知节点数据" className="flex-1 border-emerald-900/50">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-900/20 p-3 rounded border border-emerald-800/50 flex flex-col items-center">
                          <Sun className="text-yellow-400 mb-1" size={20} />
                          <div className="text-lg font-bold text-white">{envData.temp.toFixed(1)}°C</div>
                          <div className="text-[10px] text-slate-400">Temperature</div>
                      </div>
                      <div className="bg-emerald-900/20 p-3 rounded border border-emerald-800/50 flex flex-col items-center">
                          <CloudRain className="text-blue-400 mb-1" size={20} />
                          <div className="text-lg font-bold text-white">{envData.humidity.toFixed(0)}%</div>
                          <div className="text-[10px] text-slate-400">Humidity</div>
                      </div>
                      <div className="bg-emerald-900/20 p-3 rounded border border-emerald-800/50 flex flex-col items-center">
                          <Activity className="text-purple-400 mb-1" size={20} />
                          <div className="text-lg font-bold text-white">{envData.noise.toFixed(1)}dB</div>
                          <div className="text-[10px] text-slate-400">Noise Level</div>
                      </div>
                      <div className="bg-emerald-900/20 p-3 rounded border border-emerald-800/50 flex flex-col items-center">
                          <Droplets className="text-cyan-400 mb-1" size={20} />
                          <div className="text-lg font-bold text-white">pH {envData.waterPh.toFixed(1)}</div>
                          <div className="text-[10px] text-slate-400">Water Quality</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Eco-Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* 3D SCENE */}
              <div className="flex-1 bg-gradient-to-b from-[#0f1f15] to-[#020604] border border-emerald-700/30 rounded-lg relative overflow-hidden shadow-2xl">
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20">
                      <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-200 text-xs">
                          <Globe size={14} className="animate-spin-slow" /> Virtual Eco-Park Twin
                      </div>
                  </div>

                  {/* Restoration Progress Badge */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-8">
                      <div className="text-center">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Soil Improvement</div>
                          <div className="text-xl font-bold text-white">85%</div>
                          <div className="w-24 h-1 bg-slate-700 rounded mt-1"><div className="h-full bg-emerald-500 w-[85%]"></div></div>
                      </div>
                      <div className="text-center">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Water Treatment</div>
                          <div className="text-xl font-bold text-white">92%</div>
                          <div className="w-24 h-1 bg-slate-700 rounded mt-1"><div className="h-full bg-blue-500 w-[92%]"></div></div>
                      </div>
                  </div>

                  <ThreeScene type="mining-eco" color="#4ade80" />
              </div>

              {/* Bottom: Restoration Timeline */}
              <SciFiCard title="植被覆盖度 (NDVI) 趋势" subtitle="12 MONTHS" className="h-[200px] border-emerald-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={VEGETATION_TREND}>
                              <defs>
                                  <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                              <XAxis dataKey="month" stroke="#6b7280" tick={{fontSize: 10}} />
                              <YAxis stroke="#6b7280" tick={{fontSize: 10}} domain={[0, 1]} />
                              <Tooltip contentStyle={{backgroundColor: '#064e3b', borderColor: '#22c55e', color: '#fff'}} />
                              <Area type="monotone" dataKey="ndvi" stroke="#22c55e" strokeWidth={2} fill="url(#colorNdvi)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Carbon & Compliance */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Carbon Neutrality Balance */}
              <SciFiCard title="碳中和天平" subtitle="CARBON OFFSET" className="border-emerald-900/50">
                  <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative w-40 h-20 overflow-hidden mb-2">
                          {/* Semicircle Gauge Idea */}
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={CARBON_STATS}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {CARBON_STATS.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                              <div className="text-xs text-slate-400">Offset Ratio</div>
                              <div className="text-xl font-bold text-white">71%</div>
                          </div>
                      </div>
                      
                      <div className="w-full flex justify-between px-2 text-xs mt-2 border-t border-emerald-800/50 pt-2">
                          <div className="text-left">
                              <div className="text-red-400 font-bold">4,500 t</div>
                              <div className="text-slate-500">Emission</div>
                          </div>
                          <div className="text-right">
                              <div className="text-green-400 font-bold">3,200 t</div>
                              <div className="text-slate-500">Sequestered</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Eco Projects List */}
              <SciFiCard title="生态修复工程" className="flex-1 border-emerald-900/50">
                  <div className="flex flex-col gap-3">
                      {[
                          { name: 'Slope Stabilization A', status: 'Completed', progress: 100 },
                          { name: 'Wetland Construction', status: 'In Progress', progress: 65 },
                          { name: 'Native Tree Planting', status: 'In Progress', progress: 42 },
                          { name: 'Soil Remediation B', status: 'Planned', progress: 0 },
                      ].map((task, i) => (
                          <div key={i} className="bg-emerald-900/20 p-2 rounded border border-emerald-800/30">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-emerald-100">{task.name}</span>
                                  <span className="text-[10px] text-emerald-400">{task.status}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{width: `${task.progress}%`}}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-auto p-3 bg-slate-900/50 rounded border border-slate-700 flex items-center gap-3">
                      <Recycle size={20} className="text-green-400" />
                      <div className="text-xs text-slate-300">
                          <span className="block font-bold text-white">Waste Recycling</span>
                          Solid Waste Utilization Rate: 94.5%
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
