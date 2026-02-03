
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter
} from 'recharts';
import { 
  Wind, Fan, Gauge, Activity, Zap, 
  Settings, AlertTriangle, ArrowRight, 
  Thermometer, Maximize
} from 'lucide-react';

// --- MOCK DATA ---

// P-Q Curve (Pressure vs Quantity)
// Static characteristic curve + Dynamic operating point
const PQ_CURVE_DATA = Array.from({length: 20}, (_, i) => {
    const q = i * 500; // m3/min
    // Quadratic drop for fan pressure: P = Pmax - k*Q^2
    const p = 3500 - 0.00005 * q * q; 
    // Resistance curve (System): P = R*Q^2
    const r = 0.00003 * q * q;
    return { q, p: Math.max(0, p), r };
});

// Efficiency Trend
const EFF_TREND = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    eff: 82 + Math.sin(i * 0.3) * 5 + Math.random(),
    leakage: 3 + Math.random()
}));

export const VentilationEfficiencyView: React.FC = () => {
  // --- STATE ---
  const [fanFreq, setFanFreq] = useState(45.0); // Hz
  const [bladeAngle, setBladeAngle] = useState(30); // Deg
  const [metrics, setMetrics] = useState({
    totalFlow: 8500, // m3/min
    effectiveFlow: 7850, // m3/min
    staticPressure: 2850, // Pa
    efficiency: 84.5, // %
    leakageRate: 4.2, // %
    power: 450 // kW
  });

  // Simulation Logic
  useEffect(() => {
    // Freq affects Flow linearly, Pressure quadratically, Power cubically
    const ratio = fanFreq / 50.0;
    
    setMetrics(prev => ({
        totalFlow: 9000 * ratio + (Math.random()-0.5)*100,
        effectiveFlow: 9000 * ratio * 0.92 + (Math.random()-0.5)*100,
        staticPressure: 3200 * ratio * ratio,
        efficiency: 85 - Math.abs(45 - fanFreq) * 0.5, // Peak at 45Hz
        leakageRate: 4.0 + (Math.random()-0.5)*0.2,
        power: 500 * ratio * ratio * ratio
    }));
  }, [fanFreq]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#020617] text-cyan-50 relative overflow-hidden">
      
      {/* Background Flow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#020617] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-cyan-800/50 pb-4 px-2 bg-gradient-to-r from-cyan-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Wind size={14} className="animate-pulse" /> Mine Air Network Optimization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             通风系统 <span className="text-cyan-500">风量有效率分析</span>
          </h1>
        </div>
        
        {/* Fan Control */}
        <div className="flex items-center gap-6 bg-slate-900/60 p-2 rounded border border-cyan-600/30">
            <div className="flex flex-col w-40 gap-1 px-2">
                <div className="flex justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1"><Zap size={10}/> Frequency</span>
                    <span className="text-cyan-400 font-mono">{fanFreq.toFixed(1)} Hz</span>
                </div>
                <input 
                  type="range" min="30" max="50" step="0.5" 
                  value={fanFreq} onChange={(e) => setFanFreq(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right px-2">
                <div className="text-[10px] text-slate-400 uppercase">Effective Rate</div>
                <div className="text-2xl font-mono font-bold text-green-400">{(metrics.effectiveFlow/metrics.totalFlow*100).toFixed(1)}%</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Fan Characteristic & Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="主扇工况点 (P-Q Curve)" subtitle="AERODYNAMICS" className="h-[300px] border-cyan-900/50 bg-[#08101a]/80" noPadding>
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={PQ_CURVE_DATA} margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="q" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Q (m³/min)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'P (Pa)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#22d3ee'}} />
                              <Line type="monotone" dataKey="p" stroke="#22d3ee" strokeWidth={2} dot={false} name="Fan Curve" />
                              <Line type="monotone" dataKey="r" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" name="System Curve" />
                              {/* Operating Point */}
                              <Scatter data={[{q: metrics.totalFlow, p: metrics.staticPressure}]} fill="#facc15" shape="cross" r={6} />
                          </ComposedChart>
                      </ResponsiveContainer>
                      <div className="absolute top-2 right-2 text-[10px] text-cyan-300 bg-cyan-900/30 px-2 rounded">
                          Stall Margin: OK
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="通风机运行参数" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-4 h-full justify-center">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs text-slate-400 flex items-center gap-2"><Fan size={14}/> Main Fan #1</span>
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">RUNNING</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                              <div className="text-[10px] text-slate-500">Static Pres</div>
                              <div className="text-lg font-bold text-white">{metrics.staticPressure.toFixed(0)} Pa</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                              <div className="text-[10px] text-slate-500">Power</div>
                              <div className="text-lg font-bold text-yellow-400">{metrics.power.toFixed(0)} kW</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                              <div className="text-[10px] text-slate-500">Vibration</div>
                              <div className="text-lg font-bold text-green-400">1.2 mm/s</div>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                              <div className="text-[10px] text-slate-500">Temp</div>
                              <div className="text-lg font-bold text-white">52 °C</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Network Twin */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050505] border border-cyan-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(34,211,238,0.15)] group">
                  
                  {/* HUD Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-cyan-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-cyan-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Network Health</div>
                              <div className="text-sm font-bold text-white">OPTIMAL</div>
                          </div>
                      </div>
                  </div>

                  {/* Flow Legend */}
                  <div className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded border border-cyan-900 text-[10px] text-slate-300 text-right">
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Fresh Air</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Face Air</div>
                      <div className="flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Return Air</div>
                  </div>

                  <ThreeScene type="ventilation-efficiency-analysis" color="#22d3ee" />
              </div>

              {/* Bottom: Efficiency Trend */}
              <SciFiCard title="主扇效率与漏风率趋势" subtitle="24H" className="h-[220px] border-cyan-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={EFF_TREND}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={2} />
                              <YAxis yAxisId="left" stroke="#22d3ee" tick={{fontSize: 10}} domain={[60, 100]} />
                              <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{fontSize: 10}} domain={[0, 10]} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#22d3ee'}} />
                              <Area yAxisId="left" type="monotone" dataKey="eff" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} name="Efficiency %" />
                              <Line yAxisId="right" type="monotone" dataKey="leakage" stroke="#f97316" strokeWidth={2} dot={false} name="Leakage %" />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Air Quality & Leakage */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Face Air Quality */}
              <SciFiCard title="工作面风量监测" subtitle="REAL-TIME" className="flex-1 border-cyan-900/50">
                  <div className="flex flex-col gap-3">
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-white">Face 1301 (Coal)</span>
                              <span className="text-[10px] text-green-400">Normal</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Req: 1200 m³/min</span>
                              <span>Act: 1250 m³/min</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full" style={{width: '100%'}}></div>
                          </div>
                      </div>

                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded">
                          <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-white">Heading 204 (Rock)</span>
                              <span className="text-[10px] text-yellow-400">Low Flow</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Req: 400 m³/min</span>
                              <span>Act: 380 m³/min</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-yellow-500 h-full" style={{width: '90%'}}></div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              {/* Leakage Diagnosis */}
              <SciFiCard title="漏风诊断 (Short Circuits)" subtitle="DIAGNOSTICS" className="h-[250px] border-cyan-900/50">
                  <div className="flex flex-col h-full gap-2">
                      <div className="flex items-center gap-2 p-2 border-l-2 border-red-500 bg-slate-900/30">
                          <AlertTriangle size={14} className="text-red-500"/>
                          <div className="text-xs">
                              <div className="font-bold text-white">Door #4 Leak</div>
                              <div className="text-[9px] text-slate-400">Est. Loss: 120 m³/min</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 border-l-2 border-yellow-500 bg-slate-900/30">
                          <AlertTriangle size={14} className="text-yellow-500"/>
                          <div className="text-xs">
                              <div className="font-bold text-white">Regulator #2 Drift</div>
                              <div className="text-[9px] text-slate-400">Pressure drop variance</div>
                          </div>
                      </div>
                      
                      <div className="mt-auto bg-cyan-900/10 p-2 rounded text-center border border-cyan-800/30">
                          <div className="text-[10px] text-slate-400">Total Leakage Rate</div>
                          <div className={`text-xl font-bold ${metrics.leakageRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                              {metrics.leakageRate.toFixed(2)}%
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
