
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  ShieldCheck, Activity, Thermometer, Waves, Ruler, 
  GitCommit, AlertOctagon, TrendingUp
} from 'lucide-react';

// --- MOCK DATA ---

// Health Indices (Radar)
const HEALTH_RADAR = [
  { subject: 'Deformation', A: 95, fullMark: 100 },
  { subject: 'Seepage', A: 88, fullMark: 100 },
  { subject: 'Stress', A: 92, fullMark: 100 },
  { subject: 'Uplift', A: 85, fullMark: 100 },
  { subject: 'Joints', A: 90, fullMark: 100 },
  { subject: 'Aging', A: 80, fullMark: 100 },
];

// Uplift Pressure Profile (Base of Dam)
const UPLIFT_PROFILE = Array.from({length: 10}, (_, i) => ({
    pos: i * 10, // m from heel
    pressure: 100 - i * 8, // Theoretical linear drop with grout curtain effect
    limit: 120 - i * 8
}));

// Deflection History
const DEFLECTION_HISTORY = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    radial: 2.5 + Math.sin(i * 0.2) * 0.5 + Math.random() * 0.1, // mm
    temp: 15 + Math.sin(i * 0.1) * 2
}));

export const DamHealthView: React.FC = () => {
  // --- STATE ---
  const [waterLevel, setWaterLevel] = useState(145.0); // m
  const [temperature, setTemperature] = useState(25.0); // C
  
  const [metrics, setMetrics] = useState({
    fosSlide: 1.85, // Factor of Safety (>1.5 is good)
    fosOverturn: 2.1,
    maxStress: 2.4, // MPa
    heelStress: 0.2, // MPa (Tension check)
    totalSeepage: 12.5, // L/min
    healthScore: 92.5
  });

  // Simulation Logic
  useEffect(() => {
    // Physics Approximation
    // Hydrostatic Force ~ H^2
    // Uplift Force ~ H
    // Sliding Stability = (Weight - Uplift) * f / Hydrostatic
    
    const h = waterLevel - 100; // effective head
    const hydroForce = 0.5 * 1.0 * Math.pow(h, 2); 
    const upliftForce = 0.5 * h * 20 * 0.3; // simplified area * reduction factor
    const weight = 5000; // ton/m
    const friction = 0.75;
    
    const fosS = ((weight - upliftForce) * friction) / hydroForce;
    
    // Thermal Effect: Higher Temp -> Expansion -> Upstream movement (counters water load slightly)
    const thermalStress = (temperature - 20) * 0.05; 
    
    const maxS = (hydroForce / 200) + thermalStress; // MPa at toe

    // Health Score
    const score = 100 - (2.0 - fosS) * 20 - (maxS > 3 ? (maxS-3)*10 : 0);

    setMetrics({
        fosSlide: Math.max(0, fosS),
        fosOverturn: fosS * 1.2, // Simplified relation
        maxStress: Math.max(0, maxS),
        heelStress: Math.max(0, 0.5 - hydroForce/5000), // Compression reduces at heel
        totalSeepage: 10 + h * 0.05 + Math.random(),
        healthScore: Math.min(100, Math.max(0, score))
    });

  }, [waterLevel, temperature]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0f172a] text-indigo-50 relative overflow-hidden">
      
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-indigo-800/50 pb-4 px-2 bg-gradient-to-r from-[#1e1b4b] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 mb-1 uppercase tracking-wider">
             <ShieldCheck size={14} className="animate-pulse" /> Structural Integrity Monitor
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             大坝安全 <span className="text-indigo-500">综合健康指数分析</span>
          </h1>
        </div>
        
        {/* Core Safety Stats */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><GitCommit size={10}/> Safety Factor (Slide)</div>
                <div className={`text-2xl font-mono font-bold ${metrics.fosSlide < 1.5 ? 'text-red-500' : 'text-green-400'}`}>
                    {metrics.fosSlide.toFixed(2)}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-indigo-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Health Score</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.healthScore.toFixed(1)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-indigo-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><AlertOctagon size={10}/> Max Stress</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">{metrics.maxStress.toFixed(2)} <span className="text-sm text-slate-500">MPa</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Load Simulation */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="荷载效应仿真 (Simulation)" subtitle="INPUTS" className="flex-1 border-indigo-900/50 bg-[#0c101b]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Water Level */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-300">
                              <span className="flex items-center gap-2"><Waves size={12}/> 上游水位 (Reservoir Lvl)</span>
                              <span className="font-mono">{waterLevel.toFixed(1)} m</span>
                          </div>
                          <input 
                            type="range" min="120" max="160" step="0.5" 
                            value={waterLevel} onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Min (120m)</span>
                              <span>Flood (160m)</span>
                          </div>
                      </div>

                      {/* Temperature */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-orange-300">
                              <span className="flex items-center gap-2"><Thermometer size={12}/> 环境温度 (Ambient Temp)</span>
                              <span className="font-mono">{temperature.toFixed(1)} °C</span>
                          </div>
                          <input 
                            type="range" min="-10" max="40" step="1" 
                            value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-800/30 rounded text-xs text-indigo-200/80">
                          <strong className="block mb-1 text-white">Stability Check:</strong> 
                          Current FoS {metrics.fosSlide.toFixed(2)} is {metrics.fosSlide > 1.5 ? 'sufficient' : 'CRITICAL'} against sliding.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="健康度雷达 (Health Index)" subtitle="DIMENSIONS" className="h-[240px] border-indigo-900/50">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={HEALTH_RADAR}>
                              <PolarGrid stroke="#312e81" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a5b4fc', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Health" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#6366f1', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] text-green-400 bg-indigo-900/30 px-2 py-1 rounded">
                          Overall: A (Excellent)
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Structure */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#05060a] border border-indigo-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(99,102,241,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-indigo-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Ruler size={16} className="text-indigo-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Max Deflection</div>
                              <div className="text-sm font-bold text-white">3.2 mm</div>
                          </div>
                      </div>
                  </div>

                  {/* Stress Legend */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-indigo-900 text-[10px] text-slate-300">
                      <div className="flex items-center gap-2 mb-1"><div className="w-20 h-2 bg-gradient-to-r from-blue-900 via-indigo-500 to-red-500 rounded"></div></div>
                      <div className="flex justify-between w-20">
                          <span>Low</span>
                          <span>High Stress</span>
                      </div>
                  </div>

                  <ThreeScene type="dam-health-analysis" color="#6366f1" />
              </div>

              {/* Uplift Pressure Chart */}
              <SciFiCard title="坝基扬压力分布 (Uplift)" subtitle="BASE PROFILE" className="h-[220px] border-indigo-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={UPLIFT_PROFILE}>
                              <defs>
                                  <linearGradient id="colorUplift" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                              <XAxis dataKey="pos" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Dist from Heel (m)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#6366f1'}} />
                              
                              <Area type="monotone" dataKey="pressure" stroke="#6366f1" fill="url(#colorUplift)" name="Measured" />
                              <Line type="step" dataKey="limit" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Design Limit" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Deformation & Seepage */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Deflection Trend */}
              <SciFiCard title="径向位移趋势 (Deflection)" subtitle="24H" className="h-[280px] border-indigo-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={DEFLECTION_HISTORY}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                              <YAxis yAxisId="left" stroke="#6366f1" tick={{fontSize: 10}} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill:'#6366f1', fontSize: 10 }} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{fontSize: 10}} domain={[10, 30]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#6366f1'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              <Line yAxisId="left" type="monotone" dataKey="radial" stroke="#6366f1" strokeWidth={2} dot={false} name="Displacement" />
                              <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={1} dot={false} name="Temp" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Seepage & Crack Info */}
              <SciFiCard title="渗流与裂缝监测" subtitle="INTEGRITY" className="flex-1 border-indigo-900/50">
                  <div className="flex flex-col gap-4 h-full">
                      <div className="flex justify-between items-center p-2 border-b border-indigo-800 pb-2">
                          <span className="text-xs text-slate-400">Total Seepage</span>
                          <span className="text-xl font-mono font-bold text-blue-300">{metrics.totalSeepage.toFixed(1)} L/min</span>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded border border-slate-800">
                              <span className="text-slate-300">Crack J-4 Width</span>
                              <span className="font-bold text-yellow-400">0.45 mm (+0.02)</span>
                          </div>
                          <div className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded border border-slate-800">
                              <span className="text-slate-300">Joint Opening</span>
                              <span className="font-bold text-white">1.2 mm</span>
                          </div>
                      </div>

                      <div className="mt-auto flex items-center gap-2 p-2 bg-green-900/20 border border-green-800/30 rounded">
                          <ShieldCheck size={16} className="text-green-500" />
                          <div className="text-[10px] text-green-200">
                              Structure is behaving elastically. No permanent deformation detected.
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
