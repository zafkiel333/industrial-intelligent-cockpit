
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ThreeScene } from '../../components/ThreeScene';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, ScatterChart, Scatter,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  Zap, Repeat, Activity, ArrowUp, ArrowDown, 
  Settings, BatteryCharging, TrendingUp, Gauge
} from 'lucide-react';

// --- MOCK DATA ---

// Loss Waterfall
// Start: 100% -> Hydraulic (-8%) -> Mechanical (-3%) -> Electrical (-4%) -> Aux (-2%) -> End: 83%
const LOSS_DATA = [
  { name: 'Input Energy', value: 100, type: 'Base' },
  { name: 'Hydraulic Loss', value: -8.5, type: 'Loss' },
  { name: 'Mechanical Loss', value: -2.5, type: 'Loss' },
  { name: 'Electrical Loss', value: -3.5, type: 'Loss' },
  { name: 'Auxiliary Loss', value: -1.5, type: 'Loss' },
  { name: 'Output Energy', value: 84.0, type: 'Result' },
];

// Daily Cycle (Gen vs Pump Power)
const CYCLE_DATA = Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    gen: i > 8 && i < 20 ? 300 + Math.sin(i*0.5)*50 : 0,
    pump: i < 7 || i > 22 ? -320 + Math.sin(i*0.5)*20 : 0,
    price: 300 + Math.sin((i-12)/6)*100
}));

