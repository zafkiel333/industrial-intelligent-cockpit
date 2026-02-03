
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Flame, Bomb, Activity, Settings, 
  Maximize2, AlertTriangle, Layers, Ruler,
  Zap, BarChart2
} from 'lucide-react';

// --- MOCK DATA ---

// Kuz-Ram Fragmentation Distribution
const FRAG_DATA = Array.from({length: 20}, (_, i) => {
    const size = i * 50; // mm
    const passing = 100 * (1 - Math.exp(-Math.pow(size / 300, 1.5)));
    return { size, passing };
});

// Vibration (PPV) vs Distance
const VIB_DATA = Array.from({length: 20}, (_, i) => {
    const dist = 50 + i * 20; // Distance from blast
    const ppv = 1500 * Math.pow(dist, -1.6); // Simple decay model
    return { dist, ppv };
});

export const BlastingQualityView: React.FC = () => {
  // --- STATE ---
  const [burden, setBurden] = useState(3.5); // m
  const [spacing, setSpacing] = useState(4.5); // m
  const [stemming, setStemming] = useState(2.8); // m
  const [powderFactor, setPowderFactor] = useState(0.45); // kg/m3
  
  const [metrics, setMetrics] = useState({
    p80: 320, // 80% passing size (mm)
    meanFrag: 210, // mm
    ppvNear: 12.5, // mm/s
    costPerTon: 0.35 // $
  });

  // Simulation Logic
  useEffect(() => {
    // Kuz-Ram approx logic
    // P80 increases if burden/spacing increase (coarser frag)
    // P80 decreases if powder factor increases (finer frag)
    const newP80 = 320 * (burden * spacing / 15.75) * (0.45 / powderFactor);
    const newPPV = 12.5 * (powderFactor / 0.45);

    setMetrics({
        p80: newP80,
        meanFrag: newP80 * 0.65,
        ppvNear: newPPV,
        costPerTon: 0.35 * (powderFactor / 0.45)
    });
  }, [burden, spacing, powderFactor]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0f0505] text-orange-50 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/20 via-[#0f0505] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-orange-800/50 pb-4 px-2 bg-gradient-to-r from-[#2a0a0a] to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase tracking-wider">
             <Bomb size={14} className="animate-pulse" /> Precision Blasting Control
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             爆破效果 <span className="text-red-500">质量指数分析</span>
          </h1>
        </div>
        
        {/* Core Score */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded border border-orange-500/30">
            <div className="text-right px-4">
                <div className="text-[10px] text-slate-400 uppercase">Fragmentation Quality Index</div>
                <div className="text-3xl font-mono font-bold text-orange-400">88.5</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="flex flex-col w-32 gap-1 px-2">
                <div className="flex justify-between text-xs text-slate-300">
                    <span>Target P80</span>
                    <span className="text-green-400">300mm</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                    <span>Simulated</span>
                    <span className="text-white">{metrics.p80.toFixed(0)}mm</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Blast Pattern Design */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="爆破参数仿真 (Design)" subtitle="INPUTS" className="flex-1 border-orange-900/50 bg-[#1a0b05]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Burden */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-orange-200">
                              <span className="flex items-center gap-2"><Ruler size={12}/> 抵抗线 (Burden)</span>
                              <span className="font-mono">{burden} m</span>
                          </div>
                          <input 
                            type="range" min="2.0" max="6.0" step="0.1" 
                            value={burden} onChange={(e) => setBurden(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      {/* Spacing */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-orange-200">
                              <span className="flex items-center gap-2"><Maximize2 size={12}/> 孔距 (Spacing)</span>
                              <span className="font-mono">{spacing} m</span>
                          </div>
                          <input 
                            type="range" min="2.5" max="8.0" step="0.1" 
                            value={spacing} onChange={(e) => setSpacing(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      {/* Powder Factor */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-red-200">
                              <span className="flex items-center gap-2"><Flame size={12}/> 炸药单耗 (Powder Factor)</span>
                              <span className="font-mono">{powderFactor} kg/m³</span>
                          </div>
                          <input 
                            type="range" min="0.2" max="0.8" step="0.01" 
                            value={powderFactor} onChange={(e) => setPowderFactor(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-orange-900/20 p-2 rounded border border-orange-800/30">
                              <div className="text-[10px] text-slate-400">Mean Size</div>
                              <div className="text-lg font-bold text-white">{metrics.meanFrag.toFixed(0)} mm</div>
                          </div>
                          <div className="bg-orange-900/20 p-2 rounded border border-orange-800/30">
                              <div className="text-[10px] text-slate-400">Est. Cost</div>
                              <div className="text-lg font-bold text-white">${metrics.costPerTon.toFixed(2)} /t</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="微差时间序列" subtitle="TIMING" className="h-[200px] border-orange-900/50">
                  <div className="flex flex-col h-full justify-center gap-4">
                      <div className="flex items-center gap-4 text-xs">
                          <div className="w-10 text-slate-400">Row 1</div>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative">
                              <div className="absolute left-0 w-2 h-2 bg-orange-500 rounded-full animate-[ping_3s_linear_infinite]"></div>
                          </div>
                          <div className="w-10 text-right text-white">0ms</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                          <div className="w-10 text-slate-400">Row 2</div>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative">
                              <div className="absolute left-[20%] w-2 h-2 bg-orange-500 rounded-full animate-[ping_3s_linear_infinite]" style={{animationDelay: '0.5s'}}></div>
                          </div>
                          <div className="w-10 text-right text-white">25ms</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                          <div className="w-10 text-slate-400">Row 3</div>
                          <div className="flex-1 h-2 bg-slate-800 rounded relative">
                              <div className="absolute left-[40%] w-2 h-2 bg-orange-500 rounded-full animate-[ping_3s_linear_infinite]" style={{animationDelay: '1s'}}></div>
                          </div>
                          <div className="w-10 text-right text-white">50ms</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Simulation */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050202] border border-orange-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(234,88,12,0.15)] group">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-orange-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Settings size={16} className="text-orange-400" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Pattern Type</div>
                              <div className="text-sm font-bold text-white">STAGGERED</div>
                          </div>
                      </div>
                  </div>

                  <ThreeScene type="blasting-quality-analysis" color="#ef4444" />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-orange-900 text-[10px] text-slate-300 text-right">
                      <div>Orange: Blast Hole</div>
                      <div>Red: Shockwave</div>
                      <div>Grey: Muckpile</div>
                  </div>
              </div>

              {/* Vibration Chart */}
              <SciFiCard title="振动衰减监测 (PPV)" subtitle="SEISMIC" className="h-[220px] border-orange-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={VIB_DATA}>
                              <defs>
                                  <linearGradient id="colorPpv" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="dist" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'PPV (mm/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                              <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#ef4444', color: '#fff'}} />
                              <Area type="monotone" dataKey="ppv" stroke="#ef4444" fill="url(#colorPpv)" strokeWidth={2} />
                              <ReferenceLine y={25} stroke="yellow" strokeDasharray="3 3" label={{value: 'Limit', fill: 'yellow', fontSize: 10}} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Fragmentation Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Fragmentation Curve */}
              <SciFiCard title="岩石破碎度分布 (Kuz-Ram)" subtitle="PSD" className="flex-1 border-orange-900/50">
                  <div className="w-full h-full p-2 flex flex-col">
                      <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={FRAG_DATA}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#331c09" />
                                  <XAxis dataKey="size" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Size (mm)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                  <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: '% Passing', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[0, 100]} />
                                  <Tooltip contentStyle={{backgroundColor: '#0c0a09', borderColor: '#f97316'}} />
                                  <Line type="monotone" dataKey="passing" stroke="#f97316" strokeWidth={2} dot={false} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                              <span>Oversize (&gt;500mm)</span>
                              <span className="text-red-400 font-bold">12.5%</span>
                          </div>
                          <div className="flex justify-between pt-1">
                              <span>Fines (&lt;10mm)</span>
                              <span className="text-blue-400 font-bold">8.2%</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* KPI Radar */}
              <SciFiCard title="爆破综合评分" subtitle="INDEX" className="h-[220px] border-orange-900/50">
                  <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                              { subject: 'Fragmentation', A: 85, fullMark: 100 },
                              { subject: 'Muckpile Shape', A: 92, fullMark: 100 },
                              { subject: 'Vibration', A: 78, fullMark: 100 },
                              { subject: 'Cost Eff', A: 88, fullMark: 100 },
                              { subject: 'Safety', A: 95, fullMark: 100 },
                          ]}>
                              <PolarGrid stroke="#451a03" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#fdba74', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Score" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#0f0505', borderColor: '#f97316', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
