
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
// 2026-07-13 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ia-ship-eeoi]: 2026-07-13 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ia-ship-eeoi';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  BarChart, Bar, Cell, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Ship, Anchor, Wind, Droplets, Zap, 
  Activity, Gauge, TrendingDown, Leaf, Target,
  Navigation, Fuel
} from 'lucide-react';

// --- MOCK DATA ---

// Speed-Power Curve (Cubic relation approximation)
// This is the "J-Curve" for optimization
const SPEED_POWER_DATA = Array.from({length: 20}, (_, i) => {
    const speed = 10 + i * 0.5; // 10 to 20 knots
    // Power ~ Speed^3
    // Consumption ~ Power * SFC (assume SFC roughly constant or slight bathtub)
    // EEOI ~ Consumption / (Cargo * Distance) ~ (Speed^3) / (Speed * Cargo) ~ Speed^2
    const eeoi = 5 + 0.1 * Math.pow(speed - 12, 2); // Optimal around 12kn
    return { speed, eeoi };
});

const EEOI_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    eeoi: 12 + Math.sin(i * 0.2) * 2 + Math.random(),
    limit: 15 // Target
}));

const CII_RATING = [
    { grade: 'A', min: 0, max: 8, color: '#10b981' },
    { grade: 'B', min: 8, max: 10, color: '#34d399' },
    { grade: 'C', min: 10, max: 14, color: '#facc15' }, // Baseline
    { grade: 'D', min: 14, max: 18, color: '#f97316' },
    { grade: 'E', min: 18, max: 30, color: '#ef4444' },
];

