
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  BarChart, Bar, Cell, Legend, RadialBarChart, RadialBar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Ship, Anchor, Wind, Droplets, Zap, 
  Activity, Gauge, TrendingDown, Leaf, Target,
  Navigation, Fuel, CheckCircle2, AlertTriangle, Snowflake, Globe, Box
} from 'lucide-react';

// --- MOCK DATA ---

// Annual Reduction Trajectory (2020-2030)
const TRAJECTORY_DATA = [
  { year: 2023, limit: 12.0, attained: 11.5 },
  { year: 2024, limit: 11.5, attained: 11.2 },
  { year: 2025, limit: 11.0, attained: 11.4 }, // Slipping
  { year: 2026, limit: 10.5, attained: 10.8 }, // Projected
  { year: 2027, limit: 10.0, attained: 10.2 },
  { year: 2028, limit: 9.5,  attained: 9.8 },
  { year: 2029, limit: 9.0,  attained: 9.4 },
  { year: 2030, limit: 8.5,  attained: 9.0 },
];

const RATING_BOUNDARIES = [
    { grade: 'A', limit: 8.0, color: '#10b981' },
    { grade: 'B', limit: 10.0, color: '#34d399' },
    { grade: 'C', limit: 12.5, color: '#facc15' },
    { grade: 'D', limit: 14.5, color: '#f97316' },
    { grade: 'E', limit: 20.0, color: '#ef4444' },
];

