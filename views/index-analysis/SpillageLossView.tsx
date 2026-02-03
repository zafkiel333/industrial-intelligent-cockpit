
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Droplets, Zap, Activity, Waves, DollarSign, 
  TrendingDown, AlertTriangle, CloudRain, Minimize2
} from 'lucide-react';

// --- MOCK DATA ---

// Annual Spillage Trend
const SPILLAGE_TREND = Array.from({length: 12}, (_, i) => ({
    month: `${i+1}月`,
    inflow: 1500 + Math.sin(i * 0.5) * 800 + Math.random() * 200,
    turbineFlow: 1800, // Capacity
    spill: 0 // Calculated later
})).map(d => ({
    ...d,
    spill: Math.max(0, d.inflow - d.turbineFlow)
}));

// Loss Breakdown Radar
const LOSS_REASONS = [
    { subject: 'Grid Constraint', A: 85, fullMark: 100 },
    { subject: 'Flood Control', A: 60, fullMark: 100 },
    { subject: 'Maintenance', A: 40, fullMark: 100 },
    { subject: 'Forecast Error', A: 30, fullMark: 100 },
    { subject: 'Head Limit', A: 20, fullMark: 100 },
];

export const SpillageLossView: React.FC = () => {
  // --- STATE ---
  const [inflow, setInflow] = useState(2200); // m3/s
  const [turbineCap, setTurbineCap] = useState(1800); // m3/s
  const [waterHead, setWaterHead] = useState(85.0); // m
  const [elecPrice, setElecPrice] = useState(0.35); // $/kWh

  const [metrics, setMetrics] = useState({
    spillFlow: 0,
    spillRatio: 0,
    powerLoss: 0, // MW
    energyLossDay: 0, // MWh
    economicLoss: 0 // $
  });

  // Physics & Economics Calculation
  useEffect(() => {
    const spill = Math.max(0, inflow - turbineCap);
    const ratio = (spill / inflow) * 100;
    
    // P = 9.81 * Q * H * eta (assume eta=0.9) / 1000 for MW
    const pLoss = (9.81 * spill * waterHead * 0.9) / 1000;
    
    // E = P * 24h
    const eLoss = pLoss * 24;
    
    // $ = E * Price * 1000 (MWh to kWh)
    const moneyLoss = eLoss * 1000 * elecPrice;

    setMetrics({
        spillFlow: spill,
        spillRatio: ratio,
        powerLoss: pLoss,
        energyLossDay: eLoss,
        economicLoss: moneyLoss
    });

  }, [inflow, turbineCap, waterHead, elecPrice]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#0f0518] text-rose-50 relative overflow-hidden">
      
      {/* Background Flow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-[#0f0518] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-rose-800/50 pb-4 px-2 bg-gradient-to-r from-rose-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 mb-1 uppercase tracking-wider">
             <Droplets size={14} className="animate-bounce" /> Hydropower Optimization
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             机组弃水 <span className="text-rose-500">损失电量分析</span>
          </h1>
        </div>
        
        {/* Real-time Loss Ticker */}
        <div className="flex items-center gap-6 bg-slate-900/60 p-2 rounded border border-rose-600/30">
            <div className="text-right px-4">
                <div className="text-[10px] text-slate-400 uppercase">Spillage Flow</div>
                <div className={`text-2xl font-mono font-bold ${metrics.spillFlow > 0 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {metrics.spillFlow.toFixed(0)} <span className="text-sm text-slate-500">m³/s</span>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-700"></div>
            <div className="text-right px-4">
                <div className="text-[10px] text-slate-400 uppercase">Economic Loss (Daily)</div>
                <div className="text-2xl font-mono font-bold text-white">
                    <span className="text-xs text-rose-400">$</span> {(metrics.economicLoss/1000).toFixed(1)}k
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Simulation Inputs */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="水力调度仿真 (Simulation)" subtitle="INPUTS" className="flex-1 border-rose-900/50 bg-[#1a0508]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Inflow Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-300">
                              <span className="flex items-center gap-2"><CloudRain size={12}/> 入库流量 (Inflow)</span>
                              <span className="font-mono">{inflow.toFixed(0)} m³/s</span>
                          </div>
                          <input 
                            type="range" min="1000" max="3000" step="50" 
                            value={inflow} onChange={(e) => setInflow(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      {/* Turbine Cap Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-green-300">
                              <span className="flex items-center gap-2"><Zap size={12}/> 机组通流能力 (Cap)</span>
                              <span className="font-mono">{turbineCap.toFixed(0)} m³/s</span>
                          </div>
                          <input 
                            type="range" min="1000" max="2500" step="50" 
                            value={turbineCap} onChange={(e) => setTurbineCap(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                      </div>

                      {/* Water Head */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-cyan-300">
                              <span className="flex items-center gap-2"><Waves size={12}/> 水头 (Head)</span>
                              <span className="font-mono">{waterHead} m</span>
                          </div>
                          <input 
                            type="range" min="50" max="120" step="1" 
                            value={waterHead} onChange={(e) => setWaterHead(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                      </div>

                      {/* Result Box */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-rose-900/20 p-2 rounded border border-rose-800/30">
                              <div className="text-[10px] text-slate-400">Power Loss</div>
                              <div className="text-lg font-bold text-white">{metrics.powerLoss.toFixed(1)} MW</div>
                          </div>
                          <div className="bg-rose-900/20 p-2 rounded border border-rose-800/30">
                              <div className="text-[10px] text-slate-400">Spill Ratio</div>
                              <div className="text-lg font-bold text-rose-400">{metrics.spillRatio.toFixed(1)} %</div>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="弃水原因分析" subtitle="ROOT CAUSE" className="h-[220px] border-rose-900/50">
                  <div className="w-full h-full p-2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={LOSS_REASONS}>
                              <PolarGrid stroke="#4c0519" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#fda4af', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Impact" dataKey="A" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.4} />
                              <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#f43f5e', color: '#fff'}} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: Digital Twin Spillway */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#050204] border border-rose-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(244,63,94,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-rose-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <Activity size={16} className="text-rose-400 animate-pulse" />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Spillway Status</div>
                              <div className={`text-sm font-bold ${metrics.spillFlow > 0 ? 'text-white' : 'text-slate-500'}`}>
                                  {metrics.spillFlow > 0 ? 'DISCHARGING' : 'CLOSED'}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Warning Overlay */}
                  {metrics.spillFlow > 500 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          <div className="flex flex-col items-center animate-pulse">
                              <AlertTriangle size={48} className="text-red-500" />
                              <div className="text-red-500 font-bold text-xl mt-2 bg-black/50 px-4 py-1 rounded">HIGH ENERGY DISSIPATION</div>
                          </div>
                      </div>
                  )}

                  <ThreeScene type="spillage-loss-analysis" color="#f43f5e" />
              </div>

          </div>

          {/* RIGHT: Trend & Economics */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Spillage Trend Chart */}
              <SciFiCard title="入库与弃水流量趋势 (Annual)" subtitle="m³/s" className="h-[280px] border-rose-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SPILLAGE_TREND}>
                              <defs>
                                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorSpill" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#331c09" vertical={false} />
                              <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 10}} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#0f0518', borderColor: '#f43f5e', color: '#fff'}} />
                              <Area type="monotone" dataKey="inflow" stroke="#3b82f6" fill="url(#colorIn)" name="Inflow" />
                              <Area type="monotone" dataKey="spill" stroke="#f43f5e" fill="url(#colorSpill)" name="Spill" />
                              <ReferenceLine y={turbineCap} stroke="#10b981" strokeDasharray="3 3" label={{value: 'Cap', fill: '#10b981', fontSize: 10}} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Economic Summary */}
              <SciFiCard title="损失价值评估" subtitle="ECONOMIC" className="flex-1 border-rose-900/50">
                  <div className="flex flex-col h-full gap-4">
                      <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Electricity Price</span>
                          <span className="text-white font-mono">${elecPrice} /kWh</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-rose-900/20 rounded border border-rose-800/30">
                          <div>
                              <div className="text-xs text-slate-400">Lost Energy (YTD)</div>
                              <div className="text-xl font-bold text-white">45.2 GWh</div>
                          </div>
                          <DollarSign size={24} className="text-rose-500" />
                      </div>

                      <div className="mt-auto">
                          <div className="text-[10px] text-slate-500 mb-1">Optimization Potential</div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full w-[65%]"></div>
                          </div>
                          <div className="text-right text-xs text-green-400 mt-1">Save 65% via Load Shifting</div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
