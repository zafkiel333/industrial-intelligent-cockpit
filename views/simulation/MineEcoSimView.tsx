
import React, { useState, useEffect } from 'react';
import { SimThreeScene } from '../../components/scene-simulation/ThreeScene';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Sprout, Leaf, TreeDeciduous, Wind, CloudRain, 
  Sun, Activity, Droplets, Target, Mountain,
  TrendingUp, BarChart3, Globe, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- CONSTANTS ---
const RESTORATION_STAGES = [
  { year: 2023, phase: 'Closure & Reshaping', desc: 'Slope stabilization, drainage setup' },
  { year: 2025, phase: 'Soil Reconstruction', desc: 'Topsoil replacement, fertilization' },
  { year: 2028, phase: 'Pioneer Planting', desc: 'Grass & shrub layer establishment' },
  { year: 2030, phase: 'Forest Succession', desc: 'Native tree species integration' },
  { year: 2035, phase: 'Mature Ecosystem', desc: 'Self-sustaining biodiversity' },
];

const SOIL_DATA = [
  { subject: 'Organic Matter', A: 65, fullMark: 100 },
  { subject: 'Nitrogen (N)', A: 78, fullMark: 100 },
  { subject: 'Phosphorus (P)', A: 55, fullMark: 100 },
  { subject: 'Potassium (K)', A: 82, fullMark: 100 },
  { subject: 'pH Balance', A: 90, fullMark: 100 },
  { subject: 'Microbial Bio', A: 45, fullMark: 100 },
];

const CARBON_DATA = [
    { name: 'Soil Sequestration', value: 4500, fill: '#8b5cf6' },
    { name: 'Biomass', value: 8200, fill: '#10b981' },
    { name: 'Offset Credits', value: 2100, fill: '#3b82f6' }
];