export const ShipCiiView: React.FC = () => {
  // --- STATE ---
  const [dwt, setDwt] = useState(85000); // Deadweight Tonnage
  const [distance, setDistance] = useState(45000); // nm per year
  const [fuelCons, setFuelCons] = useState(12500); // tons per year
  const [fuelType, setFuelType] = useState<'HFO'|'LNG'|'Methanol'>('HFO');
  
  // Correction Factors (Toggles)
  const [isIceClass, setIsIceClass] = useState(false);
  const [isReefer, setIsReefer] = useState(false);
  const [isTanker, setIsTanker] = useState(false);

  const [metrics, setMetrics] = useState({
    attainedCii: 5.2,
    requiredCii: 4.8,
    rating: 'C',
    ratingColor: '#facc15',
    co2Total: 45000
  });

  // CII Calculation Engine
  useEffect(() => {
    // 1. Calculate CO2 Mass
    // Conversion factors (Cf)
    let cf = 3.114; // HFO
    if (fuelType === 'LNG') cf = 2.75;
    if (fuelType === 'Methanol') cf = 1.375;

    let totalCo2 = fuelCons * cf; // Tons of CO2

    // 2. Apply Correction Factors to CO2 (Simplified logic)
    // IMO Guidelines G1-G4
    // Capacity Correction
    let capacityCorrection = 1.0;
    if (isIceClass) capacityCorrection *= 0.95; // Simulating capacity reduction factor
    
    // Emissions Deduction
    let co2Deduction = 0;
    if (isReefer) co2Deduction += totalCo2 * 0.05; // Deduction for reefer consumption
    if (isTanker) co2Deduction += totalCo2 * 0.02; // Deduction for heating/pumping
    
    const correctedCo2 = totalCo2 - co2Deduction;

    // 3. Calculate Attained CII
    // Formula: (CO2 * 10^6) / (Capacity * Distance)
    // Result in grams CO2 / ton-mile
    const cii = (correctedCo2 * 1000000) / (dwt * capacityCorrection * distance);

    // 4. Determine Rating
    // Assume 2024 Reference Line
    // For a Bulk Carrier ~85k DWT
    const refCii = 4.5; // Hypothetical reference
    const reductionFactor = 0.95; // 2024 reduction (5%)
    const requiredCii = refCii * reductionFactor * 2.5; // Just scaling to match inputs for demo logic

    // Rating Bounds (d1, d2, d3, d4 multipliers)
    // A < d1 * req
    // d1 < B < d2 * req
    // d2 < C < d3 * req
    // d3 < D < d4 * req
    // E > d4 * req
    // Using simplified absolute thresholds for demo interactivity
    
    let rating = 'C';
    let color = '#facc15';

    if (cii < 8.0) { rating = 'A'; color = '#10b981'; }
    else if (cii < 10.0) { rating = 'B'; color = '#34d399'; }
    else if (cii < 12.5) { rating = 'C'; color = '#facc15'; }
    else if (cii < 14.5) { rating = 'D'; color = '#f97316'; }
    else { rating = 'E'; color = '#ef4444'; }

    setMetrics({
        attainedCii: cii,
        requiredCii: 12.5, // Using C boundary as requirement for simplicity in UI
        rating,
        ratingColor: color,
        co2Total: totalCo2
    });

  }, [dwt, distance, fuelCons, fuelType, isIceClass, isReefer, isTanker]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020610] text-emerald-50 relative overflow-hidden">
      
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-900/20 via-[#020610] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-teal-800/50 pb-4 px-2 bg-gradient-to-r from-teal-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-1 uppercase tracking-wider">
             <Leaf size={14} className="animate-bounce" /> Decarbonization Compliance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             船舶碳强度指标 <span className="text-teal-500">(CII) 评级分析</span>
          </h1>
        </div>
        
        {/* Rating Badge */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-2 pr-6 rounded border border-teal-500/30">
            <div className={`w-12 h-12 flex items-center justify-center text-3xl font-black text-black rounded shadow-[0_0_20px_currentColor]`} style={{backgroundColor: metrics.ratingColor, color: '#000'}}>
                {metrics.rating}
            </div>
            <div>
                <div className="text-[10px] text-slate-400 uppercase">Current Rating</div>
                <div className="text-sm font-bold text-white" style={{color: metrics.ratingColor}}>
                    {metrics.rating === 'A' ? 'Superior' : 
                     metrics.rating === 'B' ? 'Good' :
                     metrics.rating === 'C' ? 'Compliant' :
                     metrics.rating === 'D' ? 'Minor Correction' : 'Major Correction'}
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Dashboard & Grade Scale */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Core Values */}
              <SciFiCard title="指标概览" subtitle="METRICS" className="flex-1 border-teal-900/50 bg-[#06141a]/80">
                  <div className="flex flex-col gap-6 p-2 h-full justify-center">
                      <div className="text-center">
                          <div className="text-xs text-slate-400 uppercase mb-1">Attained CII (gCO₂/t·nm)</div>
                          <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                              {metrics.attainedCii.toFixed(2)}
                          </div>
                      </div>
                      
                      <div className="w-full h-[1px] bg-slate-700"></div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                              <div className="text-[10px] text-slate-500">Required (C-Limit)</div>
                              <div className="text-lg font-mono text-teal-400">12.50</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-slate-500">Total Emissions</div>
                              <div className="text-lg font-mono text-orange-400">{(metrics.co2Total/1000).toFixed(1)}k t</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Rating Spectrum Visualizer */}
              <SciFiCard title="评级区间分布" subtitle="BENCHMARK" className="h-[300px] border-teal-900/50">
                  <div className="w-full h-full flex flex-col justify-between py-2 relative">
                      {RATING_BOUNDARIES.map((b, i) => {
                          const prevLimit = i === 0 ? 0 : RATING_BOUNDARIES[i-1].limit;
                          const heightPct = 100 / 5;
                          const isCurrent = metrics.rating === b.grade;
                          
                          return (
                              <div key={b.grade} className="flex items-center gap-2 h-full relative group">
                                  {/* Label */}
                                  <div className={`w-8 font-bold text-center ${isCurrent ? 'text-white scale-125' : 'text-slate-500'} transition-all`}>{b.grade}</div>
                                  
                                  {/* Bar Segment */}
                                  <div className="flex-1 h-[80%] rounded relative overflow-visible" style={{backgroundColor: `${b.color}22`, borderLeft: `4px solid ${b.color}`}}>
                                      {/* Threshold Label */}
                                      <div className="absolute -top-3 right-1 text-[8px] text-slate-600 font-mono">{b.limit}</div>
                                  </div>

                                  {/* Pointer if active */}
                                  {isCurrent && (
                                      <div className="absolute left-8 w-[calc(100%-40px)] h-[2px] bg-white z-10 flex items-center">
                                          <div className="w-2 h-2 bg-white rounded-full -ml-1"></div>
                                          <div className="ml-auto text-xs font-bold text-white bg-black/50 px-1 rounded backdrop-blur">
                                              {metrics.attainedCii.toFixed(2)}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )
                      })}
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Visualization */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#02050b] border border-teal-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(20,184,166,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-teal-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Globe size={16} className="text-teal-400 animate-spin-slow" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Voyage Simulation</div>
                              <div className="text-sm font-bold text-white">Global Route</div>
                          </div>
                      </div>
                  </div>

                  {/* 3D Scene */}
                  <ThreeScene type="ship-cii-analysis" color="#10b981" />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-teal-900 text-[10px] text-slate-300 text-right">
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Efficient (A-B)</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Baseline (C)</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Non-Compliant (D-E)</div>
                  </div>
              </div>

              {/* Trajectory Chart */}
              <SciFiCard title="年度减排轨迹 (Reduction Pathway)" subtitle="2023-2030" className="h-[220px] border-teal-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={TRAJECTORY_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#11272d" vertical={false} />
                              <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[0, 14]} label={{ value: 'CII', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#020610', borderColor: '#10b981'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              <Area type="step" dataKey="limit" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Required CII (Limit)" />
                              <Line type="monotone" dataKey="attained" stroke="#facc15" strokeWidth={2} dot={{r:3}} name="Proj. Attained" />
                              <ReferenceLine y={12.5} stroke="#334155" strokeDasharray="3 3" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Scenario Simulator */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="情景模拟器 (Simulator)" subtitle="PARAMETERS" className="flex-1 border-teal-900/50">
                  <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
                      
                      {/* Fuel */}
                      <div className="space-y-2">
                          <div className="text-xs text-slate-300 flex justify-between">
                              <span>Fuel Type</span>
                              <span className="text-teal-400">{fuelType}</span>
                          </div>
                          <div className="flex gap-1">
                              {['HFO', 'LNG', 'Methanol'].map(f => (
                                  <button 
                                    key={f}
                                    onClick={() => setFuelType(f as any)}
                                    className={`flex-1 py-1 text-[10px] rounded border ${fuelType === f ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                  >
                                      {f}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Sliders */}
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Distance (nm)</span>
                              <span className="text-white">{distance.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="20000" max="80000" step="1000" 
                            value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Fuel Cons. (t)</span>
                              <span className="text-white">{fuelCons.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="5000" max="25000" step="500" 
                            value={fuelCons} onChange={(e) => setFuelCons(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                      </div>

                      {/* Correction Factors */}
                      <div className="pt-2 border-t border-slate-800">
                          <div className="text-xs font-bold text-slate-300 mb-2">Correction Factors (G1-G4)</div>
                          <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                                  <div className="flex items-center gap-2">
                                      <Snowflake size={14} className="text-cyan-200" />
                                      <span className="text-[10px] text-slate-300">Ice Class</span>
                                  </div>
                                  <input type="checkbox" checked={isIceClass} onChange={(e) => setIsIceClass(e.target.checked)} className="accent-teal-500" />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                                  <div className="flex items-center gap-2">
                                      <Box size={14} className="text-blue-200" />
                                      <span className="text-[10px] text-slate-300">Reefer Cargo</span>
                                  </div>
                                  <input type="checkbox" checked={isReefer} onChange={(e) => setIsReefer(e.target.checked)} className="accent-teal-500" />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700">
                                  <div className="flex items-center gap-2">
                                      <Droplets size={14} className="text-purple-200" />
                                      <span className="text-[10px] text-slate-300">Tanker Heating</span>
                                  </div>
                                  <input type="checkbox" checked={isTanker} onChange={(e) => setIsTanker(e.target.checked)} className="accent-teal-500" />
                              </div>
                          </div>
                      </div>

                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