export const PumpedStorageEfficiencyView: React.FC = () => {
  // --- STATE ---
  const [mode, setMode] = useState<'GEN' | 'PUMP' | 'IDLE'>('GEN');
  const [powerSet, setPowerSet] = useState(300); // MW
  const [head, setHead] = useState(540); // m
  
  const [metrics, setMetrics] = useState({
    flow: 65.2, // m3/s
    cycleEff: 83.5, // %
    energyRatio: 0.78, // E_gen / E_pump
    waterRate: 2.1, // m3/kWh
    profit: 2450 // $/h
  });

  // Physics Simulation
  useEffect(() => {
    // Efficiencies
    const etaT = 0.92; // Turbine
    const etaP = 0.91; // Pump
    const etaM = 0.98; // Motor/Gen
    const etaTrans = 0.99;

    let flow = 0;
    let eff = 0;
    
    if (mode === 'GEN') {
        // P = 9.81 * Q * H * eta
        // Q = P / (...)
        const totalEff = etaT * etaM * etaTrans;
        flow = (powerSet * 1000) / (9.81 * head * totalEff);
        eff = totalEff * 100;
    } else if (mode === 'PUMP') {
        // P = 9.81 * Q * H / eta
        // Q = P * eta / (...)
        const totalEff = etaP * etaM * etaTrans;
        flow = (powerSet * 1000 * totalEff) / (9.81 * head);
        eff = totalEff * 100;
    }

    setMetrics({
        flow: flow,
        cycleEff: eff, // Instantaneous
        energyRatio: 0.78 + (Math.random()-0.5)*0.01,
        waterRate: mode === 'GEN' ? flow * 3.6 / powerSet : 0,
        profit: mode === 'GEN' ? powerSet * 80 : -powerSet * 40
    });

  }, [mode, powerSet, head]);

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] bg-[#022c22] text-emerald-50 relative overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#022c22] to-black pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex items-end justify-between border-b border-emerald-800/50 pb-4 px-2 bg-gradient-to-r from-emerald-950/80 to-transparent pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 uppercase tracking-wider">
             <Repeat size={14} className="animate-spin-slow" /> Energy Reversion Cycle
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             抽水蓄能 <span className="text-emerald-500">综合转换效率分析</span>
          </h1>
        </div>
        
        {/* Top KPIs */}
        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Activity size={10}/> Instant Efficiency</div>
                <div className="text-2xl font-mono font-bold text-white">{metrics.cycleEff.toFixed(1)} <span className="text-sm text-slate-500">%</span></div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><Zap size={10}/> Energy Ratio (EGL)</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{metrics.energyRatio.toFixed(3)}</div>
            </div>
            <div className="flex flex-col items-end border-l border-emerald-900/40 pl-6">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1"><TrendingUp size={10}/> Net Profit</div>
                <div className={`text-2xl font-mono font-bold ${metrics.profit > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {metrics.profit > 0 ? '+' : ''}{metrics.profit.toFixed(0)} <span className="text-sm text-slate-500">$/h</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10 p-2">
          
          {/* LEFT: Simulation Controls */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              <SciFiCard title="工况仿真控制" subtitle="MODE SELECT" className="flex-1 border-emerald-900/50 bg-[#061811]/80">
                  <div className="flex flex-col gap-6 p-2">
                      {/* Mode Toggle */}
                      <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700">
                          <button 
                            onClick={() => setMode('PUMP')}
                            className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                                ${mode === 'PUMP' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                            `}
                          >
                              <ArrowUp size={14}/> PUMP
                          </button>
                          <button 
                            onClick={() => setMode('IDLE')}
                            className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                                ${mode === 'IDLE' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                            `}
                          >
                              IDLE
                          </button>
                          <button 
                            onClick={() => setMode('GEN')}
                            className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all
                                ${mode === 'GEN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}
                            `}
                          >
                              <ArrowDown size={14}/> GEN
                          </button>
                      </div>

                      {/* Power Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-emerald-200">
                              <span className="flex items-center gap-2"><Zap size={12}/> 功率设定 (Power Set)</span>
                              <span className="font-mono">{powerSet} MW</span>
                          </div>
                          <input 
                            type="range" min="0" max="350" step="5" 
                            value={powerSet} onChange={(e) => setPowerSet(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                      </div>

                      {/* Head Slider */}
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs text-blue-200">
                              <span className="flex items-center gap-2"><Gauge size={12}/> 水头 (Gross Head)</span>
                              <span className="font-mono">{head} m</span>
                          </div>
                          <input 
                            type="range" min="500" max="600" step="1" 
                            value={head} onChange={(e) => setHead(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-800/30 rounded text-xs text-emerald-200/80">
                          <div className="flex justify-between mb-1">
                              <span>Flow Rate</span>
                              <span className="text-white font-bold">{metrics.flow.toFixed(1)} m³/s</span>
                          </div>
                          <div className="flex justify-between">
                              <span>Specific Consumption</span>
                              <span className="text-white font-bold">{metrics.waterRate.toFixed(2)} m³/kWh</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

              <SciFiCard title="转换效率仪表" subtitle="GAUGE" className="h-[220px] border-emerald-900/50">
                  <div className="flex flex-col items-center justify-center h-full relative">
                      <div className="relative w-40 h-40">
                          {/* Gauge Arc */}
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                              <path d="M 15 85 A 50 50 0 1 1 85 85" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                              <path d="M 15 85 A 50 50 0 1 1 85 85" fill="none" stroke={mode === 'GEN' ? '#10b981' : '#3b82f6'} strokeWidth="8" strokeLinecap="round" 
                                    strokeDasharray="220" strokeDashoffset={220 - (220 * (metrics.cycleEff - 50) / 50)} 
                                    className="transition-all duration-500" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                              <span className="text-3xl font-bold text-white">{metrics.cycleEff.toFixed(1)}%</span>
                              <span className="text-[10px] text-slate-400 uppercase">System Eff</span>
                          </div>
                      </div>
                  </div>
              </SciFiCard>

          </div>

          {/* CENTER: 3D Energy Loop */}
          <div className="flex-1 flex flex-col gap-5 relative">
              
              {/* Main 3D Container */}
              <div className="flex-1 bg-[#020508] border border-emerald-800/40 relative rounded-lg overflow-hidden shadow-[inset_0_0_60px_rgba(16,185,129,0.15)] group">
                  
                  {/* HUD */}
                  <div className="absolute top-4 left-4 z-20 flex gap-4">
                      <div className="bg-black/60 backdrop-blur border border-emerald-500/30 px-3 py-2 rounded flex items-center gap-3">
                          <BatteryCharging size={16} className={mode !== 'IDLE' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
                          <div>
                              <div className="text-[10px] text-slate-400 uppercase">Operation State</div>
                              <div className="text-sm font-bold text-white">{mode === 'GEN' ? 'GENERATING' : mode === 'PUMP' ? 'PUMPING' : 'STANDBY'}</div>
                          </div>
                      </div>
                  </div>

                  {/* Flow Legend */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 p-2 rounded border border-emerald-900 text-[10px] text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Pumping Flow (Up)</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Generating Flow (Down)</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Loss Hotspot</div>
                  </div>

                  {/* Pass simulation state to 3D scene via 'data' prop logic in ThreeScene or context */}
                  {/* Here we assume ThreeScene wrapper handles it or we pass via key to reset, but better to pass props. 
                      Since ThreeScene interface is generic, we'll rely on the global state in this view being reflected 
                      if we could pass it. For now, the animation loop in builder reads from a ref or similar if we modify it.
                      Actually, let's pass a data object to ThreeScene if we modify it to accept one.
                      *Self-Correction*: The ThreeScene component provided doesn't accept a data prop. 
                      I will update ThreeScene to accept 'data' prop to pass mode to the builder.
                  */}
                  <ThreeScene type="pumped-storage-efficiency-analysis" color="#10b981" data={{ mode, efficiency: metrics.cycleEff / 100 }} />
              </div>

              {/* Cycle Curve Chart */}
              <SciFiCard title="日工况循环曲线 (Daily Cycle)" subtitle="MW" className="h-[220px] border-emerald-900/50" noPadding>
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={CYCLE_DATA}>
                              <defs>
                                  <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="pumpGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 10}} interval={3} />
                              <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#10b981'}} />
                              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              
                              <Area type="monotone" dataKey="gen" name="Generation" stroke="#facc15" fill="url(#genGrad)" />
                              <Area type="monotone" dataKey="pump" name="Pumping" stroke="#3b82f6" fill="url(#pumpGrad)" />
                              <Line type="step" dataKey="price" name="Price ($)" stroke="#10b981" strokeDasharray="3 3" dot={false} yAxisId={0} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

          </div>

          {/* RIGHT: Loss Analysis */}
          <div className="w-full lg:w-1/4 flex flex-col gap-5">
              
              {/* Loss Waterfall */}
              <SciFiCard title="转换损失分解 (Waterfall)" subtitle="EFFICIENCY LOSS" className="flex-1 border-emerald-900/50">
                  <div className="w-full h-full p-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={LOSS_DATA} layout="vertical" margin={{left: 20}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} domain={[80, 100]} />
                              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} tick={{fontSize: 10}} />
                              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#02040a', borderColor: '#10b981'}} />
                              <Bar dataKey="value" barSize={15} radius={[0, 4, 4, 0]}>
                                  {LOSS_DATA.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.type === 'Base' ? '#94a3b8' : entry.type === 'Result' ? '#10b981' : '#ef4444'} />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </SciFiCard>

              {/* Loss Details */}
              <SciFiCard title="损失因子分析" className="h-[240px] border-emerald-900/50">
                  <div className="flex flex-col gap-3 h-full justify-center">
                      <div className="flex justify-between items-center text-xs p-2 bg-emerald-900/20 border border-emerald-800 rounded">
                          <span className="text-slate-300">Hydraulic Friction</span>
                          <span className="text-red-400 font-bold">-8.5%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs p-2 bg-emerald-900/20 border border-emerald-800 rounded">
                          <span className="text-slate-300">Motor/Gen Heat</span>
                          <span className="text-red-400 font-bold">-3.5%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs p-2 bg-emerald-900/20 border border-emerald-800 rounded">
                          <span className="text-slate-300">Transformer</span>
                          <span className="text-yellow-400 font-bold">-0.8%</span>
                      </div>
                      
                      <div className="mt-2 text-center text-[10px] text-slate-500">
                          Penstock friction is the largest loss factor.
                      </div>
                  </div>
              </SciFiCard>

          </div>

      </div>
    </div>
  );
};