export const MineEcoSimView: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(2023);
  const [progress, setProgress] = useState(0); // 0-100 based on year range
  
  const [metrics, setMetrics] = useState({
    ndvi: 0.15,
    waterQuality: 4, // 1-5 scale
    carbonStock: 1200, // tons
    biodiversityIndex: 0.2
  });

  // Calculate progress based on year slider (Range 2023 - 2035 = 12 years)
  useEffect(() => {
      const p = Math.min(100, Math.max(0, (currentYear - 2023) / 12 * 100));
      setProgress(p);

      // Simulation Logic
      setMetrics({
          ndvi: 0.15 + (p / 100) * 0.7, // 0.15 -> 0.85
          waterQuality: Math.min(5, 2 + (p/100) * 3),
          carbonStock: 1200 + (p/100) * 15000,
          biodiversityIndex: 0.2 + (p/100) * 0.7
      });
  }, [currentYear]);

  const activeStage = RESTORATION_STAGES.reduce((prev, curr) => 
      curr.year <= currentYear ? curr : prev
  , RESTORATION_STAGES[0]);

  return (
    <div className="h-full w-full relative bg-[#020b05] text-emerald-50 overflow-hidden font-[Rajdhani]">
      
      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
          <SimThreeScene 
            type="mine-eco" 
            simData={{ 
                progress: progress,
                year: currentYear
            }} 
          />
          {/* Eco Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020b05_100%)] pointer-events-none"></div>
          {/* Organic overlay texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/leaf.png")'}}>
          </div>
      </div>

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-[#0a1a0f]/90 to-transparent pointer-events-none">
          <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-bold tracking-[0.2em] animate-pulse">
                 <Leaf size={14} /> ECOLOGICAL DIGITAL TWIN
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 text-shadow-glow">
                 矿区生态修复 <span className="text-emerald-500">& 地表形态演化仿真</span>
              </h1>
          </div>
          
          <div className="flex gap-8 pointer-events-auto items-center">
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Current Phase</div>
                   <div className="text-xl font-bold text-white">{activeStage.phase}</div>
                   <div className="text-[10px] text-emerald-400">{activeStage.desc}</div>
               </div>
               <div className="w-px h-10 bg-slate-700"></div>
               <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase">Green Coverage (NDVI)</div>
                   <div className="text-3xl font-mono font-bold text-emerald-300">
                       {metrics.ndvi.toFixed(2)}
                   </div>
               </div>
          </div>
      </div>

      {/* LEFT PANEL: Evolution Controller */}
      <div className="absolute left-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          {/* Time Machine */}
          <div className="bg-[#051a10]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                  <Clock size={16} className="text-emerald-500"/> 演化时间轴 (Timeline)
              </h3>
              
              <div className="relative pt-6 pb-2 px-2">
                  <input 
                    type="range" min="2023" max="2035" step="1" 
                    value={currentYear} 
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  {/* Year Markers */}
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>2023</span>
                      <span>2027</span>
                      <span>2031</span>
                      <span>2035</span>
                  </div>
                  
                  {/* Current Year Bubble */}
                  <div 
                    className="absolute top-0 transform -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg"
                    style={{ left: `${progress}%` }}
                  >
                      {currentYear}
                  </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-800/30 rounded text-xs text-emerald-200/80 leading-relaxed">
                  <strong className="block mb-1 text-white">Prediction:</strong> 
                  By {currentYear}, soil organic matter is projected to increase by {((currentYear-2023)*1.5).toFixed(1)}%. Water pH stabilizes at 7.2.
              </div>
          </div>

          {/* Environmental Metrics */}
          <SciFiCard title="环境因子监测" subtitle="SENSORS" className="flex-1 border-emerald-900/50 bg-[#051a10]/90 pointer-events-auto">
              <div className="grid grid-cols-2 gap-3 p-1">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center gap-1">
                      <Droplets size={20} className="text-cyan-400"/>
                      <div className="text-[10px] text-slate-400">Water Quality</div>
                      <div className="text-lg font-bold text-white">Class {metrics.waterQuality >= 4 ? 'II' : metrics.waterQuality >= 3 ? 'III' : 'IV'}</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center gap-1">
                      <Sprout size={20} className="text-green-400"/>
                      <div className="text-[10px] text-slate-400">Biodiversity</div>
                      <div className="text-lg font-bold text-white">{metrics.biodiversityIndex.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center gap-1">
                      <CloudRain size={20} className="text-blue-300"/>
                      <div className="text-[10px] text-slate-400">Rainfall</div>
                      <div className="text-lg font-bold text-white">45 mm</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800 flex flex-col items-center gap-1">
                      <Sun size={20} className="text-yellow-400"/>
                      <div className="text-[10px] text-slate-400">Solar Rad</div>
                      <div className="text-lg font-bold text-white">High</div>
                  </div>
              </div>

              {/* Soil Radar */}
              <div className="flex-1 min-h-[180px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SOIL_DATA}>
                          <PolarGrid stroke="#065f46" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6ee7b7', fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Soil" dataKey="A" stroke="#34d399" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </SciFiCard>

      </div>

      {/* RIGHT PANEL: Ecosystem Services */}
      <div className="absolute right-6 top-32 bottom-6 w-80 flex flex-col gap-4 z-20 pointer-events-none">
          
          <SciFiCard title="碳汇价值评估 (Carbon Sink)" subtitle="ECO-VALUE" className="h-[300px] border-emerald-900/50 bg-[#051a10]/90 pointer-events-auto">
              <div className="w-full h-full p-2 flex flex-col items-center">
                  <div className="relative w-40 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                data={CARBON_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {CARBON_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#051a10', borderColor: '#10b981'}} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">{(metrics.carbonStock/1000).toFixed(1)}k</span>
                          <span className="text-[10px] text-slate-400">tCO₂e</span>
                      </div>
                  </div>
                  
                  <div className="w-full space-y-2 mt-2">
                      {CARBON_DATA.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                                  <span className="text-slate-300">{item.name}</span>
                              </div>
                              <span className="font-bold text-white">{item.value}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </SciFiCard>

          {/* Restoration Tasks */}
          <div className="flex-1 bg-[#051a10]/90 backdrop-blur-md border border-emerald-900/50 rounded-lg p-4 pointer-events-auto shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                  <Activity size={16} className="text-emerald-500"/> 当前阶段任务
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded flex gap-3 items-center">
                      <div className="p-2 bg-emerald-800 rounded-full text-white">
                          <Mountain size={14} />
                      </div>
                      <div>
                          <div className="text-xs font-bold text-emerald-100">Slope Grading</div>
                          <div className="text-[10px] text-emerald-400/70">Completed 95%</div>
                          <div className="w-32 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="bg-emerald-500 h-full w-[95%]"></div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded flex gap-3 items-center">
                      <div className="p-2 bg-emerald-800 rounded-full text-white">
                          <TreeDeciduous size={14} />
                      </div>
                      <div>
                          <div className="text-xs font-bold text-emerald-100">Hydro-seeding</div>
                          <div className="text-[10px] text-emerald-400/70">In Progress 45%</div>
                          <div className="w-32 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="bg-yellow-500 h-full w-[45%]"></div>
                          </div>
                      </div>
                  </div>

                  <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded flex gap-3 items-center">
                      <div className="p-2 bg-emerald-800 rounded-full text-white">
                          <Target size={14} />
                      </div>
                      <div>
                          <div className="text-xs font-bold text-emerald-100">Soil Sampling</div>
                          <div className="text-[10px] text-emerald-400/70">Scheduled (T+2 Days)</div>
                      </div>
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
};