export const ShipEeoiView: React.FC = () => {
  // --- STATE ---
  const [speed, setSpeed] = useState(14.5); // knots
  const [cargoLoad, setCargoLoad] = useState(85); // %
  const [fuelType, setFuelType] = useState<'HFO'|'LNG'|'Methanol'>('HFO');

  const [metrics, setMetrics] = useState({
    eeoi: 12.5, // gCO2/t.nm
    ciiRating: 'C',
    fuelCons: 45.2, // tons/day
    co2Emission: 142.5, // tons/day
    voyageDist: 450, // nm
    efficiencyColor: '#facc15' // based on CII
  });

  // Physics Simulation
  useEffect(() => {
    // 1. Fuel Consumption Model (Cubic Law)
    // Base cons at 14kn = 40t/d
    const baseSpeed = 14;
    const speedFactor = Math.pow(speed / baseSpeed, 3);
    const loadFactor = 0.5 + 0.5 * (cargoLoad / 100); // 50% fixed + 50% variable
    let dailyCons = 40 * speedFactor * loadFactor;

    // 2. Emission Factor (Cf)
    let cf = 3.114; // HFO
    if (fuelType === 'LNG') cf = 2.75;
    if (fuelType === 'Methanol') cf = 1.375; // Green Methanol assumption

    const dailyCo2 = dailyCons * cf;

    // 3. EEOI Calculation
    // EEOI = (Fuel * Cf) / (Cargo * Distance)
    // Distance = Speed * 24
    // Cargo = Capacity * Load%
    const capacity = 50000; // DWT
    const cargo = capacity * (cargoLoad / 100);
    const distance = speed * 24;
    
    // Unit conversion: Fuel(t) * Cf * 10^6 (for grams) / (Cargo(t) * Distance(nm))
    const eeoi = (dailyCo2 * 1000000) / (cargo * distance);

    // 4. CII Rating
    let rating = 'C';
    let color = '#facc15';
    if (eeoi < 8) { rating = 'A'; color = '#10b981'; }
    else if (eeoi < 10) { rating = 'B'; color = '#34d399'; }
    else if (eeoi < 14) { rating = 'C'; color = '#facc15'; }
    else if (eeoi < 18) { rating = 'D'; color = '#f97316'; }
    else { rating = 'E'; color = '#ef4444'; }

    setMetrics({
        eeoi,
        ciiRating: rating,
        fuelCons: dailyCons,
        co2Emission: dailyCo2,
        voyageDist: distance,
        efficiencyColor: color
    });

  }, [speed, cargoLoad, fuelType]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#02040a] text-blue-50 relative overflow-hidden">
      
      {/* Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-blue-800/50 pb-4 px-2 bg-gradient-to-r from-blue-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 uppercase tracking-wider">
             <Ship size={14} className="animate-bounce" /> Energy Efficiency Management
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶能效营运指数 <span className="text-blue-500">(EEOI) 深度分析</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Leaf size={10}/> EEOI (Operational)</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.eeoi.toFixed(2)} <span className="text-sm text-slate-500">g/t·nm</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Target size={10}/> CII Rating</div>
                <div className="text-2xl font-bold px-3 rounded" style={{backgroundColor: `${metrics.efficiencyColor}33`, color: metrics.efficiencyColor}}>
                    {metrics.ciiRating}
                </div>
            </div>
            <div className="flex flex-col items-end border-l border-blue-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Fuel size={10}/> Daily CO₂</div>
                <div className="text-2xl font-mono font-bold text-blue-300">{metrics.co2Emission.toFixed(1)} <span className="text-sm text-slate-500">t</span></div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Engine & Voyage Control */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="航行参数优化" subtitle="CONTROLS" className="flex-1 border-blue-900/50 bg-[#060b14]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Speed Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><Navigation size={12}/> 航速 (Speed)</span>
                              <span className="font-mono">{speed.toFixed(1)} kn</span>
                          </div>
                          <input 
                            type="range" min="8" max="22" step="0.5" 
                            value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Eco (10kn)</span>
                              <span>Full (22kn)</span>
                          </div>
                      </div>

                      {/* Cargo Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-orange-200">
                              <span className="flex items-center gap-2"><Anchor size={12}/> 装载率 (Load)</span>
                              <span className="font-mono">{cargoLoad}%</span>
                          </div>
                          <input 
                            type="range" min="50" max="100" step="5" 
                            value={cargoLoad} onChange={(e) => setCargoLoad(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      {/* Fuel Type */}
                      <div className="space-y-2">
                          <div className="text-xs text-slate-300">燃油类型 (Fuel Type)</div>
                          <div className="flex gap-2">
                              {['HFO', 'LNG', 'Methanol'].map(ft => (
                                  <button 
                                    key={ft}
                                    onClick={() => setFuelType(ft as any)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all
                                        ${fuelType === ft ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}
                                    `}
                                  >
                                      {ft}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded text-xs text-blue-200/80">
                          <strong className="block mb-1 text-white">Advisory:</strong> 
                          Reducing speed by 1 knot will improve CII rating to 'B'.
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="碳强度评级 (CII)" subtitle="GRADE" className="h-[220px] border-blue-900/50">
                  <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                      {/* Rating Scale */}
                      <div className="w-full px-4 space-y-1">
                          {CII_RATING.map(r => (
                              <div key={r.grade} className="flex items-center gap-2 h-6">
                                  <div className="w-6 text-xs font-bold text-center text-slate-300">{r.grade}</div>
                                  <div className="flex-1 bg-slate-800 h-full rounded relative overflow-hidden">
                                      <div className="h-full opacity-50" style={{backgroundColor: r.color, width: '100%'}}></div>
                                      {/* Marker if active */}
                                      {metrics.ciiRating === r.grade && (
                                          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white animate-pulse"></div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Ship */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#02050b] border border-blue-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_80px_rgba(59,130,246,0.15)] group">
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-blue-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-blue-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Voyage Status</div>
                              <div className="text-sm font-bold text-white">EN ROUTE</div>
                          </div>
                      </div>
                  </div>

                  {/* Wake Analysis Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-blue-900 text-[10px] text-slate-300 text-right">
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: metrics.efficiencyColor}}></div> Wake Efficiency</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Exhaust Plume</div>
                  </div>

                  {/* Data passing to scene */}
                  <ThreeScene type="ship-eeoi-analysis" color={metrics.efficiencyColor} data={{ speed: speed, effColor: metrics.efficiencyColor }} />
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
              </div>

              {/* J-Curve (Optimization) */}
              <SciFiCard title="航速-能效优化曲线 (J-Curve)" subtitle="OPTIMIZATION" className="h-[240px] border-blue-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={SPEED_POWER_DATA} margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="speed" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Speed (kn)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'EEOI', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#3b82f6'}} />
                              
                              <Line type="monotone" dataKey="eeoi" stroke="#3b82f6" strokeWidth={2} dot={false} name="EEOI Curve" />
                              
                              {/* Current Operating Point */}
                              <ReferenceLine x={speed} stroke="#facc15" strokeDasharray="3 3" label={{value: 'Current', fill: '#facc15', fontSize: 10}} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Trends & Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* EEOI Trend */}
              <SciFiCard title="24小时能效趋势" subtitle="TREND" className="h-[280px] border-blue-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={EEOI_TREND}>
                              <defs>
                                  <linearGradient id="colorEeoi" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[10, 20]} />
                              <Tooltip contentStyle={{backgroundColor: '#02040a', borderColor: '#3b82f6', color: '#fff'}} />
                              <Area type="monotone" dataKey="eeoi" stroke="#3b82f6" fill="url(#colorEeoi)" strokeWidth={2} name="EEOI" />
                              <Line type="step" dataKey="limit" stroke="#10b981" strokeDasharray="5 5" name="Target" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Factors Breakdown */}
              <SciFiCard title="能效影响因子" className="flex-1 border-blue-900/50">
                  <div className="flex flex-col gap-4 h-full justify-center">
                      
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Hull Resistance</span>
                              <span className="font-bold text-white">High (Bio-fouling)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{width: '75%'}}></div>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Weather Impact</span>
                              <span className="font-bold text-white">Moderate</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500" style={{width: '45%'}}></div>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                              <span>Engine Efficiency</span>
                              <span className="font-bold text-white">Good</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{width: '92%'}}></div>
                          </div>
                      </div>
                      
                      <div className="mt-auto p-2 bg-slate-900/50 rounded border border-slate-700 text-center">
                          <div className="text-[10px] text-slate-500">Suggested Action</div>
                          <div className="text-xs text-blue-300 font-bold">Hull Cleaning Recommended</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
